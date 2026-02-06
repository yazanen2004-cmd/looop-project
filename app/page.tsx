"use client";
import { useState, useEffect } from "react";
import { supabase } from "./utils/supabase";
import Link from "next/link";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

// مكتبة الأنيميشن
import { motion, AnimatePresence } from "framer-motion";

export default function HomePage() {
  const categories = ["الكل", "16", "20", "24", "26"];
  const [selectedCategory, setSelectedCategory] = useState("الكل");
  const [bikes, setBikes] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [ads, setAds] = useState<any[]>([]); 
  const [aboutSlides, setAboutSlides] = useState<any[]>([]);
  const [loadingAbout, setLoadingAbout] = useState(true);
  const [contactData, setContactData] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // حالات الحجز المحدثة
  const [selectedBike, setSelectedBike] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(""); 
  const [customerName, setCustomerName] = useState(""); 
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [bookedSlots, setBookedSlots] = useState<any[]>([]);

  const fetchBookingsForDate = async (date: string, bikeId: number) => {
    if (!date || !bikeId) return;
    const { data } = await supabase
      .from('bookings')
      .select('reserved_time')
      .eq('booking_date', date)
      .eq('bike_id', bikeId);
    if (data) setBookedSlots(data.map(b => b.reserved_time));
    else setBookedSlots([]);
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: bData } = await supabase.from('Bikes').select('*');
      if (bData) setBikes(bData);
      const { data: { user: uData } } = await supabase.auth.getUser();
      setUser(uData);
      const { data: adsData } = await supabase.from('home_slider1').select('*').order('created_at', { ascending: false });
      if (adsData) setAds(adsData);
      const { data: sData } = await supabase.from('about_slides').select('*').order('created_at', { ascending: true });
      if (sData) setAboutSlides(sData);
      const { data: cData } = await supabase.from('Contact_Settings').select('*').eq('id', 1).single();
      if (cData) setContactData(cData);
    };
    fetchInitialData();
  }, []);

  const generateSlots = (start: string, end: string, duration: number) => {
    const slots = [];
    let current = new Date(`2026-01-01T${start}`);
    const stop = new Date(`2026-01-01T${end}`);
    while (current < stop) {
      slots.push(current.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
      current.setMinutes(current.getMinutes() + duration);
    }
    return slots;
  };

  const handleConfirmBooking = async (slot: string) => {
    if (!user) return alert("سجل دخولك أولاً لتبدأ الحجز");
    if (!selectedDate) return alert("يرجى اختيار التاريخ أولاً");
    if (!customerName.trim()) return alert("يرجى إدخال اسم المستلم لتثبيت الحجز");

    setLoading(true);
    try {
      const { error } = await supabase.from('bookings').insert([{
        bike_id: selectedBike.id,
        user_id: user.id,
        reserved_time: slot,
        booking_date: selectedDate,
        customer_name: customerName 
      }]);

      if (error) throw error;
      alert(`تم حجز موعد ${slot} باسم (${customerName}) بنجاح! 🚲`);
      setIsModalOpen(false);
      setSelectedDate("");
      setCustomerName(""); 
    } catch (e: any) { alert("خطأ في الحجز"); } finally { setLoading(false); }
  };

  const today = new Date().toISOString().split('T')[0];
  const afterTwoDays = new Date();
  afterTwoDays.setDate(afterTwoDays.getDate() + 1); 
  const maxDateLimit = afterTwoDays.toISOString().split('T')[0];

  const handleDateChange = (e: any) => {
    const date = e.target.value;
    if (date < today) {
      alert("عذراً، لا يمكنك الحجز في تاريخ قديم! ✋");
      setSelectedDate("");
      return;
    }
    if (date > maxDateLimit) {
      alert("عذراً، نظام الحجز متاح فقط لليوم ولغدٍ فقط! 🚲");
      setSelectedDate("");
      return;
    }
    setSelectedDate(date);
    fetchBookingsForDate(date, selectedBike.id);
  };

  const filteredBikes = selectedCategory === "الكل" ? bikes : bikes.filter(bike => bike.category === selectedCategory);

  return (
    <main className="min-h-screen bg-[#F8FAFC] font-sans text-right text-black" dir="rtl">
      {/* 1. Navbar */}
      <nav className="sticky top-0 z-50 bg-[#1E293B] border-b border-slate-700 px-6 md:px-10 py-5 flex justify-between items-center shadow-xl">
        <div className="flex gap-4 md:gap-6 items-center flex-row-reverse">
          {user ? (
            <div className="flex gap-4 items-center flex-row-reverse">
              <span className="hidden md:block text-sky-200 font-bold text-sm bg-slate-800 px-4 py-1.5 rounded-full border border-slate-700">{user.email.split('@')[0]}</span>
              <Link href="/my-bookings" className="bg-sky-500/10 text-sky-400 hover:bg-sky-500 hover:text-white px-4 py-1.5 rounded-xl border border-sky-400/30 transition-all font-black text-xs">حجوزاتي 🗓️</Link>
              <button onClick={async () => { await supabase.auth.signOut(); window.location.reload(); }} className="text-slate-400 hover:text-red-400 text-xs font-bold transition-all">خروج</button>
            </div>
          ) : (
            <div className="flex gap-3 md:gap-5 items-center flex-row-reverse">
              <Link href="/signup" className="bg-sky-500 text-white px-5 md:px-8 py-2.5 rounded-2xl font-black text-xs md:text-sm hover:bg-sky-600 transition-all shadow-lg active:scale-95 shadow-lg">تسجيل جديد</Link>
              <Link href="/login" className="text-sky-100 font-black text-xs md:text-sm hover:text-white transition-colors">دخول</Link>
            </div>
          )}
        </div>
        <Link href="/" className="flex items-center gap-3 group">
          <div className="text-2xl md:text-3xl font-black tracking-tight text-white italic">LOO<span className="text-sky-400">OP</span></div>
          <div className="w-9 h-9 md:w-10 md:h-10 bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-700 transition-transform group-hover:rotate-12 shadow-sm">
            <span className="text-lg md:text-xl">🚲</span>
          </div>
        </Link>
      </nav>

      {/* 2. Slider Section - تم تعديل الارتفاع ليكون متجاوباً */}
      <section className="px-4 md:px-8 pt-10 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white bg-white">
          {ads.length > 0 ? (
            <Swiper 
              modules={[Autoplay, Pagination, EffectFade]} 
              effect={'fade'} 
              pagination={{ clickable: true }} 
              autoplay={{ delay: 5000 }} 
              className="w-full h-[300px] md:h-[500px] lg:h-[650px]" // تعديل ارتفاع السلايدر حسب الشاشة
            >
              {ads.map((ad) => (
                <SwiperSlide key={ad.id}>
                  <div className="relative w-full h-full text-right">
                    <img src={ad.image_url} alt={ad.title} className="w-full h-full object-cover object-center" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex items-end p-12">
                      <h2 className="text-white text-2xl md:text-7xl font-black drop-shadow-2xl mb-8">{ad.title}</h2>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : <div className="h-[300px] md:h-[650px] flex items-center justify-center bg-sky-50 text-sky-400 font-bold animate-pulse italic">جاري تحميل العروض... 🚲</div>}
        </motion.div>
      </section>

      {/* 3. About Section - تم تعديل ارتفاع الصورة ليكون متجاوباً */}
      <section className="py-24 px-6 md:px-8 max-w-7xl mx-auto overflow-hidden text-black">
        <div className="mb-10 text-right">
          <div className="inline-block bg-sky-100 text-sky-600 px-5 py-2 rounded-full text-xs font-black tracking-widest border border-sky-200">مرحباً بكم في لووب 🚲</div>
        </div>
        {aboutSlides.length > 0 ? (
          <Swiper modules={[Autoplay, Pagination]} autoplay={{ delay: 5000 }} pagination={{ clickable: true }} dir="rtl" className="w-full">
            {aboutSlides.map((slide) => (
              <SwiperSlide key={slide.id}>
                <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24 pb-16">
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="w-full md:w-1/2 relative group">
                    <div className="absolute -inset-2 bg-gradient-to-r from-sky-400 to-indigo-400 rounded-[3rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                    {/* تعديل الارتفاع للصورة التعريفية */}
                    <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white bg-white w-full h-[300px] md:h-[450px] lg:h-[550px]"> 
                      <img src={slide.image_url} alt={slide.title} className="w-full h-full object-cover object-center" />
                    </div>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="w-full md:w-1/2 text-right space-y-10 px-6 md:px-12">
                    <div className="space-y-4">
                      <h2 className="text-4xl md:text-8xl font-black text-slate-900 leading-[1.1] pb-2">{slide.title}</h2>
                      <div className="w-32 h-2.5 bg-sky-500 rounded-full shadow-lg shadow-sky-200"></div>
                    </div>
                    <p className="text-xl md:text-3xl text-slate-500 font-medium leading-relaxed italic border-r-8 border-slate-100 pr-8 text-black">{slide.description}</p>
                  </motion.div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 text-slate-400 font-bold italic text-xl">جاري تحميل قصتنا... 📖</div>}
      </section>

      {/* 5. Bikes Grid */}
      <section className="px-6 md:px-8 max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-32">
        <AnimatePresence mode="popLayout">
          {filteredBikes.map((bike) => (
            <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} whileHover={{ y: -12 }} key={bike.id} className="bg-white rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all border border-slate-100 overflow-hidden group">
              <div className="h-56 relative overflow-hidden bg-slate-100">
                <img src={bike.image_url} alt={bike.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className={`absolute top-4 right-4 px-4 py-1.5 rounded-full text-[10px] font-black text-white shadow-lg backdrop-blur-sm ${bike.is_available ? 'bg-sky-500/90' : 'bg-slate-500/90'}`}>{bike.is_available ? '• متاح' : '• محجوز'}</div>
              </div>
              <div className="p-7 text-right">
                <h3 className="text-2xl font-black text-slate-900 mb-1">{bike.name}</h3>
                <div className="flex items-center gap-2 mb-6 justify-end"><p className="text-sm font-bold text-slate-400 uppercase tracking-tighter">موديل فئة {bike.category}</p><span className="w-2 h-2 bg-sky-400 rounded-full animate-pulse"></span></div>
                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-3xl border border-slate-100 group-hover:bg-sky-50 transition-all">
                  <div className="flex flex-col items-start"><span className="text-2xl font-black text-slate-800">{bike.price} <small className="text-xs text-black">JOD</small></span><span className="text-[10px] text-slate-400 font-black tracking-widest uppercase">للساعة</span></div>
                  <button disabled={!bike.is_available} onClick={() => { setSelectedBike(bike); setAvailableSlots(generateSlots(bike.available_from || "08:00", bike.available_to || "22:00", bike.duration || 60)); setIsModalOpen(true); }} className={`px-5 py-3 rounded-2xl font-black transition-all text-sm shadow-md ${bike.is_available ? 'bg-[#1E293B] text-white hover:bg-sky-500 active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>{bike.is_available ? 'بدء الحجز' : 'غير متاح'}</button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </section>

      {/* Footer */}
      <footer className="bg-[#1E293B] border-t border-slate-700 px-6 md:px-10 py-10 shadow-2xl text-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-right">
          <div className="flex flex-col md:flex-row gap-8 items-center text-white">
            {contactData ? (
              <>
                <div className="flex items-center gap-3 bg-slate-800/50 px-5 py-2.5 rounded-2xl border border-slate-700 text-white"><span className="text-sky-300 font-black text-sm">{contactData.phone} 📞</span></div>
                <div className="flex items-center gap-3 bg-slate-800/50 px-5 py-2.5 rounded-2xl border border-slate-700 text-white"><span className="text-sky-300 font-black text-sm">{contactData.email} ✉️</span></div>
              </>
            ) : <span className="text-slate-400 font-bold italic animate-pulse">جاري تحميل بيانات الدعم...</span>}
          </div>
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-white italic">جميع الحقوق محفوظة &copy; 2026</div>
        </div>
      </footer>

      {/* Modal الحجز المطور */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl flex items-center justify-center p-4 z-[100] transition-all">
          <motion.div initial={{ opacity: 0, scale: 0.8, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="bg-white rounded-[3.5rem] p-6 md:p-12 max-w-md w-full shadow-2xl text-right border-4 border-white">
            <div className="text-5xl mb-4 text-center">🚲</div>
            <h2 className="text-2xl font-black text-slate-900 mb-6 text-center">حجز {selectedBike?.name}</h2>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-black text-sky-600 pr-2">اسم صاحب الحجز (المستلم):</label>
                <input 
                  type="text" 
                  placeholder="أدخل الاسم الرباعي أو الثلاثي" 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-black outline-none focus:border-sky-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-black text-sky-600 pr-2">اختر تاريخ الحجز:</label>
                <input 
                  type="date" 
                  value={selectedDate}
                  min={today}
                  max={maxDateLimit}
                  onChange={handleDateChange}
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-center outline-none focus:border-sky-500 transition-all text-black"
                />
              </div>
            </div>

            {selectedDate && customerName.trim() && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6">
                <p className="text-slate-400 font-bold text-xs mb-4 text-center italic">اختر وقت البداية لليوم ({selectedDate})</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto p-2 no-scrollbar" dir="rtl">
                  {availableSlots.map((slot) => {
                    const isBooked = bookedSlots.includes(slot);
                    let isPast = false;
                    if (selectedDate === today) {
                      const now = new Date();
                      const [time, modifier] = slot.split(' ');
                      let [hours, minutes] = time.split(':').map(Number);
                      if (modifier === 'PM' && hours < 12) hours += 12;
                      if (modifier === 'AM' && hours === 12) hours = 0;
                      const slotDate = new Date();
                      slotDate.setHours(hours, minutes, 0, 0);
                      if (slotDate < now) isPast = true;
                    }
                    return (
                      <button 
                        key={slot} 
                        disabled={loading || isBooked || isPast} 
                        className={`py-4 rounded-2xl text-[10px] md:text-xs font-black transition-all active:scale-90 shadow-sm border-2 
                          ${(isBooked || isPast) 
                            ? 'bg-slate-100 border-slate-100 text-slate-300 cursor-not-allowed' 
                            : 'bg-white border-slate-100 text-slate-600 hover:bg-sky-500 hover:text-white hover:border-sky-400'}`} 
                        onClick={() => handleConfirmBooking(slot)}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            <div className="mt-8 flex gap-3">
              <button onClick={() => { setIsModalOpen(false); setSelectedDate(""); setCustomerName(""); }} className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-black hover:bg-red-50 hover:text-red-500 transition-all text-sm">إغلاق</button>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}