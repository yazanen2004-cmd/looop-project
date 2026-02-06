"use client";
import { useState } from "react";
import { supabase } from "../../utils/supabase"; 
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function AdminLogin() {
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('admin_access') 
        .select('*')
        .eq('admin_identifier', adminId)
        .eq('secret_password', password)
        .single();

      if (error || !data) {
        throw new Error("بيانات الدخول غير صحيحة ❌");
      }

      localStorage.setItem("isAdminAuthenticated", "true");
      alert("أهلاً بك أيها المدير! جاري التوجيه...");
      router.push("/admin"); 

    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1E293B] font-sans text-right px-4" dir="rtl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-2xl w-full max-w-md border-4 border-sky-500/10 text-black"
      >
        <div className="text-center mb-6 md:mb-8 text-black">
          <div className="text-4xl md:text-5xl mb-4">🔐</div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-800">دخول الإدارة</h2>
          <p className="text-slate-400 font-bold text-[10px] md:text-sm mt-2">خاص بمديري مشروع LOOOP</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 md:space-y-5">
          <div>
            <label className="block text-slate-700 font-black text-xs md:text-sm mb-2 mr-2">الرقم التعريفي (Admin ID)</label>
            <input 
              type="text" 
              required
              className="w-full p-3 md:p-4 bg-slate-50 border-2 border-slate-100 rounded-xl md:rounded-2xl outline-none focus:border-sky-500 transition-all font-bold text-slate-900 text-sm md:text-base"
              placeholder="أدخل الـ ID الخاص بك"
              onChange={(e) => setAdminId(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-slate-700 font-black text-xs md:text-sm mb-2 mr-2">كلمة المرور السرية</label>
            <input 
              type="password" 
              required
              className="w-full p-3 md:p-4 bg-slate-50 border-2 border-slate-100 rounded-xl md:rounded-2xl outline-none focus:border-sky-500 transition-all font-bold text-slate-900 text-sm md:text-base"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#1E293B] text-white py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-base md:text-lg hover:bg-sky-600 transition-all shadow-lg active:scale-95 disabled:bg-slate-300"
          >
            {loading ? "جاري التحقق..." : "دخول للنظام 🚀"}
          </button>
        </form>
        
        <div className="mt-6 md:mt-8 text-center text-black">
          <button onClick={() => router.push("/")} className="text-slate-400 hover:text-sky-500 font-bold text-xs md:text-sm transition-colors">
            ← العودة للصفحة الرئيسية
          </button>
        </div>
      </motion.div>
    </div>
  );
}