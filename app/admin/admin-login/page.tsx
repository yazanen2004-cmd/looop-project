"use client";
import { useState } from "react";
import { supabase } from "../../utils/supabase"; // تأكد من صحة مسار ملف السوبا بيس عندك
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // لاحظ اسم الجدول أصبح أحرف صغيرة بالكامل
const { data, error } = await supabase
  .from('admin_access') 
  .select('*')
  .eq('admin_identifier', adminId)
  .eq('secret_password', password)
  .single();

      if (error || !data) {
        throw new Error("بيانات الدخول غير صحيحة ❌");
      }

      // إذا البيانات صحيحة، نخزن علامة في المتصفح ونوجهه لصفحة الإدارة
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
    <div className="min-h-screen flex items-center justify-center bg-[#1E293B] font-sans text-right" dir="rtl">
      <div className="bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-md border-4 border-sky-500/10">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🔐</div>
          <h2 className="text-3xl font-black text-slate-800">دخول الإدارة</h2>
          <p className="text-slate-400 font-bold text-sm mt-2">خاص بمديري مشروع LOOOP</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-slate-700 font-black mb-2 mr-2">الرقم التعريفي (Admin ID)</label>
            <input 
              type="text" 
              required
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-sky-500 transition-all font-bold text-slate-900"
              placeholder="أدخل الـ ID الخاص بك"
              onChange={(e) => setAdminId(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-slate-700 font-black mb-2 mr-2">كلمة المرور السرية</label>
            <input 
              type="password" 
              required
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-sky-500 transition-all font-bold text-slate-900"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#1E293B] text-white py-5 rounded-2xl font-black text-lg hover:bg-sky-600 transition-all shadow-lg active:scale-95 disabled:bg-slate-300"
          >
            {loading ? "جاري التحقق..." : "دخول للنظام 🚀"}
          </button>
        </form>
        
        <div className="mt-8 text-center">
          <button onClick={() => router.push("/")} className="text-slate-400 hover:text-sky-500 font-bold text-sm transition-colors">
            ← العودة للصفحة الرئيسية
          </button>
        </div>
      </div>
    </div>
  );
}