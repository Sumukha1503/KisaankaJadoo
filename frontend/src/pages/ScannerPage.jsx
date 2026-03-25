import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import { Upload, Camera, History, Leaf, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function ScannerPage() {
  const { t } = useTranslation();
  const { token } = useSelector((s) => s.auth);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [scanning, setScanning] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    axios.get(`${API}/api/ai/history`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setHistory(r.data))
      .catch(() => {});
  }, []);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result);
    reader.readAsDataURL(file);
    setResult(null);
  };

  const scan = async () => {
    if (!preview) return toast.error(t('upload_header'));
    setScanning(true);
    try {
      const response = await axios.post(
        `${API}/api/ai/analyze-disease`,
        { imageBase64: preview },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const { disease, confidence, treatment, severity, timestamp } = response.data;
      const scanResult = { disease, confidence, treatment, severity, timestamp };
      setResult(scanResult);
      setHistory(h => [scanResult, ...h].slice(0, 10));
      toast.success(t('diagnosis_complete') || 'Analysis complete!');
    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error(`${error.response?.data?.error}: ${error.response?.data?.details}` || 'Failed to analyze image');
    } finally {
      setScanning(false);
    }
  };

  const isHealthy = result?.disease?.toLowerCase()?.includes('healthy');
  const chartData = history.slice(0, 7).reverse().map((h, i) => ({ day: `Day ${i+1}`, confidence: parseFloat(h.confidence) || 0 }));

  return (
    <Layout title={t('scanner_title')} subtitle={t('scanner_sub')}>
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Upload Panel */}
        <div className="space-y-6">
          <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-gray-100/50 border border-gray-100">
            <h2 className="text-xl font-black text-gray-900 mb-6">{t('upload_header')}</h2>
            
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-gray-200 hover:border-green-400 rounded-3xl p-10 text-center cursor-pointer transition-all hover:bg-green-50/50 group"
            >
              {preview ? (
                <div className="relative">
                  <img src={preview} alt="Plant" className="w-full max-h-64 object-contain rounded-2xl" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-2xl transition-all flex items-center justify-center">
                    <Upload size={24} className="text-white opacity-0 group-hover:opacity-100" />
                  </div>
                </div>
              ) : (
                <div>
                  <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                    <Camera size={28} className="text-green-500" />
                  </div>
                  <p className="text-gray-600 font-semibold mb-1">{t('click_upload')}</p>
                  <p className="text-gray-400 text-sm">PNG, JPG up to 10MB</p>
                </div>
              )}
            </div>

            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />

            <div className="flex gap-3 mt-4">
              <button onClick={() => fileRef.current?.click()} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors text-sm">
                <Upload size={16} /> {t('upload_btn')}
              </button>
              <button onClick={scan} disabled={!preview || scanning} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-green-600 text-white font-bold hover:bg-green-700 transition-colors disabled:opacity-50 text-sm shadow-lg shadow-green-500/20">
                {scanning ? <><Loader size={14} className="animate-spin" /> {t('scanning_btn')}</> : <><Leaf size={14} /> {t('diagnose_btn')}</>}
              </button>
            </div>
          </div>

          {/* Result Card */}
          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className={`rounded-[32px] p-8 border ${isHealthy ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-center gap-3 mb-4">
                  {isHealthy ? <CheckCircle size={28} className="text-green-600" /> : <AlertCircle size={28} className="text-red-500" />}
                  <h3 className="text-xl font-black text-gray-900">{t('diagnosis_result')}</h3>
                </div>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <div className={`text-3xl font-black mb-2 ${isHealthy ? 'text-green-700' : 'text-red-700'}`}>{result.disease}</div>
                    <div className={`text-sm font-semibold mb-6 ${isHealthy ? 'text-green-600' : 'text-red-500'}`}>{result.confidence}% {t('confidence_label')}</div>
                    {result.severity && (
                      <div className="text-xs font-bold text-gray-500 mb-3 uppercase">Severity: {result.severity}</div>
                    )}
                    <div className="bg-white/70 rounded-2xl p-4">
                       <p className="text-sm text-gray-700 font-medium">💊 <strong>{t('rec_action')}:</strong> {result.treatment || 'No specific treatment recommended.'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* History Panel */}
        <div className="space-y-6">
          {chartData.length > 0 && (
            <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-gray-100/50 border border-gray-100">
              <h2 className="text-xl font-black text-gray-900 mb-6">{t('confidence_trend')}</h2>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="confidence" stroke="#16a34a" strokeWidth={2.5} dot={{ fill: '#16a34a', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-gray-100/50 border border-gray-100">
            <div className="flex items-center gap-2 mb-6">
              <History size={20} className="text-gray-400" />
              <h2 className="text-xl font-black text-gray-900">{t('scan_history')}</h2>
            </div>
            {history.length === 0 ? (
              <p className="text-gray-400 text-center py-8 text-sm">{t('no_scans')}</p>
            ) : (
              <div className="space-y-3">
                {history.map((h, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${h.disease?.toLowerCase().includes('healthy') ? 'bg-green-500' : 'bg-red-400'}`} />
                      <span className="font-semibold text-gray-800 text-sm">{h.disease}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-gray-500">{h.confidence}%</div>
                      <div className="text-xs text-gray-300">{h.timestamp ? new Date(h.timestamp).toLocaleDateString() : 'Today'}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}