"use client";

import { useEffect, useState } from "react";
import { 
  Users, UserPlus, Search, Shield, 
  Mail, ChevronRight, Loader2, Key, Save, CheckCircle2, AlertCircle
} from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import { Modal } from "@/components/Modal";

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [msgModal, setMsgModal] = useState({ isOpen: false, title: "", body: "", type: 'success' as 'success' | 'error' });
  const [formData, setFormData] = useState({
    userId: "",
    email: "",
    nombre: "",
    password: "",
    role: "OWNER"
  });

  const openEdit = (item: any) => {
    setFormData({
      userId: item.user.id,
      email: item.user.email,
      nombre: item.user.nombre || "",
      password: "",
      role: item.role
    });
    setIsModalOpen(true);
  };

  const loadData = async () => {
    try {
      const data = await fetchWithAuth("/management/users");
      setUsuarios(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await fetchWithAuth("/management/users", {
        method: "POST",
        body: JSON.stringify({ ...formData, role: formData.role.toUpperCase() })
      });
      setIsModalOpen(false);
      setFormData({ userId: "", email: "", nombre: "", password: "", role: "OWNER" });
      setMsgModal({ isOpen: true, title: "Éxito", body: "Usuario gestionado correctamente.", type: 'success' });
      loadData();
    } catch (err) {
      setMsgModal({ isOpen: true, title: "Error", body: "No se pudo gestionar el usuario.", type: 'error' });
    } finally {
      setFormLoading(false);
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
          <h2 className="text-3xl font-black text-slate-900 tracking-tight text-indigo-600 uppercase">Gestión de Accesos</h2>
          <p className="text-slate-700 font-medium mt-1">Control de usuarios, roles y permisos del sistema.</p>
        </div>
        <button 
          onClick={() => { setFormData({ userId: "", email: "", nombre: "", password: "", role: "OWNER" }); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-indigo-100"
        >
          <UserPlus className="w-3.5 h-3.5" />
          Nuevo Usuario
        </button>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
           <div className="relative w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                placeholder="Buscar por email o nombre..." 
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-xs font-semibold focus:ring-2 ring-indigo-50 outline-none"
              />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest">Colaborador / Usuario</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest">Rol Asignado</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest">Email</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest">Estado</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {usuarios.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-black text-xs uppercase">
                        {item.user.nombre?.[0] || 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{item.user.nombre}</p>
                        <p className="text-[10px] font-bold text-slate-600 font-mono tracking-tighter">ID: {item.user.id.slice(0,8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border ${
                      item.role === 'CONDO_ADMIN' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                      item.role === 'SECURITY' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      'bg-slate-50 text-slate-600 border-slate-100'
                    }`}>
                      {item.role}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      {item.user.email}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-emerald-500" />
                       <span className="text-xs font-bold text-slate-600 font-black uppercase tracking-widest text-[9px]">Activo</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button onClick={() => openEdit(item)} className="p-2 hover:bg-white rounded-xl transition-all opacity-0 group-hover:opacity-100 shadow-sm border border-slate-100">
                       <Key className="w-4 h-4 text-slate-400" />
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
        title={formData.userId ? "Editar Acceso y Contraseña" : "Gestionar Nuevo Acceso"}
      >
        <form onSubmit={handleAddUser} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest ml-1">Nombre Completo</label>
            <input 
              required
              value={formData.nombre}
              onChange={e => setFormData({...formData, nombre: e.target.value})}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 ring-indigo-50 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest ml-1">Correo Electrónico</label>
            <input 
              required
              disabled={!!formData.userId}
              type="email"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 ring-indigo-50 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest ml-1">{formData.userId ? 'Nueva Contraseña (Dejar en blanco para mantener actual)' : 'Contraseña de Acceso'}</label>
            <input 
              required={!formData.userId}
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 ring-indigo-50 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest ml-1">Rol del Sistema</label>
            <select 
              value={formData.role}
              onChange={e => setFormData({...formData, role: e.target.value})}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 focus:bg-white focus:ring-2 ring-indigo-50 outline-none appearance-none cursor-pointer"
            >
              <option value="CONDO_ADMIN">Administrador de Condominio</option>
              <option value="OWNER">Propietario</option>
              <option value="TENANT">Inquilino</option>
              <option value="SECURITY">Seguridad / Portería</option>
              <option value="EMPLOYEE">Empleado / Mantenimiento</option>
            </select>
          </div>
          <button 
            type="submit" 
            disabled={formLoading}
            className="w-full py-5 bg-indigo-600 text-white font-black rounded-[2rem] text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {formData.userId ? "Guardar Cambios" : "Crear Usuario"}
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
