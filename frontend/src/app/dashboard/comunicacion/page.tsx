"use client";

import { useEffect, useState } from "react";
import { 
  Bell, Calendar, MessageSquare, Plus, 
  Search, Info, ChevronRight, Loader2, Save, Home, Clock, CheckCircle2, AlertCircle
} from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import { Modal } from "@/components/Modal";

export default function ComunicacionPage() {
  const [avisos, setAvisos] = useState<any[]>([]);
  const [reservas, setReservas] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [msgModal, setMsgModal] = useState({ isOpen: false, title: "", body: "", type: 'success' as 'success' | 'error' });
  
  const [isAvisoModalOpen, setIsAvisoModalOpen] = useState(false);
  const [isReservaModalOpen, setIsReservaModalOpen] = useState(false);

  const [avisoForm, setAvisoForm] = useState({ titulo: "", contenido: "" });
  const [reservaForm, setReservaForm] = useState({ 
    commonAreaId: "", 
    fecha: new Date().toISOString().split('T')[0], 
    horaInicio: "18:00", 
    horaFin: "21:00" 
  });

  const loadData = async () => {
    try {
      const [a, r, ar] = await Promise.all([
        fetchWithAuth("/operations/announcements"),
        fetchWithAuth("/operations/reservations"),
        fetchWithAuth("/operations/common-areas")
      ]);
      setAvisos(a);
      setReservas(r);
      setAreas(ar);
      if (ar.length > 0) {
        setReservaForm(prev => ({ ...prev, commonAreaId: ar[0].id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateAviso = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await fetchWithAuth("/operations/announcements", {
        method: "POST",
        body: JSON.stringify(avisoForm)
      });
      setIsAvisoModalOpen(false);
      setAvisoForm({ titulo: "", contenido: "" });
      setMsgModal({ isOpen: true, title: "Aviso Publicado", body: "El comunicado ha sido emitido y será visible inmediatamente para los residentes.", type: 'success' });
      loadData();
    } catch (err) {
      setMsgModal({ isOpen: true, title: "Error", body: "No se pudo publicar el aviso comercial.", type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateReserva = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await fetchWithAuth("/operations/reservations", {
        method: "POST",
        body: JSON.stringify(reservaForm)
      });
      setIsReservaModalOpen(false);
      setMsgModal({ isOpen: true, title: "Reserva Confirmada", body: "El espacio ha sido reservado para la fecha y hora seleccionada.", type: 'success' });
      loadData();
    } catch (err) {
      setMsgModal({ isOpen: true, title: "Conflicto de Horario", body: "El área ya se encuentra reservada en el bloque seleccionado.", type: 'error' });
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
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Comunicación & Áreas</h2>
          <p className="text-slate-500 font-medium mt-1">Circulares digitales y agenda de espacios compartidos.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Announcements Section */}
        <div className="space-y-6">
           <div className="flex items-center justify-between px-4">
              <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2 uppercase">
                <Bell className="w-5 h-5 text-indigo-600" /> Avisos
              </h3>
              <button 
                onClick={() => setIsAvisoModalOpen(true)}
                className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"
              >
                <Plus className="w-3.5 h-3.5" /> Publicar
              </button>
           </div>
           
           <div className="space-y-4">
              {avisos.length === 0 && (
                <div className="bg-white p-20 rounded-[3rem] border border-slate-100 text-center">
                   <p className="text-xs font-black text-slate-300 uppercase tracking-widest italic">No hay comunicados activos.</p>
                </div>
              )}
              {avisos.map((aviso) => (
                <div key={aviso.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                   <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full -mr-12 -mt-12 transition-all group-hover:bg-indigo-100/50" />
                   <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(aviso.createdAt).toLocaleDateString('es-DO', { day: 'numeric', month: 'long' })}</span>
                         <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg uppercase tracking-widest">Circular</span>
                      </div>
                      <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">{aviso.titulo}</h4>
                      <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{aviso.contenido}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Reservations Section */}
        <div className="space-y-6">
           <div className="flex items-center justify-between px-4">
              <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2 uppercase">
                <Calendar className="w-5 h-5 text-indigo-600" /> Agenda Social
              </h3>
              <div className="flex gap-2">
                 <button 
                  onClick={() => setIsReservaModalOpen(true)}
                  className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg flex items-center gap-2"
                 >
                  <Plus className="w-3.5 h-3.5" /> Reservar
                 </button>
              </div>
           </div>

           <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden p-6">
               <div className="flex items-center justify-between mb-8 px-2">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ocupación Mensual</h4>
                  <div className="flex gap-1">
                    {['D','L','M','M','J','V','S'].map((d, i) => <span key={`${d}-${i}`} className="w-8 text-center text-[8px] font-black text-slate-300">{d}</span>)}
                  </div>
               </div>
               
               {/* Simplified Calendar Grid */}
               <div className="grid grid-cols-7 gap-2 mb-8">
                  {Array.from({length: 31}).map((_, i) => {
                    const day = i + 1;
                    const hasReserva = reservas.some(r => new Date(r.fecha).getDate() === day);
                    return (
                      <div key={i} className={`h-10 rounded-xl flex items-center justify-center text-[10px] font-black transition-all ${
                        hasReserva ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'
                      }`}>
                        {day}
                      </div>
                    )
                  })}
               </div>

               <div className="space-y-3">
                  {reservas.length === 0 ? (
                    <div className="p-10 text-center">
                       <p className="text-xs font-black text-slate-300 uppercase tracking-widest italic">Sin reservas programadas.</p>
                    </div>
                  ) : reservas.sort((a,b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()).map((r) => (
                    <div key={r.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100 group">
                       <div className="w-12 h-12 bg-slate-100 rounded-xl flex flex-col items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0">
                          <span className="text-[8px] font-black uppercase leading-none mb-0.5">{new Date(r.fecha).toLocaleDateString('es-DO', { month: 'short' })}</span>
                          <span className="text-sm font-black leading-none">{new Date(r.fecha).getDate()}</span>
                       </div>
                       <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-black text-slate-900 uppercase truncate">{r.area?.nombre ?? 'Área Desconocida'}</h4>
                          <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">{r.horaInicio} - {r.horaFin}</p>
                       </div>
                       <div className={`w-2 h-2 rounded-full ${r.estado === 'APROBADA' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                    </div>
                  ))}
               </div>
           </div>
        </div>
      </div>

      {/* Aviso Modal */}
      <Modal 
        isOpen={isAvisoModalOpen} 
        onClose={() => setIsAvisoModalOpen(false)} 
        title="Publicar Comunicación Oficial"
      >
        <form onSubmit={handleCreateAviso} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Título del Comunicado</label>
            <input 
              required
              value={avisoForm.titulo}
              onChange={e => setAvisoForm({...avisoForm, titulo: e.target.value})}
              placeholder="Ej: Mantenimiento de Ascensores"
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 ring-indigo-50 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Contenido / Cuerpo</label>
            <textarea 
              required
              value={avisoForm.contenido}
              onChange={e => setAvisoForm({...avisoForm, contenido: e.target.value})}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 ring-indigo-50 outline-none h-32 resize-none transition-all"
              placeholder="Escribe aquí el mensaje para los residentes..."
            />
          </div>
          <button 
            type="submit" 
            disabled={actionLoading}
            className="w-full py-5 bg-indigo-600 text-white font-black rounded-[2rem] text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Emitir Circular
          </button>
        </form>
      </Modal>

      {/* Reserva Modal */}
      <Modal 
        isOpen={isReservaModalOpen} 
        onClose={() => setIsReservaModalOpen(false)} 
        title="Nueva Reserva"
      >
        <form onSubmit={handleCreateReserva} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Área Común</label>
            <select 
              required
              value={reservaForm.commonAreaId}
              onChange={e => setReservaForm({...reservaForm, commonAreaId: e.target.value})}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 focus:bg-white focus:ring-2 ring-indigo-50 outline-none appearance-none cursor-pointer"
            >
              {areas.map(a => (
                <option key={a.id} value={a.id} className="text-slate-900">{a.nombre}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Fecha del Evento</label>
            <div className="relative">
               <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
               <input 
                 type="date"
                 required
                 value={reservaForm.fecha}
                 onChange={e => setReservaForm({...reservaForm, fecha: e.target.value})}
                 className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 ring-indigo-50 outline-none transition-all"
               />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hora Inicio</label>
              <div className="relative">
                 <Clock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <input 
                   type="time"
                   required
                   value={reservaForm.horaInicio}
                   onChange={e => setReservaForm({...reservaForm, horaInicio: e.target.value})}
                   className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 ring-indigo-50 outline-none"
                 />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hora Fin</label>
              <div className="relative">
                 <Clock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <input 
                   type="time"
                   required
                   value={reservaForm.horaFin}
                   onChange={e => setReservaForm({...reservaForm, horaFin: e.target.value})}
                   className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 ring-indigo-50 outline-none"
                 />
              </div>
            </div>
          </div>
          <button 
            type="submit" 
            disabled={actionLoading}
            className="w-full py-5 bg-indigo-600 text-white font-black rounded-[2rem] text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Confirmar Reserva
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
