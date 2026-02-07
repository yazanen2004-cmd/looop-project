"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminBookingsPage() {
  const router = useRouter();
  
  // --- 1. تعريف الحالات (States) - هاد الجزء اللي كان ناقص عندك ومسبب أخطاء ---
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // حالات مودالات الحجز
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  
  // حالات تخزين السبب المختار أو اليدوي
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [customReason, setCustomReason] = useState(""); 

  // --- 2. جلب البيانات وحماية الصفحة ---
  useEffect(() => {
    const isAuth = localStorage.getItem("isAdminAuthenticated");
    if (isAuth !== "true") router.push("/admin-login");
    fetchBookings();
  }, [router]);

  const fetchBookings = async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select(`id, reserved_time, booking_date, customer_name, user_id, Bikes ( name, duration )`)
      .order('booking_date', { ascending: false });

    if (data) setBookings(data);
    setLoading(false);
  };

  // --- 3. الدوال المنطقية ---
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

  // دالة تأكيد الإلغاء مع السبب اليدوي
  const handleConfirmCancel = async () => {
    const finalReason = cancelReason === "سبب آخر" ? customReason : cancelReason;

    if (!finalReason.trim()) return alert("يرجى اختيار أو كتابة سبب الإلغاء");
    
    try {
      await supabase.from('notifications').insert([{
        user_id: selectedBooking.user_id,
        title: "تم إلغاء حجزك ❌",
        message: `نعتذر منك، تم إلغاء حجزك لدراجة (${selectedBooking.Bikes?.name}) بتاريخ ${selectedBooking.booking_date} بسبب: ${finalReason}.`
      }]);

      const { error: deleteError } = await supabase
        .from('bookings')
        .delete()
        .match({ id: selectedBooking.id }); // توافقاً مع السياسة الجديدة
      
      if (deleteError) throw deleteError;

      alert("تم إلغاء الحجز وحذفه وإرسال الإشعار بنجاح ✅");
      setIsCancelModalOpen(false);
      setCancelReason("");
      setCustomReason("");
      fetchBookings();
    } catch (e: any) { alert("خطأ: " + e.message); }
  };

  // دالة إنهاء الحجز
  const handleConfirmFinish = async () => {
    try {
      await supabase.from('notifications').insert([{
        user_id: selectedBooking.user_id,
        title: "تم إنهاء الحجز بنجاح ✅",
        message: `شكراً لاستخدامك LOOOP! تم إنهاء حجزك لدراجة (${selectedBooking.Bikes?.name}) واستلامها بنجاح.`
      }]);

      const { error: deleteError } = await supabase
        .from('bookings')
        .delete()
        .match({ id: selectedBooking.id });
      
      if (deleteError) throw deleteError;

      alert("تم إنهاء الحجز وحذفه بنجاح ✅");
      setIsFinishModalOpen(false);
      fetchBookings();
    } catch (e: any) { alert("خطأ: " + e.message); }
  };

  return (
    <div className="min-h-screen bg-[#F0F9FF] font-sans text-right text-black pb-10" dir="rtl">
      {/* Navbar */}
      <nav className="sticky top-0 z-[100] bg-[#1E293B] p-4 md:p-6 shadow-xl mb-6 md:mb-10 text-white">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white p-2">
              {isMenuOpen ? "✕" : "☰"}
            </button>
          </div>
          <Link href="/admin" className="hidden md:flex bg-sky-500/20 text-sky-200 px-6 py-2 rounded-xl border border-sky-400 font-bold">🔙 رجوع</Link>
          <h1 className="text-white text-lg md:text-2xl font-black italic">سجل الحجوزات 📋</h1>
        </div>
      </nav>

      {/* المحتوى الرئيسي */}
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="bg-white p-4 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden text-black">
          <div className="flex justify-between items-center mb-8 text-black font-black">
            <h2 className="text-xl md:text-2xl font-black text-slate-800">قائمة الطلبات الواردة</h2>
            <span className="bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full font-black text-sm">{bookings.length} حجز</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right border-separate border-spacing-y-4 min-w-[1000px] text-black font-black">
              <thead>
                <tr className="text-slate-400 text-sm font-black uppercase">
                  <th className="px-6 py-2">المستلم 👤</th>
                  <th className="px-6 py-2 text-right">الدراجة</th>
                  <th className="px-6 py-2 text-right">التاريخ</th>
                  <th className="px-6 py-2 text-right">من (البداية) ⏰</th>
                  <th className="px-6 py-2 text-right">إلى (النهاية) 🏁</th>
                  <th className="px-6 py-2 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <motion.tr layout key={b.id} className="bg-slate-50 rounded-2xl hover:bg-sky-50 transition-all font-black text-black">
                    <td className="px-6 py-5 text-black">{b.customer_name || "غير محدد"}</td>
                    <td className="px-6 py-5 text-black">{b.Bikes?.name}</td>
                    <td className="px-6 py-5 text-emerald-600 font-black">{b.booking_date}</td>
                    <td className="px-6 py-5 text-sky-600 font-black bg-white/50 rounded-r-xl">{b.reserved_time}</td>
                    <td className="px-6 py-5 text-indigo-600 font-black bg-white/50 rounded-l-xl">
                      {calculateEndTime(b.reserved_time, b.Bikes?.duration || 0)}
                    </td>
                    <td className="px-6 py-5 flex gap-2 justify-center">
                      <button onClick={() => { setSelectedBooking(b); setIsFinishModalOpen(true); }} className="bg-emerald-500 text-white px-4 py-2 rounded-xl font-black text-xs">انهاء الحجز ✅</button>
                      <button onClick={() => { setSelectedBooking(b); setIsCancelModalOpen(true); }} className="bg-red-500 text-white px-4 py-2 rounded-xl font-black text-xs">إلغاء الحجز ❌</button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* مودال الإلغاء مع حقل السبب اليدوي */}
      <AnimatePresence>
        {isCancelModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 text-black text-right">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl">
              <h2 className="text-xl font-black mb-4 text-black">سبب إلغاء الحجز ❌</h2>
              <select value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} className="w-full p-4 bg-slate-50 border-2 rounded-2xl mb-4 font-bold text-black outline-none focus:border-red-500">
                <option value="">اختر السبب...</option>
                <option value="انتهى وقت الحجز المسموح">انتهى وقت الحجز المسموح</option>
                <option value="عطل تقني مفاجئ">عطل تقني مفاجئ</option>
                <option value="عدم حضور المستلم">عدم حضور المستلم</option>
                <option value="سبب آخر">سبب آخر</option>
              </select>

              {cancelReason === "سبب آخر" && (
                <motion.textarea
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  placeholder="اكتب سبب الإلغاء هنا..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="w-full p-4 bg-slate-50 border-2 border-red-100 rounded-2xl mb-4 font-bold text-black outline-none focus:border-red-500 resize-none h-32"
                />
              )}

              <div className="flex gap-3">
                <button onClick={handleConfirmCancel} className="flex-1 bg-red-500 text-white py-4 rounded-2xl font-black">تأكيد الإلغاء</button>
                <button onClick={() => { setIsCancelModalOpen(false); setCancelReason(""); setCustomReason(""); }} className="flex-1 bg-slate-100 text-slate-500 py-4 rounded-2xl font-black">تراجع</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* مودال الإنهاء */}
      <AnimatePresence>
        {isFinishModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 text-black text-right">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl text-center">
              <div className="text-5xl mb-4 text-emerald-500">🚲✅</div>
              <h2 className="text-xl font-black mb-4 text-black">تأكيد إنهاء الحجز</h2>
              <p className="text-slate-500 font-bold mb-8">هل تم استلام الدراجة من ({selectedBooking?.customer_name}) بنجاح؟</p>
              <div className="flex gap-3">
                <button onClick={handleConfirmFinish} className="flex-1 bg-emerald-500 text-white py-4 rounded-2xl font-black">نعم، تم بنجاح</button>
                <button onClick={() => setIsFinishModalOpen(false)} className="flex-1 bg-slate-100 text-slate-500 py-4 rounded-2xl font-black">تراجع</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}