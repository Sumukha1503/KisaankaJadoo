import { motion } from 'framer-motion';
import { BookOpen, ExternalLink, GraduationCap, MapPin, Sprout, Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';

const CASE_STUDIES = [
  {
    id: 'belt',
    title: 'Krishi Belaku: Actor Kishore\'s Farm Journey',
    desc: 'How popular actor Kishore transformed a rocky patch in Hassan into a thriving natural forest ecosystem, highlighting that success comes from working WITH nature, not against it.',
    tags: ['Natural Farming', 'Hassan', 'Success Story'],
    isSuccess: true,
    url: 'https://www.thehindu.com/entertainment/movies/actor-kishore-on-his-organic-farm-and-natural-way-of-living/article32214474.ece'
  },
  {
    id: 'soil',
    title: 'KVK Kandali Soil Health Success',
    desc: 'Farmers in Kandali region boosted their yielding by 25% by addressing micronutrient deficiencies in Copper, Zinc, and Magnesium as recommended by local Krishi Vigyan Kendra experts.',
    tags: ['Soil Science', 'Hassan', 'Micronutrients'],
    isSuccess: true,
    url: 'https://hassan.kvk.org.in'
  }
];

const ORGANIZATIONS = [
  { name: 'org_uas', link: 'https://uasbangalore.edu.in', type: 'University', location: 'Bangalore' },
  { name: 'org_cdb', link: 'https://coconutboard.gov.in', type: 'Statutory Body', location: 'National/Local' },
  { name: 'org_sahaja', link: 'https://sahajasamrudha.org', type: 'Seed Collective', location: 'Karnataka' },
  { name: 'org_kvk', link: 'https://hassan.kvk.org.in', type: 'Govt Research', location: 'Hassan' }
];

export default function KnowledgeHubPage() {
  const { t } = useTranslation();

  return (
    <Layout title={t('nav.knowledge')} subtitle="Regional insights, success stories, and farming expertise.">
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Case Studies */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Award className="text-amber-500" /> {t('case_studies_header', 'Regional Case Studies')}
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {CASE_STUDIES.map((c) => (
              <motion.div 
                key={c.id} 
                whileHover={{ y: -5 }}
                className="bg-white rounded-[32px] p-6 shadow-clay-card border border-gray-100 flex flex-col"
              >
                <div className="flex gap-2 mb-4 flex-wrap">
                  {c.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-green-50 text-green-700 text-[10px] font-black uppercase rounded-full tracking-wider">{tag}</span>
                  ))}
                </div>
                <h3 className="text-lg font-black text-gray-900 mb-3 leading-tight">{c.title}</h3>
                <p className="text-gray-500 text-sm mb-6 flex-grow">{c.desc}</p>
                <button 
                  onClick={() => window.open(c.url, '_blank')}
                  className="w-full py-3 bg-gray-900 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
                >
                  <BookOpen size={16} /> Read Case Study
                </button>
              </motion.div>
            ))}
          </div>

          <div className="bg-clay-md-green rounded-clay p-8 shadow-clay-card mt-8 border border-white/40">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-clay-btn flex items-center justify-center text-3xl shrink-0">📍</div>
              <div>
                <h3 className="text-xl font-black text-gray-900 mb-2">Aikantika: Natural Living in Tumkur</h3>
                <p className="text-gray-600 text-sm mb-4">Inspired by Masanobu Fukuoka, Aikantika offers periodical 3-5 day training sessions on No-Till Natural Farming and Food Forest creation. A living example of sustainable Gandhian agriculture.</p>
                <a href="https://aikantikahf.wixsite.com/aikantika" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-green-600 font-bold text-sm hover:underline">
                  Visit Website <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Organizations Sidebar */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <GraduationCap className="text-sky-500" /> {t('resources_header', 'Trusted Resources')}
          </h2>
          
          <div className="space-y-4">
            {ORGANIZATIONS.map((org) => (
              <a 
                key={org.name} 
                href={org.link} 
                target="_blank" 
                rel="noreferrer"
                className="block p-5 bg-white rounded-[28px] shadow-clay-card border border-gray-100 hover:border-green-300 transition-all group"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-black text-sky-500 uppercase tracking-widest">{org.type}</span>
                  <ExternalLink size={14} className="text-gray-300 group-hover:text-green-500" />
                </div>
                <h4 className="font-black text-gray-900 group-hover:text-green-600 transition-colors">{t(org.name)}</h4>
                <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                  <MapPin size={10} /> {org.location}
                </div>
              </a>
            ))}
          </div>

          <div className="bg-sky-500 rounded-[32px] p-8 text-white shadow-xl shadow-sky-500/20">
            <Sprout size={32} className="mb-4 opacity-80" />
            <h3 className="text-lg font-black mb-2">Punya Bhumi Project</h3>
            <p className="text-sky-50 text-sm mb-4">A community-driven initiative in Hassan focus on reviving local biodiversity and protecting soil health. Join the movement.</p>
            <button 
              onClick={() => window.open('https://www.facebook.com/PunyaBhumi/', '_blank')}
              className="w-full py-3 bg-white text-sky-600 rounded-2xl font-black text-sm shadow-lg shadow-sky-900/20 hover:bg-sky-50 transition-colors uppercase tracking-tight"
            >
              Learn More
            </button>
          </div>
        </div>

      </div>
    </Layout>
  );
}
