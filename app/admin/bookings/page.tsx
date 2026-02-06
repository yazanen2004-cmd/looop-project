"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AdminBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    <div className="min-h-screen bg-[#F0F9FF] font-sans text-right text-black" dir="rtl">
      <nav className="bg-[#1E293B] p-6 shadow-xl mb-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/admin" className="bg-sky-500/20 text-sky-200 px-6 py-2 rounded-xl border border-sky-500/50 font-bold hover:bg-sky-500 hover:text-white transition-all">🔙 رجوع للوحة التحكم</Link>
          <h1 className="text-white text-2xl font-black italic text-right">سجل حجوزات المستخدمين 📋</h1>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden text-black">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black text-slate-800">قائمة الطلبات الواردة</h2>
            <span className="bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full font-black text-sm">{bookings.length} حجز كلي</span>
          </div>

          <div className="overflow-x-auto text-right">
            <table className="w-full text-right border-separate border-spacing-y-4">
              <thead>
                <tr className="text-slate-400 text-sm font-black uppercase">
                  <th className="px-6 py-2">اسم المستلم 👤</th>
                  <th className="px-6 py-2 text-right">الدراجة</th>
                  <th className="px-6 py-2 text-right">التاريخ</th>
                  {/* فصل الأعمدة */}
                  <th className="px-6 py-2 text-right">من (وقت البداية) ⏰</th>
                  <th className="px-6 py-2 text-right">إلى (وقت النهاية) 🏁</th>
                  <th className="px-6 py-2 text-right">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <motion.tr layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={b.id} className="bg-slate-50 rounded-2xl hover:bg-sky-50 transition-all text-black font-black">
                    <td className="px-6 py-5 text-black font-black">{b.customer_name || "غير محدد"}</td>
                    <td className="px-6 py-5 text-black">{b.Bikes?.name}</td>
                    <td className="px-6 py-5 text-emerald-600 font-black">{b.booking_date}</td>
                    {/* عمود وقت البداية */}
                    <td className="px-6 py-5 text-sky-600 font-black bg-white/50 rounded-r-xl">
                      {b.reserved_time}
                    </td>
                    {/* عمود وقت النهاية المنفصل */}
                    <td className="px-6 py-5 text-indigo-600 font-black bg-white/50 rounded-l-xl">
                      {calculateEndTime(b.reserved_time, b.Bikes?.duration || 0)}
                    </td>
                    <td className="px-6 py-5">
                      <button onClick={() => handleDelete(b.id)} className="bg-white text-red-500 px-4 py-2 rounded-xl border border-red-50 hover:bg-red-500 hover:text-white transition-all shadow-sm font-black text-xs">حذف 🗑️</button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {bookings.length === 0 && !loading && (
              <div className="text-center py-20 text-slate-400 font-bold italic">لا توجد حجوزات مسجلة حالياً...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}