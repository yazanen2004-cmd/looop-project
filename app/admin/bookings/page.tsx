"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // حالة القائمة للجوال

  useEffect(() => {
    // حماية الصفحة
    const isAuth = localStorage.getItem("isAdminAuthenticated");
    if (isAuth !== "true") router.push("/admin-login");
    
    fetchBookings();
  }, [router]);

  const fetchBookings = async () => {
    // جلب الحجوزات مع اسم المستلم وتفاصيل الدراجة (الاسم والمدة)
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id,
        reserved_time,
        booking_date,
        customer_name,
        Bikes ( name, duration )
      `)
      .order('booking_date', { ascending: false });

    if (data) setBookings(data);
    setLoading(false);
  };

  // دالة لحساب وقت نهاية الحجز
  const calculateEndTime = (startTime: string, durationMinutes: number) => {
    if (!startTime) return "";
    const [time, modifier] = startTime.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;

    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    date.setMinutes(date.getMinutes() + durationMinutes);

    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const handleDelete = async (id: string) => {
    if (confirm("حذف هذا السجل نهائياً؟")) {
      await supabase.from('bookings').delete().eq('id', id);
      fetchBookings();
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F9FF] font-sans text-right text-black pb-10" dir="rtl">
      
      {/* 1. Navbar المطور مع Menu للجوال */}
      <nav className="sticky top-0 z-[100] bg-[#1E293B] p-4 md:p-6 shadow-xl mb-6 md:mb-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          {/* زر القائمة للجوال */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white p-2">
              {isMenuOpen ? <span className="text-2xl">✕</span> : (
                <div className="space-y-1.5">
                  <span className="block w-6 h-0.5 bg-white"></span>
                  <span className="block w-6 h-0.5 bg-white"></span>
                  <span className="block w-6 h-0.5 bg-white"></span>
                </div>
              )}
            </button>
          </div>

          <Link href="/admin" className="hidden md:flex bg-sky-500/20 text-sky-200 px-6 py-2 rounded-xl border border-sky-500/50 font-bold hover:bg-sky-500 hover:text-white transition-all text-sm">
            🔙 رجوع للوحة التحكم
          </Link>

          <h1 className="text-white text-lg md:text-2xl font-black italic text-right">سجل الحجوزات <span className="text-sky-400">📋</span></h1>
        </div>
      </nav>

      {/* القائمة الجانبية المنسدلة للجوال */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: "auto" }} 
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#1E293B] border-b border-slate-700 fixed top-[68px] left-0 w-full z-50 overflow-hidden shadow-2xl p-6"
          >
            <Link href="/admin" onClick={() => setIsMenuOpen(false)} className="block text-center bg-sky-500 text-white py-4 rounded-2xl font-black text-lg shadow-lg">🔙 لوحة التحكم الرئيسية</Link>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="bg-white p-4 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden text-black">
          
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
            <h2 className="text-xl md:text-2xl font-black text-slate-800">الطلبات الواردة</h2>
            <span className="bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full font-black text-xs md:text-sm">{bookings.length} حجز كلي</span>
          </div>

          {/* عرض الجدول في الشاشات الكبيرة فقط */}
          <div className="hidden lg:block overflow-x-auto text-right">
            <table className="w-full text-right border-separate border-spacing-y-4">
              <thead>
                <tr className="text-slate-400 text-sm font-black uppercase">
                  <th className="px-6 py-2">المستلم 👤</th>
                  <th className="px-6 py-2">الدراجة</th>
                  <th className="px-6 py-2">التاريخ</th>
                  <th className="px-6 py-2">من (البداية)</th>
                  <th className="px-6 py-2">إلى (النهاية)</th>
                  <th className="px-6 py-2">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <motion.tr layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={b.id} className="bg-slate-50 rounded-2xl hover:bg-sky-50 transition-all text-black font-black">
                    <td className="px-6 py-5">{b.customer_name || "غير محدد"}</td>
                    <td className="px-6 py-5">{b.Bikes?.name}</td>
                    <td className="px-6 py-5 text-emerald-600">{b.booking_date}</td>
                    <td className="px-6 py-5 text-sky-600 bg-white/50 rounded-r-xl">{b.reserved_time}</td>
                    <td className="px-6 py-5 text-indigo-600 bg-white/50 rounded-l-xl">{calculateEndTime(b.reserved_time, b.Bikes?.duration || 0)}</td>
                    <td className="px-6 py-5">
                      <button onClick={() => handleDelete(b.id)} className="bg-white text-red-500 px-4 py-2 rounded-xl border border-red-50 hover:bg-red-500 hover:text-white transition-all shadow-sm font-black text-xs">حذف 🗑️</button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* عرض كروت للجوال والتابلت (Responsive Cards) */}
          <div className="lg:hidden space-y-4">
            {bookings.map((b) => (
              <motion.div 
                layout 
                key={b.id} 
                className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4 relative"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] text-slate-400 font-black uppercase">اسم المستلم</p>
                    <h3 className="font-black text-slate-800 text-sm">{b.customer_name || "غير محدد"}</h3>
                  </div>
                  <button onClick={() => handleDelete(b.id)} className="text-red-500 bg-white p-2 rounded-lg border border-red-50 shadow-sm">🗑️</button>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-4">
                  <div>
                    <p className="text-[10px] text-slate-400 font-black uppercase">الدراجة</p>
                    <p className="font-bold text-xs">{b.Bikes?.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-black uppercase">التاريخ</p>
                    <p className="font-black text-xs text-emerald-600">{b.booking_date}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200">
                  <div className="text-center flex-1">
                    <p className="text-[8px] text-sky-400 font-black uppercase">من</p>
                    <p className="font-black text-xs text-sky-600">{b.reserved_time}</p>
                  </div>
                  <div className="w-px h-6 bg-slate-200"></div>
                  <div className="text-center flex-1">
                    <p className="text-[8px] text-indigo-400 font-black uppercase">إلى</p>
                    <p className="font-black text-xs text-indigo-600">{calculateEndTime(b.reserved_time, b.Bikes?.duration || 0)}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {bookings.length === 0 && !loading && (
            <div className="text-center py-20 text-slate-400 font-bold italic text-sm md:text-base">لا توجد حجوزات مسجلة حالياً...</div>
          )}
        </div>
      </div>
    </div>
  );
}