"use client";

import { useEffect, useState } from "react";
import { 
  FileText, Upload, Search, Filter, 
  Download, Eye, Trash2, Loader2, Save, File, CheckCircle2, AlertCircle
} from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import { Modal } from "@/components/Modal";

export default function DocumentosPage() {
  const [documentos, setDocumentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [msgModal, setMsgModal] = useState({ isOpen: false, title: "", body: "", type: 'success' as 'success' | 'error' });
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("TODOS");
  const [formData, setFormData] = useState({
    nombre: "",
    categoria: "GENERAL",
    fileBase64: ""
  });

  const loadData = async () => {
    try {
      const data = await fetchWithAuth("/operations/documents");
      setDocumentos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fileBase64) return;
    
    setActionLoading(true);
    try {
      await fetchWithAuth("/operations/documents", {
        method: "POST",
        body: JSON.stringify(formData)
      });
      setIsModalOpen(false);
      setFormData({ nombre: "", categoria: "GENERAL", fileBase64: "" });
      setMsgModal({ isOpen: true, title: "Archivo Cargado", body: "El documento ha sido almacenado de forma segura en el repositorio.", type: 'success' });
      loadData();
    } catch (err) {
      setMsgModal({ isOpen: true, title: "Error", body: "No se pudo subir el documento. Intente de nuevo.", type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, nombre: file.name, fileBase64: reader.result as string });
      };
      reader.readAsDataURL(file);
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
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Bóveda Digital</h2>
          <p className="text-slate-700 font-medium mt-1">Gestión documental segura, reglamentos y actas oficiales.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-slate-900 shadow-xl"
        >
          <Upload className="w-4 h-4" />
          Subir Archivo
        </button>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre o etiqueta..." 
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-xs font-semibold focus:ring-2 ring-indigo-50 outline-none"
              />
           </div>
           <div className="flex gap-2">
              <button 
                onClick={() => setFilterCategory('TODOS')}
                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${filterCategory === 'TODOS' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
              >
                Todos
              </button>
              <button 
                onClick={() => setFilterCategory('REGLAMENTO')}
                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${filterCategory === 'REGLAMENTO' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
              >
                Reglamentos
              </button>
              <button 
                onClick={() => setFilterCategory('FINANZAS')}
                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${filterCategory === 'FINANZAS' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
              >
                Finanzas
              </button>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-8">
          {documentos.filter(d => {
            const matchesSearch = d.nombre.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = filterCategory === 'TODOS' || d.categoria === filterCategory;
            return matchesSearch && matchesCategory;
          }).length === 0 && (
            <div className="col-span-full py-20 text-center opacity-30">
               <FileText className="w-16 h-16 mx-auto mb-4" />
               <p className="font-black uppercase tracking-widest text-xs">No hay documentos que coincidan</p>
            </div>
          )}
          {documentos.filter(d => {
            const matchesSearch = d.nombre.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = filterCategory === 'TODOS' || d.categoria === filterCategory;
            return matchesSearch && matchesCategory;
          }).map((doc) => (
            <div key={doc.id} className="bg-slate-50/50 p-6 rounded-[2.5rem] border border-transparent hover:border-slate-100 hover:bg-white hover:shadow-xl transition-all group">
               <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <File className="w-6 h-6" />
               </div>
               <h4 className="text-sm font-black text-slate-900 line-clamp-1 mb-1 uppercase tracking-tight">{doc.nombre}</h4>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">{doc.categoria}</p>
               <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className="text-[9px] font-bold text-slate-400">PDF • 2.4MB</span>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-indigo-50 rounded-lg text-slate-400 hover:text-indigo-600 transition-all">
                       <Download className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-2 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-all">
                       <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
               </div>
            </div>
          ))}
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Repositorio Documental"
      >
        <form onSubmit={handleFileUpload} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Clasificación</label>
            <select 
              value={formData.categoria}
              onChange={e => setFormData({ ...formData, categoria: e.target.value })}
              className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 ring-indigo-50 outline-none appearance-none"
            >
              <option value="GENERAL">Documento General</option>
              <option value="REGLAMENTO">Reglamento Interno</option>
              <option value="ACTA">Acta de Asamblea</option>
              <option value="FINANZAS">Reporte Financiero</option>
              <option value="CONTRATO">Contrato de Servicio</option>
            </select>
          </div>
          
          <div className="space-y-4">
             <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Seleccionar Archivo</label>
             <div className="relative group/upload h-40 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center transition-all hover:bg-slate-50 hover:border-indigo-400">
                <input 
                  type="file" 
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center gap-2 pointer-events-none">
                   <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover/upload:scale-110 transition-all">
                      <Upload className="w-6 h-6 text-indigo-600" />
                   </div>
                   <p className="text-xs font-black text-slate-700 uppercase tracking-tight">
                     {formData.nombre || "Elegir archivo local"}
                   </p>
                </div>
             </div>
          </div>

          <button 
            type="submit" 
            disabled={actionLoading || !formData.fileBase64}
            className="w-full py-5 bg-indigo-600 text-white font-black rounded-[2rem] text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar en Bóveda
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
