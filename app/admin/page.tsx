"use client";
import { useState, useEffect } from "react"; 
import { supabase } from "../utils/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [bikesList, setBikesList] = useState<any[]>([]); 

  // --- نظام الحماية وجلب البيانات ---
  useEffect(() => {
    const isAuth = localStorage.getItem("isAdminAuthenticated");
    if (isAuth !== "true") {
      router.push("/admin-login");
    }
    fetchAboutSlides();
    fetchHomeSlides();
    fetchBikes(); 
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("isAdminAuthenticated");
    router.push("/admin-login");
  };

  // 1. حالات الدراجات
  const [bikeName, setBikeName] = useState("");
  const [bikePrice, setBikePrice] = useState("");
  const [bikeCategory, setBikeCategory] = useState("16");
  
  // حالات مدة الحجز الجديدة (ساعات ودقائق)
  const [durationHours, setDurationHours] = useState("1");
  const [durationMinutes, setDurationMinutes] = useState("0");

  const [startTime, setStartTime] = useState("08:00"); 
  const [endTime, setEndTime] = useState("22:00");   
  const [bikeFile, setBikeFile] = useState<File | null>(null);
  const [bikePreview, setBikePreview] = useState<string | null>(null);

  // جلب قائمة الدراجات
  const fetchBikes = async () => {
    const { data } = await supabase.from('Bikes').select('*').order('created_at', { ascending: false });
    if (data) setBikesList(data);
  };

  // تحويل الوقت لنظام 12 ساعة للعرض في الجدول
  const formatTimeTo12 = (time: string) => {
    if (!time) return "";
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  // دالة لتحويل المدة لنص مفهوم في الجدول
  const formatDurationText = (totalMinutes: number) => {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    let text = "";
    if (h > 0) text += `${h} ساعة `;
    if (m > 0) text += `و ${m} دقيقة`;
    return text || "0 دقيقة";
  };

  const toggleBikeStatus = async (id: number, currentStatus: boolean) => {
    const { error } = await supabase.from('Bikes').update({ is_available: !currentStatus }).eq('id', id);
    if (!error) fetchBikes();
  };

  const deleteBike = async (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذه الدراجة نهائياً؟")) {
      const { error } = await supabase.from('Bikes').delete().eq('id', id);
      if (!error) {
        alert("تم الحذف بنجاح");
        fetchBikes();
      }
    }
  };

  // حالات السلايدر والنبذة والدعم الفني
  const [homeTitle, setHomeTitle] = useState("");
  const [homeFile, setHomeFile] = useState<File | null>(null);
  const [homePreview, setHomePreview] = useState<string | null>(null);
  const [homeSlides, setHomeSlides] = useState<any[]>([]);
  const [aboutTitle, setAboutTitle] = useState("");
  const [aboutDesc, setAboutDesc] = useState("");
  const [aboutFile, setAboutFile] = useState<File | null>(null);
  const [aboutPreview, setAboutPreview] = useState<string | null>(null);
  const [aboutSlides, setAboutSlides] = useState<any[]>([]);
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactInsta, setContactInsta] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFile: any, setPreview: any) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file: File, bucket: string) => {
    const fileName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
    const { data, error } = await supabase.storage.from(bucket).upload(fileName, file);
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return publicUrl;
  };

  const fetchAboutSlides = async () => {
    const { data } = await supabase.from('about_slides').select('*').order('created_at', { ascending: false });
    if (data) setAboutSlides(data);
  };

  const fetchHomeSlides = async () => {
    const { data } = await supabase.from('home_slider1').select('*').order('created_at', { ascending: false });
    if (data) setHomeSlides(data);
  };

  const handleAddBike = async () => {
    setLoading(true);
    try {
      if (!bikeFile) throw new Error("يرجى اختيار صورة");
      
      // حساب إجمالي الدقائق لتخزينه في قاعدة البيانات
      const totalMinutes = (parseInt(durationHours) * 60) + parseInt(durationMinutes);
      
      const imageUrl = await uploadImage(bikeFile, 'bike-images');
      const { error } = await supabase.from('Bikes').insert([{ 
        name: bikeName, price: parseFloat(bikePrice), category: bikeCategory, 
        duration: totalMinutes, // تخزين المجموع بالدقائق ليسهل استخدامه في الكود
        available_from: startTime, 
        available_to: endTime, image_url: imageUrl, is_available: true 
      }]);
      if (error) throw error;
      alert("تم نشر الدراجة بنجاح! 🚀");
      setBikePreview(null); setBikeName(""); setBikePrice(""); setDurationHours("1"); setDurationMinutes("0"); fetchBikes();
    } catch (e: any) { alert(e.message); } finally { setLoading(false); }
  };

  const handleAddHomeSlide = async () => {
    if (!homeTitle || !homeFile) return alert("تأكد من البيانات");
    setLoading(true);
    try {
      const imageUrl = await uploadImage(homeFile, 'bike-images'); 
      await supabase.from('home_slider1').insert([{ title: homeTitle, image_url: imageUrl }]);
      alert("تم إضافة العرض! ✨");
      setHomeTitle(""); setHomePreview(null); fetchHomeSlides();
    } catch (e: any) { alert(e.message); } finally { setLoading(false); }
  };

  const handleAddAboutSlide = async () => {
    if (!aboutTitle || !aboutDesc || !aboutFile) return alert("يرجى تعبئة البيانات");
    setLoading(true);
    try {
      const imageUrl = await uploadImage(aboutFile, 'bike-images'); 
      await supabase.from('about_slides').insert([{ title: aboutTitle, description: aboutDesc, image_url: imageUrl }]);
      alert("تم إضافة النبذة! ✅");
      setAboutTitle(""); setAboutDesc(""); setAboutPreview(null); fetchAboutSlides();
    } catch (e: any) { alert(e.message); } finally { setLoading(false); }
  };

  const handleUpdateContact = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from('Contact_Settings').upsert({ 
        id: 1, phone: contactPhone, email: contactEmail, instagram: contactInsta 
      });
      if (error) throw error;
      alert("تم تحديث الدعم الفني! 📞");
    } catch (e: any) { alert(e.message); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#F0F9FF] pb-20 font-sans text-right" dir="rtl">
      <header className="bg-[#1E293B] text-white py-12 px-8 shadow-2xl mb-12">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-right">
          <div className="flex gap-4">
            <Link href="/" className="bg-sky-500/20 hover:bg-sky-500 text-sky-200 hover:text-white px-6 py-2 rounded-xl border border-sky-500/50 transition-all font-bold text-sm">معاينة الموقع 🌐</Link>
            <Link href="/admin/bookings" className="bg-emerald-500/20 hover:bg-emerald-500 text-emerald-200 hover:text-white px-6 py-2 rounded-xl border border-emerald-500/50 transition-all font-bold text-sm shadow-lg">إدارة الحجوزات 🗓️</Link>
            <button onClick={handleLogout} className="bg-red-500/20 hover:bg-red-500 text-red-200 hover:text-white px-6 py-2 rounded-xl border border-red-500/50 transition-all font-bold text-sm">تسجيل خروج 🚪</button>
          </div>
          <div>
            <h1 className="text-4xl font-black mb-2 flex items-center gap-3 justify-end">لوحة تحكم المدير <span className="text-3xl">🛠️</span></h1>
            <p className="text-sky-200 text-lg font-bold">أهلاً بك أيها المدير، تحكم بكل تفاصيل مشروع LOOOP</p>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 space-y-12">
        
        {/* إضافة دراجة */}
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
          <h2 className="text-2xl font-black text-[#1E293B] mb-8 border-r-4 border-sky-500 pr-4">إضافة دراجة ونظام حجز</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-5 text-black">
              <input type="text" placeholder="اسم الدراجة" value={bikeName} onChange={(e)=>setBikeName(e.target.value)} className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-black text-black outline-none focus:border-[#1E293B]" />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="السعر (JOD)" value={bikePrice} onChange={(e)=>setBikePrice(e.target.value)} className="p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-black text-black" />
                <select value={bikeCategory} onChange={(e)=>setBikeCategory(e.target.value)} className="p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-black text-black">
                  <option value="16">فئة 16</option><option value="20">فئة 20</option><option value="24">فئة 24</option><option value="26">فئة 26</option>
                </select>
              </div>

              {/* اختيار مدة الحجز (ساعات ودقائق) */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 pr-2">حدد مدة الحجز الواحد:</label>
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 bg-slate-50 border-2 border-slate-100 p-2 rounded-2xl">
                        <select value={durationHours} onChange={(e)=>setDurationHours(e.target.value)} className="bg-transparent font-black w-full text-center">
                            {[0,1,2,3,4,5,6].map(h => <option key={h} value={h}>{h} ساعة</option>)}
                        </select>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 border-2 border-slate-100 p-2 rounded-2xl">
                        <select value={durationMinutes} onChange={(e)=>setDurationMinutes(e.target.value)} className="bg-transparent font-black w-full text-center">
                            {[0,15,30,45].map(m => <option key={m} value={m}>{m} دقيقة</option>)}
                        </select>
                    </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 border-2 border-slate-100 p-4 rounded-2xl bg-slate-50/50">
                <div className="space-y-1">
                    <label className="text-xs font-black text-slate-500 pr-2">متاحة من الساعة</label>
                    <input type="time" value={startTime} onChange={(e)=>setStartTime(e.target.value)} className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-black" />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-black text-slate-500 pr-2">إلى الساعة</label>
                    <input type="time" value={endTime} onChange={(e)=>setEndTime(e.target.value)} className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-black" />
                </div>
              </div>

              <button onClick={handleAddBike} className="w-full bg-[#1E293B] text-white py-5 rounded-[2rem] font-black text-lg hover:bg-slate-800 shadow-xl transition-all">نشر الدراجة الآن 🚀</button>
            </div>
            <div className="relative h-full min-h-[350px] bg-slate-50 rounded-[2.5rem] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden transition-all duration-300 hover:border-sky-400 hover:bg-sky-50 group">
              {bikePreview ? <img src={bikePreview} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" /> : <div className="text-center group-hover:scale-110 transition-transform"><span className="text-6xl block mb-2">🚲</span><p className="font-black text-slate-400 italic">اضغط لإضافة صورة الدراجة</p></div>}
              <input type="file" onChange={(e)=>handleFileChange(e, setBikeFile, setBikePreview)} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
          </div>

          {/* جدول إدارة الدراجات */}
          <div className="mt-16 overflow-x-auto text-black">
            <h3 className="text-xl font-black mb-6 text-slate-700 italic flex items-center gap-2">الدراجات المضافة حالياً <span className="w-2 h-2 bg-sky-500 rounded-full"></span></h3>
            <table className="w-full text-right border-separate border-spacing-y-3">
              <thead>
                <tr className="text-slate-400 text-sm font-black uppercase">
                  <th className="px-6 py-2">الدراجة</th>
                  <th className="px-6 py-2">الفئة</th>
                  <th className="px-6 py-2">السعر</th>
                  <th className="px-6 py-2">مدة الحجز</th>
                  <th className="px-6 py-2">ساعات العمل</th>
                  <th className="px-6 py-2">الحالة</th>
                  <th className="px-6 py-2">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {bikesList.map(bike => (
                  <tr key={bike.id} className="bg-slate-50 rounded-2xl overflow-hidden hover:bg-sky-50 transition-colors">
                    <td className="px-6 py-4 font-black text-black flex items-center gap-3">
                        <img src={bike.image_url} className="w-10 h-10 rounded-lg object-cover" />
                        {bike.name}
                    </td>
                    <td className="px-6 py-4 font-bold text-black">{bike.category}</td>
                    <td className="px-6 py-4 font-black text-sky-600">{bike.price} JOD</td>
                    <td className="px-6 py-4 font-bold text-black italic">
                        {/* عرض المدة بشكل نصي مفهوم (مثلاً: 1 ساعة و 30 دقيقة) */}
                        {formatDurationText(bike.duration)}
                    </td>
                    <td className="px-6 py-4 font-bold text-black text-xs">
                        {formatTimeTo12(bike.available_from)} - {formatTimeTo12(bike.available_to)}
                    </td>
                    <td className="px-6 py-4">
                        <button onClick={() => toggleBikeStatus(bike.id, bike.is_available)} className={`px-4 py-1.5 rounded-full text-xs font-black text-white ${bike.is_available ? 'bg-green-500' : 'bg-red-400'}`}>
                            {bike.is_available ? 'متاحة' : 'معطلة'}
                        </button>
                    </td>
                    <td className="px-6 py-4">
                        <button onClick={() => deleteBike(bike.id)} className="text-red-400 hover:text-red-600 transition-colors">
                            <span className="text-xl">🗑️</span>
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* باقي الأقسام تبقى كما هي بدون تغيير */}
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-orange-100">
          <h2 className="text-2xl font-black text-[#1E293B] mb-8 border-r-4 border-orange-500 pr-4">إدارة سلايدر العروض الرئيسي</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-black">
            <div className="lg:col-span-2 space-y-4">
              <input type="text" placeholder="عنوان العرض" value={homeTitle} onChange={(e)=>setHomeTitle(e.target.value)} className="w-full p-4 bg-slate-50 border-2 rounded-2xl font-black text-black outline-none focus:border-orange-400" />
              <button onClick={handleAddHomeSlide} className="w-full bg-orange-500 text-white py-5 rounded-[2rem] font-black text-lg shadow-xl hover:bg-orange-600 transition-all">إضافة العرض ✨</button>
            </div>
            <div className="relative h-full min-h-[200px] bg-slate-50 rounded-[2.5rem] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden group">
              {homePreview ? <img src={homePreview} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" /> : <p className="font-black text-slate-400 italic">صورة العرض</p>}
              <input type="file" onChange={(e)=>handleFileChange(e, setHomeFile, setHomePreview)} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
          </div>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {homeSlides.map(slide => (
              <div key={slide.id} className="relative group rounded-2xl overflow-hidden h-32 border-2 border-slate-100 shadow-sm transition-all hover:shadow-md">
                <img src={slide.image_url} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button onClick={async () => { if(confirm("حذف؟")){ await supabase.from('home_slider1').delete().eq('id', slide.id); fetchHomeSlides(); }}} className="bg-red-500 text-white px-4 py-1 rounded-lg font-bold text-xs">حذف 🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-sky-100">
          <h2 className="text-2xl font-black text-[#1E293B] mb-8 border-r-4 border-sky-500 pr-4 text-black">إضافة شريحة تعريفية (نبذة عنا)</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-black">
            <div className="lg:col-span-2 space-y-4">
              <input type="text" placeholder="عنوان الشريحة" value={aboutTitle} onChange={(e)=>setAboutTitle(e.target.value)} className="w-full p-4 bg-slate-50 border-2 rounded-2xl font-black text-black outline-none focus:border-sky-400" />
              <textarea placeholder="تكلم عن جانب معين..." value={aboutDesc} onChange={(e)=>setAboutDesc(e.target.value)} className="w-full p-4 bg-slate-50 border-2 rounded-2xl font-black text-black h-40 outline-none focus:border-sky-400 resize-none" />
              <button onClick={handleAddAboutSlide} className="w-full bg-[#1E293B] text-white py-5 rounded-[2rem] font-black text-lg shadow-xl hover:bg-slate-800 transition-all">إضافة الشريحة ➕</button>
            </div>
            <div className="relative h-full min-h-[250px] bg-slate-50 rounded-[2.5rem] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden group">
              {aboutPreview ? <img src={aboutPreview} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" /> : <div className="text-center"><span className="text-5xl block mb-2">📖</span><p className="font-black text-slate-400 italic">صورة النبذة</p></div>}
              <input type="file" onChange={(e)=>handleFileChange(e, setAboutFile, setAboutPreview)} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
          </div>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {aboutSlides.map(slide => (
              <div key={slide.id} className="relative group rounded-2xl overflow-hidden h-32 border-2 border-slate-100 shadow-sm transition-all hover:shadow-md">
                <img src={slide.image_url} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button onClick={async () => { if(confirm("حذف؟")){ await supabase.from('about_slides').delete().eq('id', slide.id); fetchAboutSlides(); }}} className="bg-red-500 text-white px-4 py-1 rounded-lg font-bold text-xs">حذف 🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-sky-100 text-black">
          <h2 className="text-2xl font-black text-[#1E293B] mb-8 border-r-4 border-sky-500 pr-4">إعدادات الدعم الفني</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-black">
            <input type="text" placeholder="رقم الهاتف" value={contactPhone} onChange={(e)=>setContactPhone(e.target.value)} className="p-4 bg-slate-50 border-2 rounded-2xl font-black text-black outline-none focus:border-sky-400" />
            <input type="text" placeholder="البريد الإلكتروني" value={contactEmail} onChange={(e)=>setContactEmail(e.target.value)} className="p-4 bg-slate-50 border-2 rounded-2xl font-black text-black outline-none focus:border-sky-400" />
            <input type="text" placeholder="إنستغرام" value={contactInsta} onChange={(e)=>setContactInsta(e.target.value)} className="p-4 bg-slate-50 border-2 rounded-2xl font-black text-black outline-none focus:border-sky-400" />
          </div>
          <button onClick={handleUpdateContact} className="w-full bg-[#1E293B] text-white py-5 rounded-[2rem] font-black text-lg shadow-xl hover:bg-slate-800 transition-all mt-8">حفظ معلومات التواصل 📞</button>
        </div>

      </div>
    </div>
  );
}