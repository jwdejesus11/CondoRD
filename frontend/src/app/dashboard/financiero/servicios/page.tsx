"use client";

import { useEffect, useState } from "react";
import { 
  Zap, Droplets, Wifi, Receipt, 
  Search, Plus, ChevronRight, Loader2, Save, CheckCircle2, AlertCircle, Trash2, ArrowLeft 
} from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import { Modal } from "@/components/Modal";
import Link from 'next/link';

export default function ServiciosCondominioPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [msgModal, setMsgModal] = useState({ isOpen: false, title: "", body: "", type: 'success' as 'success' | 'error' });

  const [formData, setFormData] = useState({
    proveedor: "",
    monto: 0,
    fechaLimite: new Date().toISOString().split('T')[0]
  });

  const loadData = async () => {
    try {
      const data = await fetchWithAuth("/financial/accounts-payable");
      setServices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await fetchWithAuth("/financial/accounts-payable", {
        method: "POST",
        body: JSON.stringify(formData)
      });
      setIsModalOpen(false);
      setFormData({ proveedor: "", monto: 0, fechaLimite: new Date().toISOString().split('T')[0] });
      setMsgModal({ isOpen: true, title: "Gasto Programado", body: "El servicio ha sido registrado en las cuentas por pagar del condominio.", type: 'success' });
      loadData();
    } catch (err) {
      setMsgModal({ isOpen: true, title: "Error", body: "No se pudo registrar el servicio.", type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handlePay = async (id: string) => {
    if(!confirm("¿Confirmas que este servicio ha sido pagado?")) return;
    try {
      await fetchWithAuth(`/financial/accounts-payable/${id}/pay`, { method: "POST" });
      loadData();
    } catch (err) {
       alert("Error al procesar pago");
    }
  };

  if (loading) return (
    <div className="flex h-[70vh] items-center justify-center">
      <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
    </div>
  );

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link href="/dashboard/financiero" className="flex items-center gap-2 text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-4 hover:translate-x-[-4px] transition-all">
             <ArrowLeft className="w-3 h-3" /> Volver a Finanzas
          </Link>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Servicios del Condominio</h2>
          <p className="text-slate-500 font-medium mt-1">Gestión de Cuentas por Pagar (Luz, Agua, Internet, Mantenimiento Externo).</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-4 bg-indigo-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-indigo-100"
        >
          <Plus className="w-4 h-4" /> Registrar Factura de Servicio
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         <div className="lg:col-span-3 bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
               <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Cronograma de Pagos</h3>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50">
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Proveedor / Servicio</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vencimiento</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Monto (DOP)</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                       <th className="px-8 py-5"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {services.length === 0 ? (
                       <tr>
                          <td colSpan={5} className="px-8 py-20 text-center text-slate-300 font-bold uppercase italic">No hay cuentas por pagar registradas.</td>
                       </tr>
                     ) : services.map(s => (
                       <tr key={s.id} className="hover:bg-slate-50/30 transition-colors group">
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                                   {s.proveedor.toLowerCase().includes('luz') ? <Zap className="w-5 h-5 text-amber-500" /> : 
                                    s.proveedor.toLowerCase().includes('agua') ? <Droplets className="w-5 h-5 text-blue-500" /> : 
                                    s.proveedor.toLowerCase().includes('internet') ? <Wifi className="w-5 h-5 text-indigo-500" /> : 
                                    <Receipt className="w-5 h-5" />}
                                </div>
                                <span className="text-sm font-black text-slate-900 uppercase tracking-tight">{s.proveedor}</span>
                             </div>
                          </td>
                          <td className="px-8 py-6 text-xs font-bold text-slate-400">
                             {new Date(s.fechaLimite).toLocaleDateString()}
                          </td>
                          <td className="px-8 py-6 text-sm font-black text-slate-900">
                             RD$ {Number(s.monto).toLocaleString()}
                          </td>
                          <td className="px-8 py-6">
                             <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${
                               s.estado === 'PAGADO' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                             }`}>
                                {s.estado}
                             </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                             {s.estado === 'PENDIENTE' && (
                                <button 
                                  onClick={() => handlePay(s.id)}
                                  className="px-4 py-2 bg-slate-900 text-white text-[9px] font-black uppercase rounded-xl hover:bg-emerald-600 transition-all opacity-0 group-hover:opacity-100"
                                >
                                   Marcar Pagado
                                </button>
                             )}
                          </td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>

         <div className="space-y-6">
            <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100">
               <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Presupuesto Ejecutado</p>
               <p className="text-3xl font-black">RD$ {services.filter(s => s.estado === 'PAGADO').reduce((acc,s) => acc + Number(s.monto), 0).toLocaleString()}</p>
               <div className="mt-6 pt-6 border-t border-white/10">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Pendiente por Pagar</p>
                  <p className="text-2xl font-black">RD$ {services.filter(s => s.estado === 'PENDIENTE').reduce((acc,s) => acc + Number(s.monto), 0).toLocaleString()}</p>
               </div>
            </div>
         </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Registrar Gasto de Servicio"
      >
        <form onSubmit={handleCreate} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Proveedor / Concepto</label>
            <input 
              required
              value={formData.proveedor}
              onChange={e => setFormData({...formData, proveedor: e.target.value})}
              placeholder="Ej: EDEESTE (Luz), CAASD (Agua), Claro (Internet)..."
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 ring-indigo-50 outline-none transition-all"
            />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Monto de Factura (DOP)</label>
              <input 
                required
                type="number"
                value={formData.monto}
                onChange={e => setFormData({...formData, monto: parseFloat(e.target.value)})}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 ring-indigo-50 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Fecha Límite Pago</label>
              <input 
                required
                type="date"
                value={formData.fechaLimite}
                onChange={e => setFormData({...formData, fechaLimite: e.target.value})}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 ring-indigo-50 outline-none transition-all"
              />
            </div>
          </div>
          <button 
            type="submit" 
            disabled={actionLoading}
            className="w-full py-5 bg-indigo-600 text-white font-black rounded-[2rem] text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Programar Gasto
          </button>
        </form>
      </Modal>

      <Modal 
        isOpen={msgModal.isOpen} 
        onClose={() => setMsgModal(prev => ({ ...prev, isOpen: false }))} 
        title={msgModal.title}
      >
        <div className="text-center space-y-6">
           <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto ${
             msgModal.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
           }`}>
              {msgModal.type === 'success' ? <CheckCircle2 className="w-10 h-10" /> : <AlertCircle className="w-10 h-10" />}
           </div>
           <p className="text-slate-600 font-bold text-sm leading-relaxed px-4">{msgModal.body}</p>
           <button 
             onClick={() => setMsgModal(prev => ({ ...prev, isOpen: false }))}
             className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl"
           >
             Cerrar
           </button>
        </div>
      </Modal>
    </div>
  );
}
