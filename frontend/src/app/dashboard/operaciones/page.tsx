"use client";

import { useEffect, useState } from "react";
import { 
  Users, UserPlus, Shield, Clock, MapPin, 
  ChevronRight, Calendar, Search, 
  Save, Loader2, Clock3, Ban, CheckCircle2,
  Scan, Camera, ShieldCheck, FileSearch, AlertCircle
} from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import { Modal } from "@/components/Modal";

export default function OperacionesPage() {
  const [visitas, setVisitas] = useState<any[]>([]);
  const [casos, setCasos] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [msgModal, setMsgModal] = useState({ isOpen: false, title: "", body: "", type: 'success' as 'success' | 'error' });

  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);

  const [visitForm, setVisitForm] = useState({ 
    nombreVisitante: "", 
    unidad: "", 
    cedula: "", 
    motivo: "VISITA", 
    fecha: "" 
  });
  const [checkInForm, setCheckInForm] = useState({ 
    nombreCompleto: "", 
    cedula: "", 
    nacionalidad: "DOMINICANA",
    sexo: "M"
  });
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<any>(null);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [manualOverride, setManualOverride] = useState(false);
  const [caseForm, setCaseForm] = useState({ titulo: "", descripcion: "", prioridad: "MEDIA", unidad: "" });

  const loadData = async () => {
    try {
      const results = await Promise.allSettled([
        fetchWithAuth("/operations/visits"),
        fetchWithAuth("/operations/cases"),
        fetchWithAuth("/units")
      ]);

      const [vRes, cRes, uRes] = results;

      if (vRes.status === 'fulfilled') setVisitas(Array.isArray(vRes.value) ? vRes.value : []);
      else console.error("Error cargando visitas:", vRes.reason);

      if (cRes.status === 'fulfilled') setCasos(Array.isArray(cRes.value) ? cRes.value : []);
      else console.error("Error cargando casos:", cRes.reason);

      if (uRes.status === 'fulfilled') setUnits(Array.isArray(uRes.value) ? uRes.value : []);
      else console.error("Error cargando unidades:", uRes.reason);

    } catch (err) {
      console.error("Fallo crítico en carga de Operaciones:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await fetchWithAuth("/operations/visits", {
        method: "POST",
        body: JSON.stringify(visitForm)
      });
      setIsVisitModalOpen(false);
      setVisitForm({ nombreVisitante: "", unidad: "", cedula: "", motivo: "VISITA", fecha: "" });
      setMsgModal({ isOpen: true, title: "Visita Programada", body: "La visita ha sido registrada en el sistema.", type: 'success' });
      loadData();
    } catch (err) {
      setMsgModal({ isOpen: true, title: "Error", body: "No se pudo registrar la visita.", type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await fetchWithAuth(`/operations/visits/${selectedVisit.id}/check-in`, {
        method: "PATCH",
        body: JSON.stringify(checkInForm)
      });
      setIsCheckInModalOpen(false);
      setMsgModal({ isOpen: true, title: "Acceso Autorizado", body: "El visitante ha sido registrado exitosamente.", type: 'success' });
      loadData();
    } catch (err) {
      setMsgModal({ isOpen: true, title: "Error", body: "No se pudo completar el check-in.", type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleScanCedula = async () => {
    setScanStatus('scanning');
    
    // TODO: [INTEGRACIÓN] Integrar hardware o API de OCR externa
    const isDevMode = true; // <-- Habilitar solo en desarrollo para probar UI
    
    try {
      await new Promise(r => setTimeout(r, 1500)); // Simulando retardo hardware
      
      if (isDevMode) {
        setCheckInForm({
          ...checkInForm,
          nombreCompleto: "MOCK: PEDRO PÉREZ",
          cedula: "402-9999999-9",
          nacionalidad: "DOM",
          sexo: "M"
        });
        setScanStatus('success');
      } else {
        throw new Error("Lector de hardware no encontrado o no configurado.");
      }
    } catch (err: any) {
      setScanStatus('error');
      setMsgModal({ 
        isOpen: true, 
        title: "Fallo de Lectura", 
        body: err.message || "Por favor, reintente o habilite ingreso manual.", 
        type: 'error' 
      });
    }
  };

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await fetchWithAuth("/operations/cases", {
        method: "POST",
        body: JSON.stringify(caseForm)
      });
      setIsCaseModalOpen(false);
      setCaseForm({ titulo: "", descripcion: "", prioridad: "MEDIA", unidad: "" });
      setMsgModal({ isOpen: true, title: "Caso Abierto", body: "El ticket operativo ha sido creado exitosamente.", type: 'success' });
      loadData();
    } catch (err) {
      setMsgModal({ isOpen: true, title: "Error", body: "No se pudo abrir el caso operativo.", type: 'error' });
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
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Control de Operaciones</h2>
          <p className="text-slate-700 font-medium mt-1">Gestión de accesos, visitantes y mantenimiento.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => window.location.href = '/dashboard/operaciones/areas'}
            className="flex items-center gap-2 px-6 py-3 bg-white text-slate-700 font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-slate-50 border border-slate-200 shadow-sm transition-all"
          >
            <MapPin className="w-4 h-4 text-amber-500" />
            Gestionar Áreas
          </button>
          <button 
            onClick={() => setIsVisitModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-white text-slate-700 font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-slate-50 border border-slate-200 shadow-sm transition-all"
          >
            <UserPlus className="w-4 h-4 text-indigo-600" />
            Programar Visita
          </button>
          <button 
            onClick={() => setIsCaseModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-black shadow-xl transition-all"
          >
            <Shield className="w-4 h-4 text-emerald-400" />
            Reportar Caso
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Visitors Card */}
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
             <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
               <Clock className="w-5 h-5 text-indigo-600" /> Registro de Visitantes
             </h3>
             <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest">En Tiempo Real</span>
          </div>
          <div className="p-4 flex-1">
             {visitas.length === 0 && (
               <div className="h-64 flex flex-col items-center justify-center text-slate-300">
                  <UserPlus className="w-12 h-12 mb-4 opacity-20" />
                  <p className="text-xs font-black uppercase tracking-widest">Sin ingresos registrados</p>
               </div>
             )}
             <div className="space-y-3">
                {visitas.map((v) => (
                   <div key={v.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-[2rem] border border-transparent transition-all group">
                      <div className="flex items-center gap-4">
                         <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black shadow-sm ${
                           v.estado === 'CHECKED_IN' ? 'bg-emerald-50 text-emerald-600' : 'bg-white text-indigo-600'
                         }`}>
                            {v.nombreVisita?.[0] || '?'}
                         </div>
                         <div>
                            <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{v.nombreVisita || 'Visitante'}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                               Unidad: {v.unit?.numero || 'N/A'} • {v.motivo || 'Visita'}
                            </p>
                         </div>
                      </div>
                      <div className="flex items-center gap-3">
                         {v.estado === 'EXPECTED' && (
                           <button 
                             onClick={() => {
                               setSelectedVisit(v);
                               setCheckInForm({
                                 nombreCompleto: v.nombreVisita,
                                 cedula: v.cedulaVisita || "",
                                 nacionalidad: "DOMINICANA",
                                 sexo: "M"
                               });
                               setIsCheckInModalOpen(true);
                             }}
                             className="px-4 py-2 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-900 transition-all shadow-md"
                           >
                             Confirmar Llegada
                           </button>
                         )}
                         {v.estado === 'CHECKED_IN' && (
                           <button 
                             onClick={async () => {
                               if (!window.confirm("¿Confirmar salida del visitante?")) return;
                               try {
                                 await fetchWithAuth(`/operations/visits/${v.id}/check-out`, { method: "PATCH" });
                                 loadData();
                               } catch (err) { alert("Error al registrar salida"); }
                             }}
                             className="px-4 py-2 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-black transition-all shadow-md"
                           >
                             Marcar Salida
                           </button>
                         )}
                         <span className={`text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest ${
                           v.estado === 'CHECKED_IN' ? 'bg-emerald-100 text-emerald-700' : 
                           v.estado === 'CHECKED_OUT' ? 'bg-slate-200 text-slate-500' : 'bg-amber-100 text-amber-700'
                         }`}>
                           {v.estado}
                         </span>
                      </div>
                   </div>
                 ))}
             </div>
          </div>
        </div>

        {/* Maintenance Cases Card */}
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
             <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
               <FileSearch className="w-5 h-5 text-indigo-600" /> Órdenes Operativas
             </h3>
             <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-full uppercase tracking-widest">Pendientes</span>
          </div>
          <div className="p-4 flex-1">
             {casos.length === 0 && (
               <div className="h-64 flex flex-col items-center justify-center text-slate-300">
                  <Shield className="w-12 h-12 mb-4 opacity-20" />
                  <p className="text-xs font-black uppercase tracking-widest">Todo bajo control</p>
               </div>
             )}
             <div className="space-y-4">
                {casos.map((c) => (
                  <div key={c.id} className="p-6 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-lg transition-all group">
                     <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                           <div className={`w-2 h-2 rounded-full ${c.prioridad === 'ALTA' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                           <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{c.titulo}</h4>
                        </div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{new Date(c.createdAt).toLocaleDateString()}</span>
                     </div>
                     <p className="text-xs text-slate-500 mb-2 line-clamp-2 leading-relaxed">{c.descripcion}</p>
                     <div className="flex items-center gap-2 mb-4">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unidad: {c.unit?.numero || 'Común'}</span>
                     </div>
                     <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${
                          c.estado === 'CLOSED' ? 'text-slate-400' : 'text-emerald-500'
                        }`}>
                          Estado: {c.estado}
                        </span>
                        <div className="flex gap-2">
                           {c.estado !== 'CLOSED' && (
                             <button 
                               onClick={async (e) => {
                                 e.stopPropagation();
                                 if (!window.confirm("¿Deseas marcar este caso como CERRADO?")) return;
                                 try {
                                   await fetchWithAuth(`/operations/cases/${c.id}/status`, { 
                                     method: "PATCH", 
                                     body: JSON.stringify({ status: "CLOSED" }) 
                                   });
                                   loadData();
                                 } catch(err) {
                                   alert("No se pudo cerrar el caso.");
                                 }
                               }}
                               className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all shadow-sm active:scale-90"
                               title="Cerrar Caso"
                             >
                               <CheckCircle2 className="w-4 h-4" />
                             </button>
                           )}
                           <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                        </div>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>

      {/* Visit Modal */}
      <Modal 
        isOpen={isVisitModalOpen} 
        onClose={() => setIsVisitModalOpen(false)} 
        title="Registrar Ingreso de Visitante"
      >
        <form onSubmit={handleCreateVisit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest ml-1">Nombre</label>
              <input 
                required
                value={visitForm.nombreVisitante}
                onChange={e => setVisitForm({...visitForm, nombreVisitante: e.target.value})}
                placeholder="Nombre o Apodo"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 ring-indigo-50 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest ml-1">Cédula (Opcional)</label>
              <input 
                value={visitForm.cedula}
                onChange={e => setVisitForm({...visitForm, cedula: e.target.value})}
                placeholder="000-0000000-0"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 ring-indigo-50 outline-none transition-all"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest ml-1">Motivo</label>
              <select 
                value={visitForm.motivo}
                onChange={e => setVisitForm({...visitForm, motivo: e.target.value})}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 focus:bg-white focus:ring-2 ring-indigo-50 outline-none appearance-none"
              >
                <option value="VISITA">Visita Familiar/Amigos</option>
                <option value="DELIVERY">Delivery / Paquetería</option>
                <option value="SERVICIO">Servicios Técnicos</option>
                <option value="MUDANZA">Mudanza</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest ml-1">Fecha Estimada</label>
              <input 
                type="datetime-local"
                value={visitForm.fecha}
                onChange={e => setVisitForm({...visitForm, fecha: e.target.value})}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 focus:bg-white focus:ring-2 ring-indigo-50 outline-none transition-all"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest ml-1">Unidad Destino</label>
            <select 
              required
              value={visitForm.unidad}
              onChange={e => setVisitForm({...visitForm, unidad: e.target.value})}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 focus:bg-white focus:ring-2 ring-indigo-50 outline-none appearance-none cursor-pointer"
            >
              <option value="">Seleccione Unidad...</option>
              {units.map(u => <option key={u.id} value={u.numero} className="text-slate-900">{u.numero}</option>)}
            </select>
          </div>
          <button 
            type="submit" 
            disabled={actionLoading}
            className="w-full py-5 bg-indigo-600 text-white font-black rounded-[2rem] text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Confirmar Entrada
          </button>
        </form>
      </Modal>

      {/* Check-In Modal with Scanner */}
      <Modal
        isOpen={isCheckInModalOpen}
        onClose={() => setIsCheckInModalOpen(false)}
        title="Confirmar Ingreso"
      >
        <div className="space-y-6">
           <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100 flex flex-col items-center gap-4 transition-colors">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xl ring-4 transition-all ${
                scanStatus === 'scanning' ? 'bg-indigo-600 text-white animate-pulse ring-indigo-200' : 
                scanStatus === 'success' ? 'bg-emerald-500 text-white ring-emerald-100' : 
                scanStatus === 'error' ? 'bg-rose-50 text-rose-600 ring-rose-100' :
                'bg-white text-indigo-600 ring-indigo-100/50'
              }`}>
                 {scanStatus === 'success' ? <CheckCircle2 className="w-8 h-8" /> : 
                  scanStatus === 'error' ? <Ban className="w-8 h-8" /> :
                  <Scan className="w-8 h-8" />}
              </div>
              <div className="text-center">
                 <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                   {scanStatus === 'scanning' ? 'Leyendo...' :
                    scanStatus === 'success' ? 'Lectura Exitosa' :
                    scanStatus === 'error' ? 'Error de Lectura' :
                    'Escanear Cédula de Identidad'}
                 </h4>
                 <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest mt-1">Soporte para Cédula Dominicana</p>
              </div>
              <button 
                type="button"
                onClick={handleScanCedula}
                disabled={scanStatus === 'scanning'}
                className="px-8 py-3 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-900 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
              >
                {scanStatus === 'scanning' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />} 
                {scanStatus === 'idle' ? 'Lanzar Lector' : 'Reintentar Lectura'}
              </button>
           </div>

           <form onSubmit={handleCheckIn} className="space-y-4">
              <div className="flex justify-end">
                <button 
                  type="button" 
                  onClick={() => setManualOverride(prev => !prev)}
                  className={`text-[9px] font-black uppercase tracking-widest ${manualOverride ? 'text-rose-600' : 'text-indigo-600'}`}
                >
                  {manualOverride ? 'Desactivar Modo Manual' : 'Cédula ilegible? Ingreso Manual'}
                </button>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest ml-1">Nombre Completo (Verificado)</label>
                <input 
                  required
                  disabled={!manualOverride && scanStatus !== 'success'}
                  value={checkInForm.nombreCompleto}
                  onChange={e => setCheckInForm({...checkInForm, nombreCompleto: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 focus:bg-white focus:ring-2 ring-indigo-50 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest ml-1">Número de Cédula</label>
                <input 
                  required
                  disabled={!manualOverride && scanStatus !== 'success'}
                  value={checkInForm.cedula}
                  onChange={e => setCheckInForm({...checkInForm, cedula: e.target.value})}
                  placeholder="000-0000000-0"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 focus:bg-white focus:ring-2 ring-indigo-50 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <button 
                type="submit"
                disabled={actionLoading || (!manualOverride && scanStatus !== 'success')}
                className="w-full py-5 bg-slate-900 text-white font-black rounded-3xl text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                Autorizar Ingreso Confirmado
              </button>
           </form>
        </div>
      </Modal>
      <Modal 
        isOpen={isCaseModalOpen} 
        onClose={() => setIsCaseModalOpen(false)} 
        title="Reportar Incidencia Operativa v2"
      >
        <form onSubmit={handleCreateCase} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Unidad Afectada</label>
            <select 
              required
              value={caseForm.unidad}
              onChange={e => setCaseForm({...caseForm, unidad: e.target.value})}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 focus:bg-white focus:ring-2 ring-indigo-50 outline-none appearance-none cursor-pointer"
            >
              <option value="">Seleccione Unidad...</option>
              {units.map(u => <option key={u.id} value={u.numero} className="text-slate-900">{u.numero}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Título / Problema</label>
            <input 
              required
              value={caseForm.titulo}
              onChange={e => setCaseForm({...caseForm, titulo: e.target.value})}
              placeholder="Ej: Falla en Ascensor A"
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 ring-indigo-50 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Descripción Detallada</label>
            <textarea 
              required
              value={caseForm.descripcion}
              onChange={e => setCaseForm({...caseForm, descripcion: e.target.value})}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 ring-indigo-50 outline-none h-32 resize-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Prioridad</label>
            <select 
              value={caseForm.prioridad}
              onChange={e => setCaseForm({...caseForm, prioridad: e.target.value})}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 focus:bg-white focus:ring-2 ring-indigo-50 outline-none appearance-none cursor-pointer"
            >
              <option value="BAJA" className="text-slate-900">Baja</option>
              <option value="MEDIA" className="text-slate-900">Media</option>
              <option value="ALTA" className="text-slate-900">Alta / Urgente</option>
            </select>
          </div>
          <button 
            type="submit" 
            disabled={actionLoading}
            className="w-full py-5 bg-slate-900 text-white font-black rounded-[2rem] text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Abrir Ticket Operativo
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
