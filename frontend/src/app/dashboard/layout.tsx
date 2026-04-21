"use client";

import { 
  Building2, Home, Users, CreditCard, Bell, Settings, LogOut, Menu, 
  FileText, Briefcase, Calendar, Shield, MapPin, Search, FolderOpen,
  PieChart, AlertCircle, Loader2, Zap, Package
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { fetchWithAuth } from "@/lib/api";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [condo, setCondo] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const data = await fetchWithAuth("/management/condo");
        if (data) setCondo(data);
      } catch (err) {
        console.error("❌ Fallo crítico al cargar configuración del condominio:", err);
        setError(true);
      }
    };
    
    loadConfig();
    
    const userStr = localStorage.getItem("user");
    if (userStr) setUser(JSON.parse(userStr));
  }, []);

  const menuItems = [
    { name: "Resumen", icon: Home, href: "/dashboard" },
    { name: "Financiero", icon: CreditCard, href: "/dashboard/financiero" },
    { name: "Servicios Condo", icon: Zap, href: "/dashboard/financiero/servicios" },
    { name: "Unidades", icon: Building2, href: "/dashboard/unidades" },
    { name: "Visitas & Casos", icon: Shield, href: "/dashboard/operaciones" },
    { name: "Comunicación", icon: Bell, href: "/dashboard/comunicacion" },
    { name: "Personal", icon: Briefcase, href: "/dashboard/personal" },
    { name: "Documentos", icon: FolderOpen, href: "/dashboard/documentos" },
    { name: "Directorio", icon: Users, href: "/dashboard/directorio" },
    { name: "Usuarios", icon: Shield, href: "/dashboard/usuarios" },
    { name: "Objetos Perdidos", icon: Package, href: "/dashboard/objetos-perdidos" },
    { name: "Configuración", icon: Settings, href: "/dashboard/configuracion" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 border-b border-slate-100 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="bg-indigo-600 p-2 rounded-xl h-10 w-10 flex items-center justify-center shadow-lg shadow-indigo-100">
               {condo?.logoUrl ? (
                 <img src={condo.logoUrl} alt="Logo" className="w-full h-full object-contain" />
               ) : (
                 <Building2 className="text-white w-5 h-5" />
               )}
             </div>
             <span className="text-xl font-bold tracking-tight text-slate-900 leading-tight">Condo<span className="text-indigo-600">RD</span></span>
          </div>
          <button className="lg:hidden p-2 text-slate-400" onClick={() => setIsMobileMenuOpen(false)}>
            <Menu className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link 
                key={item.href} 
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group ${
                  isActive 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="h-24 bg-white border-b border-slate-200 flex items-center justify-between px-10 shrink-0">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-lg" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex flex-col">
              <h1 className="text-xl font-black text-slate-900 leading-none tracking-tight">
                {condo?.nombre || "Cargando Condominio..."}
              </h1>
              <span className="text-[10px] text-slate-400 font-black mt-2 uppercase tracking-widest flex items-center gap-1.5">
                <MapPin className="w-3 h-3" /> {condo?.direccion || "Santo Domingo, República Dominicana"}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
             <div className="hidden xl:flex gap-4 mr-4 border-r border-slate-100 pr-8">
                <button className="p-3 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-2xl transition-all relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
             </div>
             <div className="flex items-center gap-5">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-sm font-black text-slate-900 tracking-tight uppercase">{user?.nombre || "Admin User"}</span>
                  <span className="text-[9px] text-emerald-600 font-black uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 mt-1">
                    Online Now
                  </span>
                </div>
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center border-4 border-white shadow-xl overflow-hidden shadow-indigo-100">
                   <img src={`https://ui-avatars.com/api/?name=${user?.nombre || 'User'}&background=4f46e5&color=fff`} alt="Avatar" className="w-full h-full object-cover" />
                </div>
             </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50">
           {error && (
             <div className="bg-rose-50 border-b border-rose-100 p-4 flex items-center justify-center gap-2 text-rose-600">
               <AlertCircle className="w-4 h-4" />
               <span className="text-sm font-bold">Problemas de conexión con el servidor. Mostrando información cacheada disponible.</span>
             </div>
           )}
           {children}
        </div>
      </main>
    </div>
  );
}
