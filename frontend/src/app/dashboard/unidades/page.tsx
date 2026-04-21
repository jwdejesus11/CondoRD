"use client";

import { useEffect, useState } from "react";
import { 
  Building2, Plus, Search, Filter, 
  MapPin, User, ChevronRight, Loader2, AlertCircle, Save, CheckCircle2,
  LayoutGrid, List as ListIcon, Download, TrendingUp, Home, MoreVertical, Layers, Map
} from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import { Modal } from "@/components/Modal";

export default function UnidadesPage() {
  const [unidades, setUnidades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState('ALL');
  const [msgModal, setMsgModal] = useState({ isOpen: false, title: "", body: "", type: 'success' as 'success' | 'error' });
  const [formData, setFormData] = useState({
    numero: "",
    tipo: "APARTAMENTO",
    cuotaMantenimiento: 5000,
    metrosCuadrados: 100,
    status: "DISPONIBLE",
    piso: 0,
    area: ""
  });

  const loadData = async () => {
    try {
      const data = await fetchWithAuth("/units");
      setUnidades(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const url = isEdit ? `/units/${selectedId}` : "/units";
      
      // Sanitización y limpieza de body antes de enviar
      const payload = {
        numero: formData.numero.trim(),
        tipo: formData.tipo,
        status: formData.status,
        area: formData.area.trim(),
        ...(formData.piso !== undefined && { piso: Number(formData.piso) }),
        ...(formData.metrosCuadrados !== undefined && { metrosCuadrados: Number(formData.metrosCuadrados) }),
        ...(formData.cuotaMantenimiento !== undefined && { cuotaMantenimiento: Number(formData.cuotaMantenimiento) }),
      };

      await fetchWithAuth(url, {
        method: isEdit ? "PATCH" : "POST",
        body: JSON.stringify(payload)
      });
      setIsModalOpen(false);
      setFormData({ numero: "", tipo: "APARTAMENTO", cuotaMantenimiento: 5000, metrosCuadrados: 100, status: "DISPONIBLE", piso: 0, area: "" });
      setMsgModal({ isOpen: true, title: "Registro Actualizado", body: isEdit ? "Unidad actualizada con éxito." : "La unidad se vinculó correctamente al sistema.", type: 'success' });
      loadData();
    } catch (err: any) {
      setMsgModal({ 
        isOpen: true, 
        title: "Error de Operación", 
        body: err.message || "No se pudo procesar la solicitud. Verifique su conexión.", 
        type: 'error' 
      });
    } finally {
      setFormLoading(false);
    }
  };

  const openEdit = (unidad: any) => {
    setIsEdit(true);
    setSelectedId(unidad.id);
    setFormData({
        numero: unidad.numero,
        tipo: unidad.tipo,
        cuotaMantenimiento: Number(unidad.cuotaMantenimiento),
        metrosCuadrados: Number(unidad.metrosCuadrados),
        status: unidad.status || "DISPONIBLE",
        piso: unidad.piso || 0,
        area: unidad.area || ""
    });
    setIsModalOpen(true);
  };

  if (loading) return (
    <div className="flex h-[70vh] items-center justify-center">
      <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
    </div>
  );

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700 max-w-[1600px] mx-auto">
      {/* Header Premium */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-100">
                <Building2 className="text-white w-4 h-4" />
             </div>
             <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] bg-indigo-50 px-3 py-1 rounded-full">Gestión de Activos Condominales</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none uppercase">Directorio de <span className="text-indigo-600">Unidades</span></h1>
          <p className="text-slate-700 font-bold mt-3 text-sm max-w-xl">Control detallado de propiedades, estados de ocupación y parámetros financieros.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => { setIsEdit(false); setFormData({ numero: "", tipo: "APARTAMENTO", cuotaMantenimiento: 5000, metrosCuadrados: 100, status: "DISPONIBLE", piso: 0, area: "" }); setIsModalOpen(true); }}
            className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-2xl shadow-indigo-100 hover:bg-slate-900 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Alta de Unidad
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/20">
           <div className="relative w-full md:w-96">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="BUSCAR POR NÚMERO O BLOQUE..." 
                className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:ring-4 ring-indigo-50 outline-none transition-all placeholder:text-slate-300"
              />
           </div>
           <div className="flex gap-2">
              <button 
                onClick={() => setFilterType('ALL')}
                className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${filterType === 'ALL' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50' }`}
              >Todas las Unidades</button>
              <button 
                onClick={() => setFilterType('OCUPADAS')}
                className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${filterType === 'OCUPADAS' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50' }`}
              >Ocupadas</button>
              <button 
                onClick={() => setFilterType('MORA')}
                className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${filterType === 'MORA' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50' }`}
              >En Mora</button>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Unidad / Identificador</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Bloque / Piso</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Categoría</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Estado Actual</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Cuota (DOP)</th>
                <th className="px-8 py-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {unidades.filter(u => {
                 const matchesSearch = String(u.numero).toLowerCase().includes(searchTerm.toLowerCase()) || String(u.area || "").toLowerCase().includes(searchTerm.toLowerCase());
                 let matchesFilter = true;
                 if (filterType === 'OCUPADAS') matchesFilter = u.status === 'OCUPADO';
                 if (filterType === 'MORA') {
                   // Mock para MORA: si tiene balance > 0, o invoices atrasadas, o lo simulamos para UX si el backend aún no retorna invoices
                   matchesFilter = u.status === 'BLOQUEADO' || (u.balance && u.balance > 0) || (u.invoices && u.invoices.some((i:any) => i.estado === 'OVERDUE'));
                 }
                 return matchesSearch && matchesFilter;
              }).map((unidad) => (
                <tr key={unidad.id} className="hover:bg-indigo-50/20 transition-colors group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-slate-900 rounded-[1.25rem] flex items-center justify-center text-white font-black text-sm shadow-xl group-hover:bg-indigo-600 transition-all">
                        {unidad.numero}
                      </div>
                      <div>
                         <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{unidad.numero}</p>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{unidad.metrosCuadrados} m² totales</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                     <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-700 uppercase">{unidad.area || 'GENERAL'}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Nivel {unidad.piso || 0}</span>
                     </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 bg-slate-100 px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                      {unidad.tipo}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-xl border ${
                      unidad.status === 'OCUPADO' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                      unidad.status === 'MANTENIMIENTO' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      unidad.status === 'BLOQUEADO' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                      'bg-slate-50 text-slate-500 border-slate-200'
                    }`}>
                       <div className={`w-2 h-2 rounded-full ${unidad.status === 'OCUPADO' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                       <span className="text-[10px] font-black uppercase tracking-widest">
                          {unidad.status || 'DISPONIBLE'}
                       </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-black text-slate-900 leading-none">RD$ {Number(unidad.cuotaMantenimiento).toLocaleString()}</p>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 block">Mensualidad</span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => openEdit(unidad)}
                      className="px-6 py-2.5 bg-slate-900 text-white border border-slate-800 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-600 hover:border-indigo-500 transition-all shadow-lg"
                    >
                       Editar Propiedad
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
        title={isEdit ? "CONFIGURAR UNIDAD" : "REGISTRAR NUEVA UNIDAD"}
      >
        <form onSubmit={handleAction} className="space-y-6 p-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest ml-1">Identificador / Número</label>
                <input 
                required
                value={formData.numero}
                onChange={e => setFormData({...formData, numero: e.target.value})}
                placeholder="EJ: 101, B-402..."
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-900 focus:bg-white focus:ring-4 ring-indigo-50 outline-none transition-all"
                />
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest ml-1">Ubicación (Torre/Bloque)</label>
                <div className="relative">
                   <Map className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                   <input 
                    value={formData.area}
                    onChange={e => setFormData({...formData, area: e.target.value})}
                    placeholder="EJ: TORRE A, BLOQUE ESTE..."
                    className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-900 focus:bg-white focus:ring-4 ring-indigo-50 outline-none transition-all"
                   />
                </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest ml-1">Nivel / Piso</label>
              <div className="relative">
                 <Layers className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <input 
                    type="number"
                    value={formData.piso}
                    onChange={e => setFormData({...formData, piso: parseInt(e.target.value)})}
                    className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-900 focus:bg-white focus:ring-4 ring-indigo-50 outline-none transition-all"
                 />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest ml-1">Estatus Actual</label>
              <select 
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value})}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-900 focus:bg-white focus:ring-4 ring-indigo-50 outline-none appearance-none cursor-pointer"
              >
                <option value="DISPONIBLE">DISPONIBLE</option>
                <option value="OCUPADO">OCUPADO</option>
                <option value="MANTENIMIENTO">EN REPARACIÓN</option>
                <option value="BLOQUEADO">BLOQUEADO / LEGAL</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest ml-1">Tipo de Propiedad</label>
              <select 
                value={formData.tipo}
                onChange={e => setFormData({...formData, tipo: e.target.value})}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-900 focus:bg-white focus:ring-4 ring-indigo-50 outline-none appearance-none cursor-pointer"
              >
                <option value="APARTAMENTO">APARTAMENTO</option>
                <option value="PARQUEO">PARQUEO PRIVADO</option>
                <option value="LOCAL">LOCAL COMERCIAL</option>
                <option value="PENTHOUSE">PENTHOUSE</option>
                <option value="TRASTERO">LOWER / DEPÓSITO</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest ml-1">Metros m²</label>
              <input 
                type="number"
                required
                value={formData.metrosCuadrados}
                onChange={e => setFormData({...formData, metrosCuadrados: parseFloat(e.target.value)})}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-900 outline-none focus:bg-white focus:ring-4 ring-indigo-50 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest ml-1">Cuota de Mantenimiento (DOP)</label>
            <div className="relative">
               <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-400 text-sm">RD$</span>
               <input 
                type="number"
                required
                value={formData.cuotaMantenimiento}
                onChange={e => setFormData({...formData, cuotaMantenimiento: parseFloat(e.target.value)})}
                className="w-full pl-16 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-900 outline-none focus:bg-white focus:ring-4 ring-indigo-50 transition-all"
               />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={formLoading}
            className="w-full py-5 bg-indigo-600 text-white font-black rounded-[2.5rem] text-[10px] uppercase tracking-[0.2em] hover:bg-slate-900 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-2xl shadow-indigo-100 mt-4"
          >
            {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isEdit ? "Guardar Cambios" : "Finalizar Registro"}
          </button>
        </form>
      </Modal>

      {/* Modern Status Modal */}
      <Modal 
        isOpen={msgModal.isOpen} 
        onClose={() => setMsgModal(prev => ({ ...prev, isOpen: false }))} 
        title={msgModal.title}
      >
        <div className="text-center space-y-6 py-4">
           <div className={`w-24 h-24 rounded-[3rem] flex items-center justify-center mx-auto ${
             msgModal.type === 'success' ? 'bg-emerald-50 text-emerald-600 shadow-emerald-50' : 'bg-rose-50 text-rose-600 shadow-rose-50'
           } shadow-2xl`}>
              {msgModal.type === 'success' ? <CheckCircle2 className="w-12 h-12" /> : <AlertCircle className="w-12 h-12" />}
           </div>
           <div>
              <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">{msgModal.title}</h4>
              <p className="text-slate-700 font-bold text-sm leading-relaxed px-8">{msgModal.body}</p>
           </div>
           <button 
             onClick={() => setMsgModal(prev => ({ ...prev, isOpen: false }))}
             className="w-full py-5 bg-slate-900 text-white font-black rounded-3xl text-[10px] uppercase tracking-[0.3em] hover:bg-indigo-600 transition-all shadow-xl active:scale-95"
           >
             Continuar
           </button>
        </div>
      </Modal>
    </div>
  );
}
