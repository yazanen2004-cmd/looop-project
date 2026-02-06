"use client";
import { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function MyBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // حالة القائمة للجوال
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
      alert("تم إلغاء الحجز، الموعد أصبح متاحاً الآن للجميع! ✅");
    } catch (e: any) {
      alert("حدث خطأ أثناء محاولة إلغاء الحجز");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-right text-black" dir="rtl">
      
      {/* 1. Navbar المطور مع Resize والقائمة الجانبية */}
      <nav className="sticky top-0 z-[100] bg-[#1E293B] p-4 md:p-6 shadow-xl mb-6 md:mb-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          
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

          {/* العودة للموقع (تظهر في الكمبيوتر وتختفي في الجوال لتنتقل للمنيو) */}
          <Link href="/" className="hidden md:flex text-sky-400 font-black items-center gap-2 hover:text-sky-300 transition-colors">
            <span>🔙 العودة للموقع</span>
          </Link>

          <h1 className="text-white text-lg md:text-2xl font-black italic">حجوزاتي <span className="text-sky-400 font-black"> الشخصية 🚲</span></h1>
        </div>
      </nav>

      {/* القائمة الجانبية للجوال */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: "auto" }} 
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#1E293B] border-b border-slate-700 fixed top-[68px] left-0 w-full z-50 overflow-hidden shadow-2xl p-6"
          >
            <Link href="/" onClick={() => setIsMenuOpen(false)} className="block text-center bg-sky-500 text-white py-4 rounded-2xl font-black text-lg shadow-lg">🔙 العودة للرئيسية</Link>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {loading ? (
          <div className="text-center py-20 animate-pulse text-slate-400 font-bold text-sm md:text-base">جاري تحميل حجوزاتك... ⏳</div>
        ) : bookings.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 pb-20">
            {bookings.map((booking) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={booking.id} 
                className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] p-4 md:p-6 shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-4 md:gap-6 items-center hover:shadow-xl transition-all relative group"
              >
                {/* تعديل حجم الصورة (Resize) لتكون متناسبة مع الجوال */}
                <div className="w-full sm:w-28 sm:h-28 md:w-32 md:h-32 h-40 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden flex-shrink-0 border-4 border-slate-50 bg-white">
                  <img 
                    src={booking.Bikes?.image_url} 
                    className="w-full h-full object-contain" 
                    alt={booking.Bikes?.name} 
                  />
                </div>

                <div className="flex-1 w-full space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg md:text-xl font-black text-slate-900">{booking.Bikes?.name}</h3>
                    
                    <button 
                      onClick={() => handleDeleteBooking(booking.id)}
                      className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl transition-all font-black text-[10px] md:text-xs border border-red-100"
                    >
                      إلغاء الحجز 🗑️
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] md:text-sm">
                    <span>فئة {booking.Bikes?.category}</span>
                    <span className="w-1.5 h-1.5 bg-sky-400 rounded-full"></span>
                    <span className="text-sky-600">حجز مؤكد ✅</span>
                  </div>
                  
                  {/* قسم الوقت والتاريخ بتنسيق متجاوب */}
                  <div className="bg-sky-50 p-3 md:p-4 rounded-2xl border border-sky-100 mt-2 flex justify-between items-center">
                    <div className="text-right">
                      <p className="text-[8px] md:text-[10px] text-sky-400 font-black uppercase">وقت الموعد</p>
                      <p className="text-base md:text-lg font-black text-[#1E293B]">{booking.reserved_time}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-[8px] md:text-[10px] text-sky-400 font-black uppercase text-left">التاريخ</p>
                      <p className="text-xs md:text-sm font-black text-[#1E293B]">{booking.booking_date}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 md:py-32 bg-white rounded-[2rem] md:rounded-[3rem] border-2 border-dashed border-slate-200 px-6">
            <p className="text-4xl md:text-5xl mb-4">🚲</p>
            <p className="text-slate-400 font-bold italic text-sm md:text-xl">لا توجد حجوزات مسجلة باسمك حالياً</p>
            <Link href="/" className="inline-block mt-6 bg-sky-500 text-white px-8 md:px-10 py-3 rounded-2xl font-black hover:bg-sky-600 transition-all shadow-lg text-sm md:text-base">احجز الآن</Link>
          </div>
        )}
      </div>
    </div>
  );
}