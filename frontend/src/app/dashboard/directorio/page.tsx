"use client";

import { useEffect, useState } from "react";
import { 
  Users, Search, UserPlus, Phone, 
  Mail, MapPin, Building2, ChevronRight, Loader2, Save, CheckCircle2, AlertCircle
} from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import { Modal } from "@/components/Modal";

export default function DirectorioPage() {
  const [residentes, setResidentes] = useState<any[]>([]);
  const [unidades, setUnidades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [msgModal, setMsgModal] = useState({ isOpen: false, title: "", body: "", type: 'success' as 'success' | 'error' });
  
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    unitId: ""
  });

  const loadData = async () => {
    try {
      const results = await Promise.allSettled([
        fetchWithAuth("/units"),
        fetchWithAuth("/units/residents")
      ]);

      const [uRes, rRes] = results;

      // Unidades
      if (uRes.status === 'fulfilled') {
        setUnidades(uRes.value || []);
      } else {
        console.error("❌ Fallo en /units:", uRes.reason);
        setUnidades([]);
        // Aquí podríamos setear un error local si quisiéramos mostrar un badge visual
      }

      // Residentes
      if (rRes.status === 'fulfilled') {
        setResidentes(rRes.value || []);
      } else {
        console.error("❌ Fallo en /units/residents:", rRes.reason);
        setResidentes([]);
      }

    } catch (err) {
      console.error("Fallo crítico en carga de directorio:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLinkResident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.unitId) {
      setMsgModal({ isOpen: true, title: "Faltan datos", body: "Debe seleccionar una unidad para el residente.", type: 'error' });
      return;
    }

    setActionLoading(true);
    try {
      await fetchWithAuth("/units/residents/link", {
        method: "POST",
        body: JSON.stringify(formData)
      });
      setIsModalOpen(false);
      setFormData({ nombre: "", email: "", unitId: "" });
      setMsgModal({ isOpen: true, title: "Vinculación Exitosa", body: "El residente ha sido asociado a la unidad y activado en el sistema.", type: 'success' });
      loadData();
    } catch (err) {
      setMsgModal({ isOpen: true, title: "Error", body: "No se pudo realizar la vinculación.", type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return (
    <div className="flex h-[70vh] items-center justify-center">
      <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
    </div>
  );

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Directorio Central</h2>
          <p className="text-slate-500 font-medium mt-1">Base de datos de propietarios y residentes autorizados.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-slate-900 shadow-xl"
        >
          <UserPlus className="w-4 h-4" />
          Vincular Residente
        </button>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
           <div className="relative w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                placeholder="Buscar por nombre, email o unidad..." 
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-xs font-semibold focus:ring-2 ring-indigo-50 outline-none"
              />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Residente</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ubicación</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contacto</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estatus</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {residentes.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-black text-xs uppercase">
                        {item.user.nombre?.[0] || 'R'}
                      </div>
                      <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{item.user.nombre}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-widest">
                      <Building2 className="w-4 h-4 text-slate-300" />
                      Unidad {item.unit.numero}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        <Mail className="w-3.5 h-3.5 text-slate-300" />
                        {item.user.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-emerald-500" />
                       <span className="text-xs font-black uppercase tracking-widest text-[9px] text-slate-500">Verificado</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="p-2 hover:bg-white rounded-xl transition-all opacity-0 group-hover:opacity-100 shadow-sm border border-slate-100">
                       <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Vincular a Nuevo Residente"
      >
        <form onSubmit={handleLinkResident} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nombre Completo</label>
            <input 
              required
              value={formData.nombre}
              onChange={e => setFormData({...formData, nombre: e.target.value})}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 ring-indigo-50 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Correo de Acceso (Usuario)</label>
            <input 
              required
              type="email"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 ring-indigo-50 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Unidad que Ocupará</label>
            <select 
              required
              value={formData.unitId}
              onChange={e => setFormData({...formData, unitId: e.target.value})}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 focus:bg-white focus:ring-2 ring-indigo-50 outline-none appearance-none cursor-pointer"
            >
              <option value="">Seleccionar Unidad...</option>
              {unidades.map(u => <option key={u.id} value={u.id}>Unidad {u.numero}</option>)}
            </select>
          </div>
          <button 
            type="submit" 
            disabled={actionLoading}
            className="w-full py-5 bg-indigo-600 text-white font-black rounded-[2rem] text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Confirmar Vinculación
          </button>
        </form>
      </Modal>

      {/* Message Modal */}
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
             Entendido
           </button>
        </div>
      </Modal>
    </div>
  );
}
