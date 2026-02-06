"use client";
import { useState } from "react";
import { supabase } from "../utils/supabase";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert("خطأ في التسجيل: " + error.message);
    } else {
      alert("تم إنشاء الحساب بنجاح! افحص بريدك لتفعيل الحساب.");
      router.push("/login");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-right font-sans" dir="rtl">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl max-w-md w-full border border-slate-100">
        <h1 className="text-3xl font-black text-slate-900 mb-2">إنشاء حساب جديد 🚲</h1>
        <p className="text-slate-500 mb-8 font-bold">انضم لعائلة LOOOP وابدأ رحلتك الآن</p>

        <form onSubmit={handleSignUp} className="space-y-6">
          <div>
            <label className="block text-sm font-black text-slate-800 mb-2">البريد الإلكتروني</label>
            <input 
              type="email" 
              required
              className="w-full p-4 border-2 border-slate-100 rounded-2xl focus:border-blue-600 outline-none text-slate-900 font-bold"
              placeholder="example@mail.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-black text-slate-800 mb-2">كلمة السر</label>
            <input 
              type="password" 
              required
              className="w-full p-4 border-2 border-slate-100 rounded-2xl focus:border-blue-600 outline-none text-slate-900 font-bold"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95"
          >
            {loading ? "جاري الإنشاء..." : "إنشاء الحساب 🚀"}
          </button>
        </form>
        <p className="mt-8 text-center text-slate-600 font-bold">
          عندك حساب؟ <a href="/login" className="text-blue-600 hover:underline">سجل دخولك هنا</a>
        </p>
      </div>
    </div>
  );
}