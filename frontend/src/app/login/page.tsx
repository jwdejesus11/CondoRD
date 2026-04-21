"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Lock, Mail, ArrowRight, Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@condord.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const res = await fetch("http://127.0.0.1:4000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) throw new Error("Credenciales inválidas");

      const data = await res.json();
      
      // Guardar sesión
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      if (data.user.condo) {
        localStorage.setItem("condoId", data.user.condo.id);
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-3 justify-center mb-12">
          <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-100">
            <Building2 className="text-white w-6 h-6" />
          </div>
          <span className="text-3xl font-black tracking-tight text-slate-900 leading-tight">Condo<span className="text-indigo-600">RD</span></span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200 border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-50" />
          
          <div className="relative z-10">
            <h2 className="text-2xl font-black text-slate-900 mb-2">Bienvenido de nuevo</h2>
            <p className="text-slate-400 text-sm font-medium mb-8">Ingresa tus credenciales para administrar tu condominio.</p>

            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-center gap-3 text-sm font-bold animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@condord.com"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 ring-indigo-50 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between pb-1">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Contraseña</label>
                   <a href="#" className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-700">¿Olvidaste la clave?</a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 ring-indigo-50 outline-none transition-all"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Entrar al Panel <ArrowRight className="w-5 h-5" /></>}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center mt-10 text-xs font-bold text-slate-400">
          ¿No tienes una cuenta? <span className="text-indigo-600 cursor-pointer">Solicita una demo</span>
        </p>
      </div>
    </div>
  );
}
