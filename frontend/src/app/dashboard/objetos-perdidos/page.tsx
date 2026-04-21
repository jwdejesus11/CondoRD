"use client";

import { useEffect, useState } from "react";
import { 
  Package, Search, Plus, 
  MapPin, Calendar, User, ChevronRight, Loader2, Image as ImageIcon, 
  CheckCircle2, Clock, Trash2, Save, AlertCircle, Camera, Hammer
} from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import { Modal } from "@/components/Modal";

export default function ObjetosPerdidosPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [msgModal, setMsgModal] = useState({ isOpen: false, title: "", body: "", type: 'success' as 'success' | 'error' });
  
  const [formData, setFormData] = useState({
    descripcion: "",
    ubicacion: "",
    fecha: new Date().toISOString().split('T')[0],
    estado: "REPORTED",
    fotosUrl: ""
  });
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const loadData = async () => {
    try {
      const data = await fetchWithAuth("/operations/lost-found");
      setItems(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await fetchWithAuth("/operations/lost-found", {
        method: "POST",
        body: JSON.stringify(formData)
      });
      setIsModalOpen(false);
      setFormData({ descripcion: "", ubicacion: "", fecha: new Date().toISOString().split('T')[0], estado: "REPORTED", fotosUrl: "" });
      setMsgModal({ isOpen: true, title: "Reporte Registrado", body: "El hallazgo ha sido notificado y guardado en la portería central.", type: 'success' });
      loadData();
    } catch (err) {
      setMsgModal({ isOpen: true, title: "Error en Registro", body: "No se pudo crear el reporte de objeto perdido.", type: 'error' });
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
    <div className="p-8 space-y-8 animate-in fade-in duration-700 max-w-[1400px] mx-auto">
      {/* Header Premium */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <div className="bg-amber-100 p-2 rounded-lg">
                <Package className="w-4 h-4 text-amber-600" />
             </div>
             <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full">Protocolo de Seguridad</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none uppercase">Objetos <span className="text-indigo-600">Perdidos</span></h1>
          <p className="text-slate-400 font-medium mt-3 text-sm">Control centralizado de artículos olvidados o encontrados en áreas comunes.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-8 py-4 rounded-[2.5rem] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-900 shadow-2xl shadow-indigo-100 transition-all flex items-center gap-3 active:scale-95"
        >
          <Plus className="w-4 h-4" /> Registrar Hallazgo
        </button>
      </div>

      {/* Grid Status Deck */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
             <div className="absolute inset-0 bg-indigo-50/10 opacity-0 group-hover:opacity-100 transition-opacity" />
             <div className="relative z-10">
                <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-50">
                    <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">En Custodia</h3>
                <p className="text-2xl font-black text-slate-900">{items.filter(i => i.estado === 'REPORTED').length} Artículos</p>
             </div>
          </div>
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
             <div className="relative z-10">
                <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-50">
                    <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Entregados</h3>
                <p className="text-2xl font-black text-slate-900">{items.filter(i => i.estado === 'CLAIMED').length} Exitosos</p>
             </div>
          </div>
          <div className="bg-slate-900 p-8 rounded-[3rem] border border-slate-800 shadow-xl relative overflow-hidden group">
             <div className="relative z-10">
                <div className="w-12 h-12 bg-amber-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-amber-50">
                    <Hammer className="w-6 h-6" />
                </div>
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Últimos 30 días</h3>
                <p className="text-2xl font-black text-white">{items.length} Reportes</p>
             </div>
          </div>
      </div>

      {/* Main List */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
           <div className="relative w-full md:w-96">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                placeholder="Buscar descripción o ubicación..." 
                className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:ring-2 ring-indigo-50 outline-none"
              />
           </div>
        </div>

        {items.length === 0 ? (
          <div className="p-32 flex flex-col items-center text-center">
             <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200 mb-8 border border-dashed border-slate-200 animate-pulse">
                <Package className="w-12 h-12" />
             </div>
             <p className="text-lg font-black text-slate-900 uppercase tracking-tight">Bitácora Limpia</p>
             <p className="text-sm font-bold text-slate-400 mt-2 max-w-xs leading-relaxed uppercase tracking-widest text-[10px]">No hay objetos bajo custodia en este momento.</p>
          </div>
        ) : (
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {items.map((item) => (
               <div key={item.id} className="bg-white border border-slate-100 p-8 rounded-[2.5rem] hover:shadow-2xl hover:scale-[1.02] transition-all group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:bg-indigo-50 transition-colors" />
                  <div className="relative z-10">
                     <div className="flex items-start justify-between mb-8">
                        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                           <ImageIcon className="w-6 h-6" />
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border ${
                          item.estado === 'CLAIMED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse'
                        }`}>
                           {item.estado === 'CLAIMED' ? 'Devuelto' : 'Bajo Custodia'}
                        </span>
                     </div>
                     <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2 line-clamp-1">{item.descripcion}</h3>
                     <div className="space-y-3 pt-4 border-t border-slate-50">
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                           <MapPin className="w-3.5 h-3.5" />
                           {item.lugar || 'No especificado'}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                           <Calendar className="w-3.5 h-3.5" />
                           {new Date(item.fecha).toLocaleDateString()}
                        </div>
                     </div>
                     <div className="mt-8 flex gap-2">
                        <button 
                          onClick={() => { setSelectedItem(item); setIsDetailOpen(true); }}
                          className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all font-sans"
                        >
                           Ver Detalles
                        </button>
                        {item.estado !== 'CLAIMED' && (
                           <button 
                            onClick={async () => {
                              if (!window.confirm("¿Seguro que deseas marcar este objeto como devuelto?")) return;
                              console.log('Marcando como devuelto:', item.id);
                              try {
                                const res = await fetchWithAuth(`/operations/lost-found/${item.id}/claim`, { method: "PATCH" });
                                console.log('Respuesta:', res);
                                await loadData();
                                setMsgModal({ isOpen: true, title: "Actualizado", body: "El objeto ha sido marcado como devuelto.", type: 'success' });
                              } catch(e: any) {
                                console.error('Error al marcar:', e);
                                alert("Error: " + e.message);
                                setMsgModal({ isOpen: true, title: "Error", body: "No se pudo actualizar el estado.", type: 'error' });
                              }
                            }}
                            className="px-4 py-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm active:scale-90"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                        )}
                     </div>
                  </div>
               </div>
             ))}
          </div>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Reportar nuevo Hallazgo"
      >
        <form onSubmit={handleCreateRequest} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Descripción del Artículo</label>
            <input 
              required
              value={formData.descripcion}
              onChange={e => setFormData({...formData, descripcion: e.target.value})}
              placeholder="Ej: Llaves con llavero de cuero azul, Celular Samsung..."
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 ring-indigo-50 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Ubicación del Encuentro</label>
            <input 
              required
              value={formData.ubicacion}
              onChange={e => setFormData({...formData, ubicacion: e.target.value})}
              placeholder="Ej: Gimnasio, Lobby Torre A, Área Infantil..."
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 ring-indigo-50 outline-none transition-all"
            />
          </div>
          <div className="grid grid-cols-2 gap-5">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Fecha</label>
                <input 
                  type="date"
                  required
                  value={formData.fecha}
                  onChange={e => setFormData({...formData, fecha: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 ring-indigo-50 outline-none transition-all"
                />
             </div>
             <div className="space-y-2 flex flex-col justify-end">
                <div className="relative">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={async (e) => {
                       const file = e.target.files?.[0];
                       if (file) {
                         const reader = new FileReader();
                         reader.onloadend = () => setFormData({ ...formData, fotosUrl: reader.result as string });
                         reader.readAsDataURL(file);
                       }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <div className={`w-full py-4 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 rounded-2xl transition-all ${
                    formData.fotosUrl ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                  }`}>
                    {formData.fotosUrl ? (
                      <><CheckCircle2 className="w-4 h-4" /> Foto Adjunta</>
                    ) : (
                      <><Camera className="w-4 h-4" /> Adjuntar Foto</>
                    )}
                  </div>
                </div>
             </div>
          </div>
          {formData.fotosUrl && (
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-100 shadow-inner">
               <img src={formData.fotosUrl} className="w-full h-full object-cover" />
               <button 
                type="button"
                onClick={() => setFormData({...formData, fotosUrl: ""})}
                className="absolute top-2 right-2 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-lg text-white"
               >
                 <Trash2 className="w-4 h-4" />
               </button>
            </div>
          )}
          <button 
            type="submit" 
            disabled={actionLoading}
            className="w-full py-5 bg-indigo-600 text-white font-black rounded-[2rem] text-[10px] uppercase tracking-[0.2em] hover:bg-slate-900 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-2xl shadow-indigo-100"
          >
            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Registrar Objeto
          </button>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal 
        isOpen={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)} 
        title="Detalles del Hallazgo"
      >
        {selectedItem && (
          <div className="space-y-8">
            <div className="w-full aspect-video bg-slate-50 rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-inner flex items-center justify-center">
              {selectedItem.fotosUrl ? (
                <img src={selectedItem.fotosUrl} className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-16 h-16 text-slate-200" />
              )}
            </div>
            
            <div className="space-y-6 px-2">
               <div>
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">{selectedItem.descripcion}</h3>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border ${
                    selectedItem.estado === 'CLAIMED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                  }`}>
                    {selectedItem.estado === 'CLAIMED' ? 'Entregado a Propietario' : 'Bajo Custodia de Seguridad'}
                  </span>
               </div>

               <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-50">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ubicación</p>
                    <p className="text-sm font-bold text-slate-700 uppercase flex items-center gap-2">
                       <MapPin className="w-4 h-4 text-indigo-600" /> {selectedItem.ubicacion}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha Registro</p>
                    <p className="text-sm font-bold text-slate-700 uppercase flex items-center gap-2">
                       <Calendar className="w-4 h-4 text-indigo-600" /> {new Date(selectedItem.fecha).toLocaleDateString()}
                    </p>
                  </div>
               </div>

               <button 
                onClick={() => setIsDetailOpen(false)}
                className="w-full py-5 bg-slate-900 text-white font-black rounded-3xl text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl font-sans"
               >
                 Cerrar Vista
               </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Mensajes */}
      <Modal
        isOpen={msgModal.isOpen}
        onClose={() => setMsgModal({ ...msgModal, isOpen: false })}
        title={msgModal.title}
      >
        <div className="text-center space-y-6">
           <div className={`w-20 h-20 mx-auto rounded-[2rem] flex items-center justify-center ${
            msgModal.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
           }`}>
              {msgModal.type === 'success' ? <CheckCircle2 className="w-10 h-10" /> : <AlertCircle className="w-10 h-10" />}
           </div>
           <div>
              <p className="text-sm font-bold text-slate-600 leading-relaxed uppercase tracking-widest text-[10px]">{msgModal.body}</p>
           </div>
           <button 
             onClick={() => setMsgModal({ ...msgModal, isOpen: false })}
             className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all font-sans"
           >
             Entendido
           </button>
        </div>
      </Modal>
    </div>
  );
}
