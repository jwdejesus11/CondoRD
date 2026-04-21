"use client";

import { useEffect, useState } from "react";
import { 
  TrendingUp, TrendingDown, DollarSign, Building2, 
  Clock, ShieldCheck, AlertCircle, Plus, 
  ArrowUpRight, Download, Filter, FileText, ChevronRight,
  Calendar, Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadData = async () => {
    try {
      const data = await fetchWithAuth("/management/dashboard");
      setStats({
        totalUnits: data.stats.totalUnits,
        totalBalance: data.stats.totalBalance,
        occupied: data.stats.occupied,
        pendingInvoices: data.stats.pendingCount,
        recentActivity: data.recentActivity
      });
    } catch (err) {
      setStats({ totalUnits: 0, totalBalance: 0, occupied: 0, pendingInvoices: 0, recentActivity: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(stats));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "reporte_condo_resumen.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  if (loading) return (
    <div className="flex h-[70vh] items-center justify-center">
      <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
    </div>
  );

  return (
    <div className="p-8 space-y-8 font-sans max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Buenos días, <span className="text-indigo-600">ADMINISTRADOR</span></h1>
          <p className="text-slate-400 font-medium mt-1">SISTEMA DINÁMICO ACTIVO - Aquí tienes el resumen de hoy.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-black rounded-xl text-xs uppercase tracking-widest text-[10px] shadow-sm hover:bg-slate-50 transition-all border border-slate-200"
          >
            <Download className="w-4 h-4 text-slate-400" />
            Exportar Resumen
          </button>
          <button 
            onClick={() => router.push("/dashboard/unidades")}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-black rounded-xl text-xs shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all border border-indigo-500 uppercase tracking-widest text-[10px]"
          >
            <Plus className="w-4 h-4" />
            Añadir Unidad
          </button>
        </div>
      </div>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Balance General", value: "RD$ " + Number(stats.totalBalance).toLocaleString(), trend: "Actualizado", positive: true, icon: DollarSign, color: "bg-indigo-600" },
          { title: "Unidades Totales", value: stats.totalUnits, trend: "Sin cambios", positive: true, icon: Building2, color: "bg-emerald-600" },
          { title: "Ocupación Real", value: stats.totalUnits > 0 ? `${Math.round((stats.occupied/stats.totalUnits)*100)}%` : "0%", trend: "Calculado", positive: true, icon: ShieldCheck, color: "bg-blue-600" },
          { title: "Pagos Pendientes", value: stats.pendingInvoices, trend: "Por cobrar", positive: false, icon: Clock, color: "bg-amber-600" }
        ].map((kpi, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500">
             <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:bg-indigo-50 transition-colors" />
             <div className="relative z-10 flex flex-col h-full">
                <div className={`w-12 h-12 ${kpi.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-slate-100 group-hover:scale-110 transition-transform`}>
                   <kpi.icon className="text-white w-6 h-6" />
                </div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{kpi.title}</h3>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-black text-slate-900 leading-tight">{kpi.value}</p>
                  <span className={`text-[10px] font-black ${kpi.positive ? 'text-emerald-500' : 'text-rose-500'} flex items-center gap-0.5`}>
                     {kpi.positive ? <ArrowUpRight className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                     {kpi.trend}
                  </span>
                </div>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
           <div className="flex items-center justify-between px-4">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Actividad Reciente</h3>
              <button className="text-xs font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest">Ver Todo</button>
           </div>
           
           <div className="space-y-4">
             {(!stats.recentActivity || stats.recentActivity.length === 0) ? (
               <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden p-8 text-center">
                 <ShieldCheck className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                 <p className="text-sm font-bold text-slate-400 font-sans">No hay actividad reciente para mostrar.</p>
               </div>
             ) : (
               stats.recentActivity.map((act: any) => (
                 <div key={act.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-indigo-100 transition-all">
                    <div className="flex items-center gap-4">
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                         act.type === 'INVOICE' ? 'bg-indigo-50 text-indigo-600' : 
                         act.type === 'CASE' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                       }`}>
                          {act.type === 'INVOICE' ? <FileText className="w-5 h-5" /> : 
                           act.type === 'CASE' ? <AlertCircle className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                       </div>
                       <div>
                          <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{act.title}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                             {new Date(act.date).toLocaleDateString('es-DO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </p>
                       </div>
                    </div>
                    {act.amount && (
                      <p className="text-sm font-black text-slate-900 uppercase">RD$ {Number(act.amount).toLocaleString()}</p>
                    )}
                 </div>
               ))
             )}
           </div>
        </div>

        {/* Quick Actions / Shortcuts */}
        <div className="space-y-6">
           <h3 className="text-xl font-black text-slate-900 tracking-tight px-4">Accesos Directos</h3>
           <div className="grid grid-cols-1 gap-4">
              <div 
                onClick={() => router.push("/dashboard/operaciones")}
                className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100 relative overflow-hidden group cursor-pointer h-40 flex flex-col justify-center"
              >
                 <h4 className="text-lg font-black leading-tight uppercase">Gestión Operativa</h4>
                 <p className="text-indigo-200 text-[10px] mt-2 font-black uppercase tracking-widest">Control de visitas y seguridad</p>
                 <ChevronRight className="absolute bottom-8 right-8 w-6 h-6 text-indigo-400 group-hover:translate-x-2 transition-transform" />
              </div>

              <div 
                onClick={() => router.push("/dashboard/financiero")}
                className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group cursor-pointer h-40 flex flex-col justify-center"
              >
                 <h4 className="text-lg font-black leading-tight uppercase">Reportes Financieros</h4>
                 <p className="text-slate-500 text-[10px] mt-2 font-black uppercase tracking-widest">Estado de cuenta y cobros</p>
                 <ChevronRight className="absolute bottom-8 right-8 w-6 h-6 text-slate-700 group-hover:translate-x-2 transition-transform" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
