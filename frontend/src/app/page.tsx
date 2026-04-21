"use client";

import { motion } from "framer-motion";
import { 
  Building2, ShieldCheck, CreditCard, Bell, ChevronRight, 
  Briefcase, FileText, Package, Users, Calendar, BarChart3, 
  Zap, Lock, Smartphone, Globe, CheckCircle2
} from "lucide-react";
import Link from "next/link";

const features = [
  { 
    title: "Gestión Financiera RD", 
    desc: "Automatización de cuotas, cargos por gas y moras en DOP. Cumple con normativas locales de transparencia.", 
    icon: CreditCard, 
    color: "bg-indigo-600",
    link: "/dashboard/financiero"
  },
  { 
    title: "Casos Operativos", 
    desc: "Control de hallazgos, reparaciones y cierre de tickets. Seguimiento de incidencias con historial detallado.", 
    icon: Package, 
    color: "bg-emerald-600",
    link: "/dashboard/operaciones"
  },
  { 
    title: "Seguridad & Cédula", 
    desc: "Registro de visitas con escaneo de cédula dominicana. Autocompletado inteligente y persistencia de visitantes frecuentes.", 
    icon: ShieldCheck, 
    color: "bg-blue-600",
    link: "/dashboard/operaciones"
  },
  { 
    title: "Nómina de Empleados", 
    desc: "Administra conserjería, seguridad y administración. Control de pagos, turnos y cargos específicos.", 
    icon: Briefcase, 
    color: "bg-purple-600",
    link: "/dashboard/nomina"
  },
  { 
    title: "Reservas Sociales", 
    desc: "Calendario interactivo para gimnasio, piscina y salones. Evita conflictos y automatiza la aprobación.", 
    icon: Calendar, 
    color: "bg-amber-600",
    link: "/dashboard/reservaciones"
  },
  { 
    title: "Inteligencia de Datos", 
    desc: "Reportes interactivos de morosidad, flujo de caja y ocupación para juntas de vecinos informadas.", 
    icon: BarChart3, 
    color: "bg-rose-600",
    link: "/dashboard/reportes"
  }
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header Premium */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="bg-slate-900 p-2 rounded-xl">
                <Building2 className="text-white w-6 h-6" />
             </div>
             <span className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Condo<span className="text-indigo-600">RD</span></span>
          </div>
          <div className="hidden lg:flex items-center gap-10 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">
             <a href="#features" className="hover:text-indigo-600 transition-colors">Ecosistema</a>
             <a href="#pricing" className="hover:text-indigo-600 transition-colors">SaaS Pro</a>
             <a href="#demo" className="hover:text-indigo-600 transition-colors">Solicitar Demo</a>
          </div>
          <div className="flex items-center gap-4">
             <Link href="/login" className="text-[10px] font-black uppercase tracking-widest text-slate-900 px-6 py-3 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all">Portal Administrativo</Link>
             <Link href="/login" className="text-[10px] font-black uppercase tracking-widest bg-indigo-600 text-white px-8 py-3 rounded-2xl shadow-xl shadow-indigo-100 hover:bg-slate-900 transition-all">Prueba Gratis</Link>
          </div>
        </div>
      </nav>

      <main className="pt-32">
        {/* Modern Hero */}
        <section className="px-8 pb-32 max-w-7xl mx-auto">
           <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div>
                 <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-2xl mb-8"
                 >
                    <Zap className="w-4 h-4 text-indigo-600 fill-indigo-600" />
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">SaaS de Gestión Inmobiliaria Nivel Enterprise</span>
                 </motion.div>
                 <h1 className="text-7xl font-black text-slate-900 leading-[0.95] mb-8 uppercase tracking-tighter">
                    Toda tu operación <br />
                    <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-8">bajo control.</span>
                 </h1>
                 <p className="text-xl text-slate-500 font-bold leading-relaxed mb-12 max-w-xl">
                    Desde el cobro de cuotas hasta la seguridad de portería. Una plataforma única diseñada específicamente para la realidad administrativa de República Dominicana.
                 </p>
                 <div className="flex flex-col sm:flex-row gap-4">
                    <button className="bg-slate-900 text-white px-10 py-5 rounded-[2.5rem] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-2xl shadow-slate-200 flex items-center justify-center gap-3 group">
                       Revolucionar mi Condominio
                       <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <div className="flex items-center gap-4 px-6">
                       <div className="flex -space-x-3">
                          {[1,2,3].map(i => <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-slate-200" />)}
                       </div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Utilizado por 250+ Administraciones</p>
                    </div>
                 </div>
              </div>

              <div className="relative group">
                 <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-[5rem] opacity-20 blur-2xl group-hover:opacity-30 transition-opacity" />
                 
                 {/* Main Image Container */}
                 <div className="relative aspect-square rounded-[5rem] overflow-hidden border border-slate-100 shadow-2xl z-10 bg-slate-50">
                    <img 
                      src="/images/hero.png" 
                      alt="CondoRD Dashboard"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
                 </div>

                 {/* Floating Cards (Moved outside overflow-hidden) */}
                 <div className="absolute top-20 -left-10 bg-white/95 backdrop-blur-2xl p-6 rounded-[2rem] shadow-2xl border border-slate-100 max-w-[200px] animate-bounce duration-[4000ms] z-20">
                    <div className="bg-emerald-500 text-white w-10 h-10 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-100">
                       <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cobranza Mayo</p>
                    <p className="text-xl font-black text-slate-900 uppercase tracking-tighter">98.5% DOP</p>
                 </div>
                 
                 <div className="absolute bottom-20 -right-12 bg-white/95 backdrop-blur-2xl p-6 rounded-[2rem] shadow-2xl border border-slate-100 max-w-[220px] z-20">
                    <div className="bg-indigo-600 text-white w-10 h-10 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-100">
                       <ShieldCheck className="w-6 h-6" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cédula Escaneada</p>
                    <p className="text-sm font-black text-slate-900 uppercase tracking-tighter">402-XXXXXXX-1</p>
                 </div>
              </div>

           </div>
        </section>

        {/* Ecosistema Grid */}
        <section id="features" className="bg-slate-50 py-32 px-8 overflow-hidden">
           <div className="max-w-7xl mx-auto">
              <div className="flex flex-col items-center text-center mb-20">
                 <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em] mb-4">El Ecosistema Completo</span>
                 <h2 className="text-6xl font-black text-slate-900 tracking-tighter uppercase leading-[0.9]">Módulos de Alto <br />Desempeño</h2>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {features.map((f, i) => (
                   <motion.div 
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden"
                   >
                      <div className={`w-20 h-20 rounded-[2rem] ${f.color} text-white flex items-center justify-center mb-10 shadow-2xl shadow-indigo-100`}>
                         <f.icon className="w-10 h-10" />
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-4">{f.title}</h3>
                      <p className="text-slate-500 font-bold leading-relaxed mb-8">{f.desc}</p>
                      <Link href="/login" className="inline-flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                         Explorar Módulo <ChevronRight className="w-4 h-4" />
                      </Link>
                   </motion.div>
                 ))}
              </div>
           </div>
        </section>

        {/* Product Showcase */}
        <section className="py-32 px-8">
           <div className="max-w-7xl mx-auto space-y-32">
              {/* Financial Box */}
              <div className="grid lg:grid-cols-2 gap-20 items-center">
                 <div className="order-2 lg:order-1">
                    <div className="relative rounded-[4rem] overflow-hidden shadow-2xl border border-slate-100">
                       <img src="/images/financial.png" alt="Finanzas RD" className="w-full h-auto" />
                    </div>
                 </div>
                 <div className="order-1 lg:order-2">
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em] mb-4 block">Transparencia Total</span>
                    <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-8">Control Financiero <br /><span className="text-emerald-600">Nivel Bancario.</span></h2>
                    <p className="text-lg text-slate-500 font-bold leading-relaxed mb-6">
                       Emisión masiva de facturas con soporte para NCF, gestión de moras configurables y conciliación de pagos en DOP. Todo diseñado para la contabilidad dominicana.
                    </p>
                    <Link href="/login" className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 hover:text-indigo-600 transition-colors">
                       Ver demo financiera <ChevronRight className="w-4 h-4" />
                    </Link>
                 </div>
              </div>

              {/* Security Box */}
              <div className="grid lg:grid-cols-2 gap-20 items-center">
                 <div>
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-4 block">Seguridad Perimetral</span>
                    <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-8">Escaneo de Cédula <br /><span className="text-blue-600">Integrado.</span></h2>
                    <p className="text-lg text-slate-500 font-bold leading-relaxed mb-6">
                       Moderniza tu entrada. Escanea la cédula del visitante y obtén nombre completo y validación al instante. Portería digital 24/7 con historial inmutable.
                    </p>
                    <Link href="/login" className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 hover:text-indigo-600 transition-colors">
                       Ver demo de seguridad <ChevronRight className="w-4 h-4" />
                    </Link>
                 </div>
                 <div>
                    <div className="relative rounded-[4rem] overflow-hidden shadow-2xl border border-slate-100">
                       <img src="/images/security.png" alt="Seguridad Cédula" className="w-full h-auto" />
                    </div>
                 </div>
              </div>
           </div>
        </section>

        <section className="py-32 px-8 max-w-7xl mx-auto">
           <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div className="grid grid-cols-2 gap-6">
                 {[
                    { icon: Lock, label: "Seguridad Bancaria" },
                    { icon: Smartphone, label: "App Residente" },
                    { icon: Globe, label: "Cloud Sync 24/7" },
                    { icon: Users, label: "Multi-Admin" }
                 ].map((t, i) => (
                    <div key={i} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex flex-col items-center text-center">
                       <t.icon className="w-8 h-8 text-slate-900 mb-4" />
                       <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{t.label}</span>
                    </div>
                 ))}
              </div>
              <div>
                 <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-8">Infraestructura <br /><span className="text-indigo-600">Resiliente.</span></h2>
                 <p className="text-lg text-slate-500 font-bold leading-relaxed mb-10">
                    Desarrollado con arquitectura SaaS moderna para garantizar aislamiento total de datos (Multi-tenancy) y disponibilidad extrema incluso en períodos de alta facturación masiva.
                 </p>
                 <ul className="space-y-4">
                    {["Aislamiento Multi-tenant Real", "Backups Automáticos Diarios", "API de Integración Abierta", "Soporte Local Dominicana"].map(item => (
                       <li key={item} className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          <span className="text-sm font-black text-slate-700 uppercase tracking-tight">{item}</span>
                       </li>
                    ))}
                 </ul>
              </div>
           </div>
        </section>
      </main>

      {/* Footer Industrial */}
      <footer className="bg-slate-900 py-32 px-8">
         <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-4 gap-16 mb-20">
               <div className="col-span-2">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="bg-indigo-600 p-2 rounded-xl">
                        <Building2 className="text-white w-6 h-6" />
                    </div>
                    <span className="text-2xl font-black text-white tracking-widest uppercase">Condo<span className="text-indigo-500">RD</span></span>
                  </div>
                  <p className="text-slate-500 font-bold max-w-sm mb-10 uppercase text-xs tracking-widest leading-loose">
                     Transformando la administración habitacional en el Caribe a través de tecnología disruptiva y automatizada.
                  </p>
               </div>
               <div>
                  <h4 className="text-white font-black uppercase tracking-[0.3em] text-[10px] mb-8">Plataforma</h4>
                  <ul className="space-y-4 text-slate-400 font-bold text-xs uppercase tracking-widest">
                     <li><a href="#" className="hover:text-indigo-400 px-1">Finanzas</a></li>
                     <li><a href="#" className="hover:text-indigo-400 px-1">Seguridad</a></li>
                     <li><a href="#" className="hover:text-indigo-400 px-1">Operaciones</a></li>
                     <li><a href="#" className="hover:text-indigo-400 px-1">Nómina</a></li>
                  </ul>
               </div>
               <div>
                  <h4 className="text-white font-black uppercase tracking-[0.3em] text-[10px] mb-8">Compañía</h4>
                  <ul className="space-y-4 text-slate-400 font-bold text-xs uppercase tracking-widest">
                     <li><a href="#" className="hover:text-indigo-400 px-1">Sobre Nosotros</a></li>
                     <li><a href="#" className="hover:text-indigo-400 px-1">Contacto</a></li>
                     <li><a href="#" className="hover:text-indigo-400 px-1">Blog Administrativo</a></li>
                  </ul>
               </div>
            </div>
            <div className="pt-20 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
               <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">© 2026 CondoRD - Todos los derechos reservados.</p>
               <div className="flex items-center gap-8 text-slate-600 text-[10px] font-black uppercase tracking-widest">
                  <span className="flex items-center gap-2">🇩🇴 HECHO EN RD</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                  <span>SISTEMA VERIFICADO</span>
               </div>
            </div>
         </div>
      </footer>
    </div>
  );
}
