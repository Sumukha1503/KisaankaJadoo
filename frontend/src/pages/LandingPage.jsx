import { Leaf, ArrowRight, ShieldCheck, CheckCircle, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function LandingPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  return (
    <div className="min-h-screen bg-[#f8fbfa] font-sans selection:bg-green-600 selection:text-white transition-colors duration-300">

      {/* ── HERO ── */}
      <div className="pt-8 px-4 md:px-10 max-w-[1600px] mx-auto">
        <div className="relative rounded-[40px] overflow-hidden shadow-2xl min-h-[85vh] flex flex-col">

          {/* Background */}
          <div
            className="absolute inset-0 bg-center bg-cover bg-no-repeat"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2400&q=80')" }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-950/75 via-green-900/40 to-black/20" />
          </div>

          {/* AGRICULTURE watermark — bottom */}
          <div className="absolute bottom-0 left-0 right-0 overflow-hidden pointer-events-none select-none z-0">
            <p className="text-[18vw] font-black text-white/[0.07] uppercase tracking-tighter text-center leading-none">
              AGRICULTURE
            </p>
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col flex-1">

            {/* Navbar */}
            <header className="flex justify-between items-center px-6 md:px-10 py-6 shrink-0">
              <div className="flex items-center gap-8">
                <div className="bg-white rounded-2xl px-5 py-2.5 shadow-sm inline-flex items-center gap-2">
                  <Leaf className="text-green-600" size={20} />
                  <span className="text-base font-black tracking-tight text-gray-900">KisaanKaJadoo</span>
                </div>
                <nav className="hidden lg:flex gap-6 text-white font-medium text-sm">
                  <a href="#about" className="hover:text-green-300 transition-colors">{t('about')}</a>
                  <a href="#services" className="hover:text-green-300 transition-colors">{t('features')}</a>
                  <a href="#testimonials" className="hover:text-green-300 transition-colors">{t('testimonials')}</a>
                  <a href="#pricing" className="hover:text-green-300 transition-colors">{t('pricing')}</a>
                </nav>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/10 border border-white/20 text-white">
                  <Globe size={14} className="opacity-70" />
                  <select 
                    value={i18n.language} 
                    onChange={(e) => i18n.changeLanguage(e.target.value)}
                    className="bg-transparent text-xs font-bold outline-none cursor-pointer"
                  >
                    <option value="en" className="text-gray-900">English</option>
                    <option value="hi" className="text-gray-900">हिन्दी</option>
                    <option value="kn" className="text-gray-900">ಕನ್ನಡ</option>
                  </select>
                </div>
                <button
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-2 bg-white text-gray-900 px-5 py-2.5 rounded-full font-bold text-sm hover:bg-green-50 transition-colors shadow-sm"
                >
                  {t('login')} <span className="bg-green-600 text-white rounded-full p-1"><ArrowRight size={13} /></span>
                </button>
              </div>
            </header>

            {/* Hero Body */}
            <div className="flex-1 flex flex-col justify-between px-6 md:px-12 pb-10 pt-4">

              {/* Headline */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-2xl"
              >
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-bold px-4 py-2 rounded-full mb-6">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  {t('hero_badge')}
                </div>
                <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] mb-5">
                  {t('welcome').split(' ').slice(0, 3).join(' ')} <br /> {t('welcome').split(' ').slice(3).join(' ')}
                </h2>
                <p className="text-base md:text-lg text-white/75 mb-8 max-w-lg leading-relaxed">
                  {t('subtitle')}
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="bg-white text-green-700 font-bold px-8 py-4 rounded-full inline-flex items-center gap-3 hover:bg-green-50 transition-colors group shadow-xl"
                >
                  {t('explore')}
                  <span className="bg-green-600 text-white rounded-full p-1.5 group-hover:bg-green-700 transition-colors">
                    <ArrowRight size={16} />
                  </span>
                </button>
              </motion.div>

              {/* Stats Cards — in-flow, right-aligned so they never clip */}
              <div className="flex flex-col sm:flex-row gap-4 mt-10 sm:justify-end">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white/15 backdrop-blur-xl border border-white/25 p-5 rounded-3xl shadow-xl text-white hover:-translate-y-1 transition-transform sm:max-w-[260px]"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-white/20 p-2 rounded-xl"><ShieldCheck size={20} /></div>
                    <h3 className="text-3xl font-black">100%</h3>
                  </div>
                  <p className="text-sm text-white/75 leading-snug">{t('stat_sustainable')}</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 }}
                  className="bg-white/15 backdrop-blur-xl border border-white/25 p-5 rounded-3xl shadow-xl text-white hover:-translate-y-1 transition-transform sm:max-w-[260px]"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex -space-x-2.5">
                      <img className="w-10 h-10 rounded-full border-2 border-green-400 object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" alt="Farmer" />
                      <img className="w-10 h-10 rounded-full border-2 border-green-400 object-cover" src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=100&q=80" alt="Farmer" />
                      <div className="w-10 h-10 rounded-full border-2 border-green-400 bg-green-600 flex items-center justify-center text-xs font-black">+</div>
                    </div>
                    <h3 className="text-3xl font-black">25K+</h3>
                  </div>
                  <p className="text-sm text-white/75 leading-snug">{t('stat_farmers')}</p>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SOLUTIONS SECTION ── */}
      <section id="services" className="max-w-[1400px] mx-auto px-6 md:px-12 mt-32 grid lg:grid-cols-2 gap-20 items-center">
        <div>
          <h2 className="text-sm font-bold text-green-600 uppercase tracking-widest mb-4 inline-flex items-center gap-2">
            <span className="w-8 h-px bg-green-600" /> {t('solutions')}
          </h2>
          <h3 className="text-4xl md:text-5xl font-black text-gray-900 mb-5 leading-tight">
            {t('solutions')}
          </h3>
          <p className="text-gray-500 mb-10">
            {t('solutions_subtitle')}
          </p>

          <div className="grid sm:grid-cols-2 gap-5">
            <div className="relative text-white rounded-[30px] p-7 aspect-square flex flex-col justify-between overflow-hidden group cursor-pointer shadow-xl" onClick={() => navigate('/login')}>
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1628102491629-778571d893a3?auto=format&fit=crop&w=800')] bg-cover bg-center transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-green-950/90 via-green-900/60 to-black/20" />
              <div className="relative z-10 bg-white/20 backdrop-blur-md w-12 h-12 rounded-2xl flex items-center justify-center border border-white/30 text-xl">🌾</div>
              <div className="relative z-10">
                <h4 className="text-xl font-bold mb-1.5 drop-shadow-md">{t('solution_1_title')}</h4>
                <p className="text-sm text-green-50 mb-4 line-clamp-2">{t('solution_1_desc')}</p>
                <div className="w-9 h-9 rounded-full bg-white text-green-700 flex items-center justify-center group-hover:bg-green-500 group-hover:text-white transition-colors">
                  <ArrowRight size={18} />
                </div>
              </div>
            </div>

            <div className="relative text-white rounded-[30px] p-7 aspect-square flex flex-col justify-between overflow-hidden group cursor-pointer shadow-xl hover:-translate-y-2 transition-transform" onClick={() => navigate('/login')}>
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800')] bg-cover bg-center transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
              <div className="relative z-10 bg-green-500 w-12 h-12 rounded-2xl flex items-center justify-center text-xl">🤖</div>
              <div className="relative z-10">
                <h4 className="text-xl font-bold mb-1.5 drop-shadow-md">{t('solution_2_title')}</h4>
                <p className="text-sm text-gray-200 mb-4 line-clamp-2">{t('solution_2_desc')}</p>
                <div className="w-9 h-9 rounded-full bg-green-600 text-white flex items-center justify-center group-hover:bg-white group-hover:text-green-700 transition-colors">
                  <ArrowRight size={18} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right — Image + Floating Card */}
        <div id="about" className="relative">
          <div className="rounded-[36px] overflow-hidden border-8 border-white shadow-2xl h-[480px]">
            <img src="https://images.unsplash.com/photo-1588628566587-dbd176de94b4?auto=format&fit=crop&w=1000&q=80" alt="Farmer with negilu" className="w-full h-full object-cover" />
          </div>
          <div className="lg:absolute top-1/2 lg:-left-16 lg:-translate-y-1/2 bg-white rounded-3xl p-8 shadow-[0_30px_60px_rgba(0,0,0,0.08)] max-w-sm z-20 mt-8 lg:mt-0 relative border border-gray-100">
            <h3 className="text-2xl font-black text-gray-900 mb-3 leading-tight">{t('about_floating_title')}</h3>
            <p className="text-gray-500 text-sm mb-5 leading-relaxed">
              {t('about_floating_desc')}
            </p>
            <button onClick={() => navigate('/login')} className="bg-green-700 text-white font-bold px-6 py-3 rounded-full flex items-center gap-2 hover:bg-green-800 transition-colors text-sm">
              {t('about_btn')} <span className="bg-white text-green-700 p-1 rounded-full"><ArrowRight size={14} /></span>
            </button>
          </div>
        </div>
      </section>

      {/* ── GOVERNMENT SCHEMES SECTION ── */}
      <section id="schemes" className="py-24 bg-white transition-colors">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-sm font-bold text-green-600 uppercase tracking-widest mb-4 inline-flex items-center gap-2">
                <span className="w-8 h-px bg-green-600"></span> {t('schemes_welfare')}
              </h2>
              <h3 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
                {t('schemes')}
              </h3>
            </div>
            <p className="text-gray-500 max-w-sm pb-1 text-sm md:text-base">
              {t('schemes_subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: t("scheme_1_title"), desc: t("scheme_1_desc"), tag: t("scheme_1_tag"), url: 'https://pmkisan.gov.in/', el: 'https://pmkisan.gov.in/FarmerStatus.aspx' },
              { title: t("scheme_2_title"), desc: t("scheme_2_desc"), tag: t("scheme_2_tag"), url: 'https://pmfby.gov.in/', el: 'https://pmfby.gov.in/bfy/eligibilityCalculator' },
              { title: t("scheme_3_title"), desc: t("scheme_3_desc"), tag: t("scheme_3_tag"), url: 'https://maandhan.in/', el: 'https://maandhan.in/' },
              { title: t("scheme_4_title"), desc: t("scheme_4_desc"), tag: t("scheme_4_tag"), url: 'https://fasalrin.gov.in/', el: 'https://fasalrin.gov.in/' },
              { title: t("scheme_5_title"), desc: t("scheme_5_desc"), tag: t("scheme_5_tag"), url: 'https://soilhealth.dac.gov.in/', el: 'https://soilhealth.dac.gov.in/' },
              { title: t("scheme_6_title"), desc: t("scheme_6_desc"), tag: t("scheme_6_tag"), url: 'https://enam.gov.in/', el: 'https://enam.gov.in/' }
            ].map((scheme, i) => (
              <motion.div
                key={i}
                className="p-8 rounded-[32px] bg-gray-50 border border-gray-100 hover:border-green-200 transition-all flex flex-col justify-between h-full group"
              >
                <div>
                  <div className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-bold mb-6 uppercase tracking-wider">
                    {scheme.tag}
                  </div>
                  <h4 className="text-2xl font-black text-gray-900 mb-4">{scheme.title}</h4>
                  <p className="text-gray-500 text-sm leading-relaxed mb-8">{scheme.desc}</p>
                </div>
                <div className="flex items-center gap-6">
                  <button onClick={() => window.open(scheme.el, '_blank')} className="flex items-center gap-2 text-green-700 font-bold text-sm hover:gap-3 transition-all">
                    {t('check_eligibility')} <ArrowRight size={16} />
                  </button>
                  <button onClick={() => window.open(scheme.url, '_blank')} className="text-gray-400 font-bold text-xs hover:text-gray-900 transition-colors">
                    {t('about_scheme', 'About')}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" className="bg-green-900 mt-32 py-28 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-green-800 rounded-full blur-3xl opacity-40 -translate-y-1/2 translate-x-1/2" />
        <div className="max-w-[1400px] mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-xs font-bold text-green-300 uppercase tracking-widest mb-3">{t('testimonials')}</h2>
            <h3 className="text-4xl md:text-5xl font-black text-white">{t('testimonials_title')}</h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { quote: t("test_1_quote"), name: t("test_1_name"), role: t("test_1_role"), img: "https://images.unsplash.com/photo-1595878715977-2e8f8df18ea8?auto=format&fit=crop&w=150&q=80", featured: false },
              { quote: t("test_2_quote"), name: t("test_2_name"), role: t("test_2_role"), img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80", featured: true },
              { quote: t("test_3_quote"), name: t("test_3_name"), role: t("test_3_role"), img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80", featured: false },
            ].map(({ quote, name, role, img, featured }) => (
              <div key={name} className={`rounded-3xl p-8 border ${featured ? 'bg-green-800 border-green-600 scale-105 shadow-2xl' : 'bg-white/10 backdrop-blur-md border-green-700'}`}>
                <div className="flex text-yellow-400 mb-5 text-sm">★★★★★</div>
                <p className="text-green-50 leading-relaxed mb-7 text-sm">&ldquo;{quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <img src={img} alt={name} className="w-12 h-12 rounded-full object-cover border-2 border-green-500" />
                  <div>
                    <h4 className="text-white font-bold text-sm">{name}</h4>
                    <p className={`text-xs ${featured ? 'text-green-200' : 'text-green-300'}`}>{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-28 px-6">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-xs font-bold text-green-600 uppercase tracking-widest mb-3">{t('pricing')}</h2>
            <h3 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">{t('pricing_title')}</h3>
            <p className="text-gray-500 max-w-xl mx-auto text-sm">{t('pricing_subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <div className="bg-white border border-gray-100 rounded-[36px] p-10 text-center shadow-xl shadow-gray-100/50">
              <h4 className="text-xl font-bold text-gray-900 mb-1">{t('plan_farmer')}</h4>
              <p className="text-gray-400 text-sm mb-6">{t('plan_farmer_sub')}</p>
              <div className="text-5xl font-black text-gray-900 mb-7">₹0<span className="text-lg text-gray-400 font-medium">/mo</span></div>
              <ul className="space-y-3 mb-8 text-left text-gray-600 text-sm">
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-600 shrink-0" /> Unlimited AI Scans</li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-600 shrink-0" /> Spatial Labour Matching</li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-600 shrink-0" /> Live Weather Yield Data</li>
              </ul>
              <button onClick={() => navigate('/login')} className="w-full bg-green-50 text-green-700 font-bold py-3.5 rounded-full hover:bg-green-100 transition-colors text-sm">{t('start_free')}</button>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-[36px] p-10 text-center shadow-2xl scale-105 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-600 text-white font-bold px-4 py-1 rounded-full text-xs">{t('most_popular')}</div>
              <h4 className="text-xl font-bold text-white mb-1">{t('plan_vendor')}</h4>
              <p className="text-gray-400 text-sm mb-6">{t('plan_vendor_sub')}</p>
              <div className="text-5xl font-black text-white mb-7">1%<span className="text-lg text-gray-400 font-medium"> /trade</span></div>
              <ul className="space-y-3 mb-8 text-left text-gray-300 text-sm">
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-400 shrink-0" /> Instant Bulk Trade Bids</li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-400 shrink-0" /> E-Commerce Dashboard</li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-400 shrink-0" /> Verified Razorpay Integration</li>
              </ul>
              <button onClick={() => navigate('/login')} className="w-full bg-green-600 text-white font-bold py-3.5 rounded-full hover:bg-green-500 transition-colors text-sm">{t('register_vendor')}</button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-50 border-t border-gray-200 pt-16 pb-8 px-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-5">
                <Leaf className="text-green-600" size={24} />
                <span className="text-xl font-black text-gray-900">KisaanKaJadoo</span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed mb-5">
                {t('footer_desc')}
              </p>
              <div className="flex gap-3">
                {['t', 'f', 'in'].map(s => (
                  <div key={s} className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-bold">{s}</div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-5">{t('platform')}</h4>
              <ul className="space-y-3 text-gray-500 text-sm">
                {['AI Diagnostics', 'Labour Market', 'Vehicle Rentals', 'Agri E-Commerce'].map(l => (
                  <li key={l}><a href="#" className="hover:text-green-600 transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-5">{t('company')}</h4>
              <ul className="space-y-3 text-gray-500 text-sm">
                {['About Us', 'Careers', 'Privacy Policy', 'Terms of Service'].map(l => (
                  <li key={l}><a href="#" className="hover:text-green-600 transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-5">{t('footer_stay')}</h4>
              <p className="text-gray-500 text-sm mb-4">{t('footer_stay_desc')}</p>
              <div className="flex items-center bg-white border border-gray-200 p-1.5 rounded-full shadow-sm focus-within:border-green-500 focus-within:ring-2 ring-green-500/20">
                <input type="email" placeholder="Email Address" className="w-full bg-transparent outline-none px-3 text-gray-700 text-sm" />
                <button className="bg-green-600 text-white rounded-full p-2.5 hover:bg-green-700 transition-colors"><ArrowRight size={16} /></button>
              </div>
            </div>
          </div>

          <div className="text-center pt-6 border-t border-gray-200 text-gray-400 text-sm">
            © 2026 KisaanKaJadoo. Built for the Ultimate Hackathon.
          </div>
        </div>
      </footer>
    </div>
  );
}
