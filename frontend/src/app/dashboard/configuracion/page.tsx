"use client";

import { useEffect, useState } from "react";
import { 
  Settings, Building2, Palette, Percent, Save, Loader2, Image as ImageIcon,
  MapPin, Globe, CreditCard, Plus, CheckCircle2, AlertCircle
} from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import { Modal } from "@/components/Modal";

export default function ConfiguracionPage() {
  const [condo, setCondo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msgModal, setMsgModal] = useState({ isOpen: false, title: "", body: "", type: 'success' as 'success' | 'error' });

  useEffect(() => {
    fetchWithAuth("/management/condo")
      .then(data => setCondo(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetchWithAuth("/management/condo", {
        method: "POST",
        body: JSON.stringify(condo)
      });
      setMsgModal({
        isOpen: true,
        title: "Cambios Guardados",
        body: "La configuración de tu condominio ha sido actualizada exitosamente.",
        type: 'success'
      });
    } catch (err) {
      setMsgModal({
        isOpen: true,
        title: "Error al Guardar",
        body: "No se pudo actualizar la configuración. Intente de nuevo más tarde.",
        type: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex h-[70vh] items-center justify-center">
      <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
    </div>
  );

  return (
    <div className="p-8 space-y-8 font-sans max-w-4xl mx-auto pb-20 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Configuración SaaS</h1>
          <p className="text-slate-600 font-medium mt-1">Sincroniza la identidad visual y parámetros operativos.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Identidad */}
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-all duration-700" />
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-indigo-50 p-3 rounded-2xl">
                <Building2 className="w-5 h-5 text-indigo-600" />
              </div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Identidad Corporativa</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Nombre Comercial</label>
                <input 
                  value={condo?.nombre || ""} 
                  onChange={e => setCondo({...condo, nombre: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border-slate-100 border rounded-2xl text-sm font-black text-slate-900 focus:bg-white focus:ring-2 ring-indigo-50 outline-none transition-all" 
                  placeholder="Ej: Torre Alco Paradisso" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Dirección Física</label>
                <input 
                  value={condo?.direccion || ""} 
                  onChange={e => setCondo({...condo, direccion: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border-slate-100 border rounded-2xl text-sm font-black text-slate-900 focus:bg-white focus:ring-2 ring-indigo-50 outline-none transition-all" 
                  placeholder="Ej: Calle Naco #12, Santo Domingo" 
                />
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Logo del Condominio (Branding)</label>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center border-2 border-dashed border-slate-200 overflow-hidden relative group/logo">
                  {condo?.logoUrl ? (
                    <img src={condo.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-slate-300" />
                  )}
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setCondo({...condo, logoUrl: reader.result as string});
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer z-20"
                  />
                  <div className="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover/logo:opacity-100 transition-opacity flex items-center justify-center">
                    <Plus className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                   <p className="text-xs font-bold text-slate-700">Click en el recuadro para subir imagen</p>
                   <p className="text-[10px] text-slate-400 font-medium leading-relaxed">Soporta PNG, JPG o SVG. Se recomienda fondo transparente.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Diseño y Colores */}
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-indigo-50 p-3 rounded-2xl">
                <Palette className="w-5 h-5 text-indigo-600" />
              </div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Marca Blanca & Colores</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Color Primario</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="color" 
                      value={condo?.primaryColor || "#4f46e5"} 
                      onChange={e => setCondo({...condo, primaryColor: e.target.value})}
                      className="w-16 h-16 border-none bg-transparent cursor-pointer rounded-full overflow-hidden" 
                    />
                    <div className="flex-1 px-6 py-4 bg-slate-50 rounded-2xl text-sm font-black text-slate-900 border border-slate-100 uppercase tracking-widest text-center">
                      {condo?.primaryColor?.toUpperCase() || "#4F46E5"}
                    </div>
                  </div>
               </div>
               <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Color Secundario</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="color" 
                      value={condo?.secondaryColor || "#1e293b"} 
                      onChange={e => setCondo({...condo, secondaryColor: e.target.value})}
                      className="w-16 h-16 border-none bg-transparent cursor-pointer rounded-full overflow-hidden" 
                    />
                    <div className="flex-1 px-6 py-4 bg-slate-50 rounded-2xl text-sm font-black text-slate-900 border border-slate-100 uppercase tracking-widest text-center">
                      {condo?.secondaryColor?.toUpperCase() || "#1E293B"}
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Reglas Financieras */}
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-amber-50 p-3 rounded-2xl">
                <Percent className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Cobranza & Mora</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Tasa de Mora (% Mensual)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={Number(condo?.tasaMora || 0)} 
                    onChange={e => setCondo({...condo, tasaMora: Number(e.target.value)})}
                    className="w-full px-6 py-4 bg-slate-50 border-slate-200 border rounded-2xl text-sm font-black text-slate-900 focus:bg-white focus:ring-2 ring-amber-50 outline-none transition-all" 
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Día Límite de Pago</label>
                  <select 
                    value={condo?.diaCorte || 1}
                    onChange={e => setCondo({...condo, diaCorte: Number(e.target.value)})}
                    className="w-full px-6 py-4 bg-slate-100 border-none rounded-2xl text-sm font-black text-slate-900 focus:ring-2 ring-amber-50 outline-none transition-all appearance-none cursor-pointer"
                  >
                    {[...Array(28)].map((_, i) => (
                      <option key={i+1} value={i+1}>Día {i+1} de cada mes</option>
                    ))}
                  </select>
               </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end pt-8">
           <button 
             type="submit"
             disabled={saving}
             className="bg-indigo-600 text-white px-12 py-5 rounded-[2.5rem] text-xs font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-2xl shadow-indigo-100 flex items-center gap-3 disabled:opacity-50"
           >
             {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
             Aplicar Cambios
           </button>
        </div>
      </form>

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
