"use client";
import { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function MyBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  const fetchBookings = async (userId: string) => {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id,
        reserved_time,
        booking_date,
        Bikes (
          name,
          image_url,
          category
        )
      `)
      .eq('user_id', userId)
      .order('booking_date', { ascending: false });

    if (data) setBookings(data);
    setLoading(false);
  };

  useEffect(() => {
    const checkUserAndFetchBookings = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);
      fetchBookings(user.id);
    };

    checkUserAndFetchBookings();
  }, [router]);

  const handleDeleteBooking = async (bookingId: string) => {
    if (!confirm("هل أنت متأكد أنك تريد إلغاء هذا الحجز؟ 🚲")) return;

    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId);

      if (error) throw error;

      setBookings(bookings.filter(b => b.id !== bookingId));
      // التعديل المطلوب: رسالة توضح أن الموعد أصبح متاحاً للجميع فور الحذف من الجدول
      alert("تم إلغاء الحجز، الموعد أصبح متاحاً الآن للجميع! ✅");
    } catch (e: any) {
      alert("حدث خطأ أثناء محاولة إلغاء الحجز");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-right" dir="rtl">
      <nav className="bg-[#1E293B] p-6 shadow-xl mb-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-sky-400 font-black flex items-center gap-2">
            <span>🔙 العودة للموقع</span>
          </Link>
          <h1 className="text-white text-2xl font-black">حجوزاتي الشخصية 🚲</h1>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6">
        {loading ? (
          <div className="text-center py-20 animate-pulse text-slate-400 font-bold">جاري تحميل حجوزاتك... ⏳</div>
        ) : bookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookings.map((booking) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={booking.id} 
                className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 flex gap-6 items-center hover:shadow-xl transition-all relative group"
              >
                <div className="w-32 h-32 rounded-[2rem] overflow-hidden flex-shrink-0 border-4 border-slate-50">
                  <img 
                    src={booking.Bikes?.image_url} 
                    className="w-full h-full object-cover" 
                    alt={booking.Bikes?.name} 
                  />
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-black text-slate-900">{booking.Bikes?.name}</h3>
                    
                    <button 
                      onClick={() => handleDeleteBooking(booking.id)}
                      className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl transition-all font-black text-xs border border-red-100"
                      title="إلغاء الحجز"
                    >
                      إلغاء الحجز 🗑️
                    </button>

                  </div>
                  <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                    <span>فئة {booking.Bikes?.category}</span>
                    <span className="w-1.5 h-1.5 bg-sky-400 rounded-full"></span>
                    <span className="text-sky-600">حجز مؤكد ✅</span>
                  </div>
                  
                  <div className="bg-sky-50 p-4 rounded-2xl border border-sky-100 mt-4 flex justify-between items-center">
                    <div className="text-right">
                      <p className="text-[10px] text-sky-400 font-black uppercase">وقت الموعد</p>
                      <p className="text-lg font-black text-[#1E293B]">{booking.reserved_time}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] text-sky-400 font-black uppercase">التاريخ</p>
                      <p className="text-sm font-black text-[#1E293B]">{booking.booking_date}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
            <p className="text-5xl mb-4">Empty 🚲</p>
            <p className="text-slate-400 font-bold italic text-xl">لا توجد حجوزات مسجلة باسمك حالياً</p>
            <Link href="/" className="inline-block mt-6 bg-sky-500 text-white px-10 py-3 rounded-2xl font-black hover:bg-sky-600 transition-all shadow-lg">احجز الآن</Link>
          </div>
        )}
      </div>
    </div>
  );
}