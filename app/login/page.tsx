"use client";
import { useState } from "react";
import { supabase } from "../utils/supabase";
import { useRouter } from "next/navigation";

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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-right font-sans" dir="rtl">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl max-w-md w-full border border-slate-100">
        <h1 className="text-3xl font-black text-slate-900 mb-2">تسجيل الدخول 👋</h1>
        <p className="text-slate-500 mb-8 font-bold">مرحباً بعودتك، اشتقنا لك!</p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-black text-slate-800 mb-2">البريد الإلكتروني</label>
            <input 
              type="email" 
              required
              className="w-full p-4 border-2 border-slate-100 rounded-2xl focus:border-blue-600 outline-none text-slate-900 font-bold"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-black text-slate-800 mb-2">كلمة السر</label>
            <input 
              type="password" 
              required
              className="w-full p-4 border-2 border-slate-100 rounded-2xl focus:border-blue-600 outline-none text-slate-900 font-bold"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-blue-600 transition-all shadow-xl active:scale-95"
          >
            {loading ? "جاري الدخول..." : "دخول 🔑"}
          </button>
        </form>
        <p className="mt-8 text-center text-slate-600 font-bold">
          جديد عنا؟ <a href="/signup" className="text-blue-600 hover:underline">افتح حساب جديد</a>
        </p>
      </div>
    </div>
  );
}