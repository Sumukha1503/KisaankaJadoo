import { motion } from 'framer-motion';
import { Landmark, ShieldCheck, HeartPulse, GraduationCap, ArrowRight, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';

const SCHEMES = [
  {
    id: 'pm-kisan',
    icon: '🌾',
    color: 'bg-green-500',
    url: 'https://pmkisan.gov.in/',
    category: 'Income Support'
  },
  {
    id: 'pm-fby',
    icon: '🛡️',
    color: 'bg-blue-500',
    url: 'https://pmfby.gov.in/',
    category: 'Insurance'
  },
  {
    id: 'kcc',
    icon: '💳',
    color: 'bg-amber-500',
    url: 'https://www.myscheme.gov.in/schemes/kcc',
    category: 'Credit'
  },
  {
    id: 'pension',
    icon: '👴',
    color: 'bg-purple-500',
    url: 'https://maandhan.in/',
    category: 'Social Security'
  },
  {
    id: 'subsidy',
    icon: '🚜',
    color: 'bg-rose-500',
    url: 'https://raitamitra.karnataka.gov.in/',
    category: 'Regional Subsidy'
  },
  {
    id: 'soil-health',
    icon: '🧪',
    color: 'bg-emerald-500',
    url: 'https://soilhealth.dac.gov.in/',
    category: 'Land Care'
  }
];

export default function WelfareHubPage() {
  const { t } = useTranslation();

  return (
    <Layout title={t('welfare_title', 'Welfare & Benefits Hub')} subtitle={t('welfare_sub', 'Access government schemes, subsidies, and insurance portals.')}>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SCHEMES.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-[32px] p-8 shadow-clay-card border border-gray-100 hover:border-green-300 transition-all group flex flex-col"
          >
            <div className={`w-14 h-14 rounded-2xl ${s.color} flex items-center justify-center text-2xl mb-6 shadow-lg shadow-${s.color.split('-')[1]}-500/20 text-white`}>
              {s.icon}
            </div>
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{s.category}</div>
            <h3 className="text-xl font-black text-gray-900 mb-2 group-hover:text-green-600 transition-colors uppercase tracking-tight">
               {t(`scheme.${s.id}.title`, s.id.replace('-', ' ').toUpperCase())}
            </h3>
            <p className="text-gray-500 text-sm mb-8 flex-grow">
               {t(`scheme.${s.id}.desc`, `Official portal for ${s.id.replace('-', ' ')} identification and benefits disbursement.`)}
            </p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => window.open(s.url, '_blank')}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white font-bold py-3 rounded-2xl hover:bg-gray-800 transition-colors text-sm"
              >
                {t('apply_now', 'Apply')} <ExternalLink size={14} />
              </button>
              <button 
                onClick={() => window.open(s.url + '#eligibility', '_blank')}
                className="px-5 flex items-center justify-center bg-gray-100 text-gray-600 font-bold py-3 rounded-2xl hover:bg-gray-200 transition-colors text-sm"
              >
                {t('eligibility', 'Check')}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Local Support Section */}
      <div className="mt-12 bg-clay-md-green rounded-clay p-10 border border-white/40 shadow-clay-card">
        <div className="flex flex-col lg:flex-row items-center gap-10">
          <div className="flex-1">
            <h2 className="text-3xl font-black text-gray-900 mb-4">{t('vle_support', 'Connect with local CSC/VLE')}</h2>
            <p className="text-gray-600 text-lg mb-8">{t('vle_desc', 'Need help with registration? Our local Village Level Entrepreneurs are available to assist you with documents and biometric verification.')}</p>
            <button className="flex items-center gap-3 bg-green-600 text-white font-black px-8 py-4 rounded-2xl hover:bg-green-700 transition-all shadow-lg shadow-green-500/30">
               {t('find_nearest_csc', 'Find Nearest Center')} <ArrowRight size={20} />
            </button>
          </div>
          <div className="w-full lg:w-1/3 grid grid-cols-2 gap-4">
             <div className="bg-white/60 p-6 rounded-2xl text-center backdrop-blur-md border border-white/40">
                <div className="text-2xl mb-2">📞</div>
                <div className="font-bold text-gray-900">1800-180-1551</div>
                <div className="text-[10px] text-gray-500 uppercase font-black">PM-KISAN Help</div>
             </div>
             <div className="bg-white/60 p-6 rounded-2xl text-center backdrop-blur-md border border-white/40">
                <div className="text-2xl mb-2">🏫</div>
                <div className="font-bold text-gray-900">KVK Hassan</div>
                <div className="text-[10px] text-gray-500 uppercase font-black">Local Support</div>
             </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
