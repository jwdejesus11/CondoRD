"use client";

import { useEffect, useState } from "react";
import { 
  DollarSign, PieChart, Plus, ArrowUpRight, ArrowDownRight, 
  Download, Filter, Search, ChevronRight, Loader2, CreditCard, Save, AlertCircle, CheckCircle2, Zap
} from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import { Modal } from "@/components/Modal";

/**
 * Utility de renderizado seguro para importes.
 * Backend envía la VERDAD (número o null).
 * Frontend garantiza PRESENTACIÓN (0 si no es válido).
 */
const safeFormat = (val: any) => {
  const n = Number(val);
  return (Number.isFinite(n) ? n : 0).toLocaleString();
};

const safeNumber = (val: any) => {
  const n = Number(val);
  return Number.isFinite(n) ? n : 0;
};

export default function FinancieroPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [balance, setBalance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [msgModal, setMsgModal] = useState<{isOpen: boolean, title: string, body: string, type: 'success' | 'error' | 'confirm'}>({
    isOpen: false, title: "", body: "", type: 'confirm'
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        fetchWithAuth("/financial/invoices/all"),
        fetchWithAuth("/financial/balance/all"),
        fetchWithAuth("/financial/accounts-payable"),
      ]);

      const [invRes, balRes, apRes] = results;

      // Facturas
      if (invRes.status === 'fulfilled') {
        setInvoices(invRes.value || []);
      }

      // Balance General
      if (balRes.status === 'fulfilled') {
        const bal = balRes.value;
        setBalance((prev: any) => ({ ...prev, total: bal?.total }));
      }

      // Cuentas por Pagar (Servicios)
      if (apRes.status === 'fulfilled') {
        const ap = apRes.value || [];
        const apTotal = ap.reduce((acc: number, item: any) => 
          acc + (item.estado === 'PENDIENTE' ? safeNumber(item.monto) : 0), 0
        );
        setBalance((prev: any) => ({ ...prev, apTotal }));
      }

      // Si todos fallaron, mostrar error
      if (results.every(r => r.status === 'rejected')) {
        setMsgModal({
          isOpen: true,
          title: "Fallo de Integración",
          body: "No se pudieron recuperar los datos financieros del servidor.",
          type: 'error'
        });
      }

    } catch (err: any) {
      console.error("Error en LoadData:", err);
      setMsgModal({
        isOpen: true,
        title: "Error",
        body: err.message || "Error al sincronizar datos financieros.",
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const initiateGenerate = () => {
    setMsgModal({
        isOpen: true,
        title: "Emisión de Cuotas",
        body: "¿Desea iniciar la generación masiva de facturas para el periodo actual?",
        type: 'confirm'
    });
  };

  const handleGenerate = async () => {
    setMsgModal(prev => ({ ...prev, isOpen: false }));
    setActionLoading(true);
    try {
      const now = new Date();
      const periodo = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const result = await fetchWithAuth("/financial/generate-period", {
        method: "POST",
        body: JSON.stringify({ periodo }),
      });
      setMsgModal({
        isOpen: true,
        title: "Éxito",
        body: `Operación completada: ${result.generated} facturas generadas.`,
        type: 'success'
      });
      loadData();
    } catch (err: any) {
      setMsgModal({
        isOpen: true,
        title: "Error",
        body: err.message,
        type: 'error'
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return (
    <div className="flex h-[70vh] items-center justify-center">
      <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
    </div>
  );

  const filteredInvoices = (invoices || []).filter(inv => 
    inv.unit?.numero?.toLowerCase().includes(search.toLowerCase()) ||
    inv.periodo?.toLowerCase().includes(search.toLowerCase())
  );

  const totalRecaudado = (invoices || []).reduce((acc, inv) => 
    acc + (inv.estado === 'PAID' ? safeNumber(inv.total) : 0), 0
  );

  return (
    <div className="p-8 space-y-8 font-sans max-w-[1600px] mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Control Financiero</h1>
          <p className="text-slate-400 font-medium mt-1">Gestión de ingresos y compromisos del condominio.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => window.location.href = '/dashboard/financiero/servicios'}
            className="bg-white text-slate-600 px-6 py-3 rounded-2xl text-[10px] font-black uppercase border border-slate-200 shadow-sm flex items-center gap-2 hover:bg-slate-50 transition-all"
          >
            <Zap className="w-4 h-4 text-amber-500" /> Servicios
          </button>
          <button 
            onClick={initiateGenerate}
            disabled={actionLoading}
            className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase hover:bg-slate-900 shadow-xl shadow-indigo-100 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Generar Cuotas
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full -mr-16 -mt-16 opacity-10" />
             <p className="text-[10px] font-black uppercase opacity-40 mb-2">Cuentas por Cobrar (DOP)</p>
             <p className="text-4xl font-black">RD$ {safeFormat(balance?.total)}</p>
          </div>

          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Recaudado</p>
                 <p className="text-3xl font-black text-slate-900">RD$ {safeFormat(totalRecaudado)}</p>
              </div>
          </div>

          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Cuentas por Pagar</p>
                 <p className="text-3xl font-black text-rose-600">RD$ {safeFormat(balance?.apTotal)}</p>
              </div>
          </div>
      </div>

      {/* Listing */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row gap-6 items-center justify-between">
            <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase">Documentos</h3>
            <div className="relative md:w-64">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
               <input 
                 placeholder="Buscar..." 
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-semibold outline-none" 
               />
            </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] uppercase text-slate-400 font-black">
                <th className="px-8 py-5">Unidad</th>
                <th className="px-8 py-5">Período</th>
                <th className="px-8 py-5">Vencimiento</th>
                <th className="px-8 py-5">Monto</th>
                <th className="px-8 py-5">Estado</th>
                <th className="px-8 py-5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredInvoices.length === 0 ? (
                <tr><td colSpan={6} className="px-8 py-20 text-center text-slate-300 font-bold uppercase italic font-sans uppercase">No hay registros</td></tr>
              ) : filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600"><CreditCard className="w-5 h-5" /></div>
                      <p className="text-sm font-black text-slate-900 uppercase">Uni. {inv.unit?.numero || 'S/N'}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6"><span className="text-[10px] font-black text-slate-600 uppercase bg-slate-100 px-3 py-1 rounded-lg">{inv.periodo}</span></td>
                  <td className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase">{new Date(inv.fechaVencimiento).toLocaleDateString()}</td>
                  <td className="px-8 py-6"><p className="text-sm font-black text-slate-900 uppercase">RD$ {safeFormat(inv.total)}</p></td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                       <div className={`w-2 h-2 rounded-full ${inv.estado === 'PAID' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                       <span className={`text-[10px] font-black uppercase ${inv.estado === 'PAID' ? 'text-emerald-500' : 'text-amber-500'}`}>{inv.estado === 'PAID' ? 'Saldado' : 'Pendiente'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={async () => {
                        try {
                          await fetchWithAuth(`/financial/invoices/${inv.id}/toggle-paid`, { method: 'PATCH' });
                          loadData();
                        } catch (err) { console.error(err); }
                      }}
                      className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase border ${inv.estado === 'PAID' ? 'bg-slate-100 text-slate-400 border-slate-200' : 'bg-emerald-600 text-white border-emerald-500 hover:bg-slate-900'}`}
                    >
                      {inv.estado === 'PAID' ? 'Revertir' : 'Pagar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={msgModal.isOpen} onClose={() => setMsgModal(prev => ({ ...prev, isOpen: false }))} title={msgModal.title}>
        <div className="text-center space-y-6">
           <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto ${msgModal.type === 'success' ? 'bg-emerald-50 text-emerald-600' : msgModal.type === 'error' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
              {msgModal.type === 'success' ? <CheckCircle2 className="w-10 h-10" /> : msgModal.type === 'error' ? <AlertCircle className="w-10 h-10" /> : <Save className="w-10 h-10" />}
           </div>
           <p className="text-slate-600 font-bold text-sm px-4">{msgModal.body}</p>
           <div className="flex gap-3 pt-4">
              {msgModal.type === 'confirm' ? (
                <>
                  <button onClick={() => setMsgModal(prev => ({ ...prev, isOpen: false }))} className="flex-1 py-4 bg-slate-100 text-slate-600 font-black rounded-2xl text-[10px] uppercase">Cancelar</button>
                  <button onClick={handleGenerate} className="flex-1 py-4 bg-indigo-600 text-white font-black rounded-2xl text-[10px] uppercase shadow-xl shadow-indigo-100">Confirmar</button>
                </>
              ) : (
                <button onClick={() => setMsgModal(prev => ({ ...prev, isOpen: false }))} className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl text-[10px] uppercase shadow-xl">Entendido</button>
              )}
           </div>
        </div>
      </Modal>
    </div>
  );
}
