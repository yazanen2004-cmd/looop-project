"use client";
import { useState } from "react";
import { supabase } from "../utils/supabase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("فشل الدخول: " + error.message);
    } else {
      router.push("/"); // العودة للصفحة الرئيسية بعد الدخول
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-6 text-right font-sans text-black" dir="rtl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl max-w-md w-full border border-slate-100 text-black"
      >
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">تسجيل الدخول 👋</h1>
        <p className="text-slate-500 mb-6 md:mb-8 font-bold text-xs md:text-base">مرحباً بعودتك، اشتقنا لك!</p>

        <form onSubmit={handleLogin} className="space-y-4 md:space-y-6">
          <div>
            <label className="block text-xs md:text-sm font-black text-slate-800 mb-2 mr-2">البريد الإلكتروني</label>
            <input 
              type="email" 
              required
              className="w-full p-3 md:p-4 border-2 border-slate-100 rounded-xl md:rounded-2xl focus:border-blue-600 outline-none text-slate-900 font-bold text-sm md:text-base"
              placeholder="example@mail.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs md:text-sm font-black text-slate-800 mb-2 mr-2">كلمة السر</label>
            <input 
              type="password" 
              required
              className="w-full p-3 md:p-4 border-2 border-slate-100 rounded-xl md:rounded-2xl focus:border-blue-600 outline-none text-slate-900 font-bold text-sm md:text-base"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3.5 md:py-4 bg-slate-900 text-white rounded-xl md:rounded-2xl font-black text-base md:text-lg hover:bg-blue-600 transition-all shadow-xl active:scale-95 disabled:bg-slate-300"
          >
            {loading ? "جاري الدخول..." : "دخول 🔑"}
          </button>
        </form>
        <p className="mt-6 md:mt-8 text-center text-slate-600 font-bold text-xs md:text-sm">
          جديد عنا؟ <a href="/signup" className="text-blue-600 hover:underline">افتح حساب جديد</a>
        </p>
      </motion.div>
    </div>
  );
}