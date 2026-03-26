import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import FarmWizardPage from './pages/FarmWizardPage';
import LabourPage from './pages/LabourPage';
import ShopPage from './pages/ShopPage';
import ScannerPage from './pages/ScannerPage';
import AnalyticsPage from './pages/AnalyticsPage';
import LoginPage from './pages/LoginPage';
import VehiclePage from './pages/VehiclePage';
import VendorPage from './pages/VendorPage';
import KnowledgeHubPage from './pages/KnowledgeHubPage';
import WelfareHubPage from './pages/WelfareHubPage';
import ManagementPage from './pages/ManagementPage';
import ProfilePage from './pages/ProfilePage';
import AssistantPage from './pages/AssistantPage';
import AdminDashboard from './pages/AdminDashboard';
import { useSelector } from 'react-redux';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';

const PrivateRoute = ({ children, roles }) => {
    const { token, role } = useSelector((s) => s.auth);
    if (!token) return <Navigate to="/login" />;
    if (roles && !roles.includes(role)) return <Navigate to="/" />;
    return children;
};

export default function App() {
    const { t } = useTranslation();
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold text-gray-500">{t('loading')}</div>}>
            <div className="min-h-screen bg-white">
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        {/* ... existing routes ... */}
                        <Route path="/farm-wizard" element={<PrivateRoute roles={['FARMER']}><FarmWizardPage /></PrivateRoute>} />
                        <Route path="/labour" element={<PrivateRoute roles={['FARMER', 'LABOUR']}><LabourPage /></PrivateRoute>} />
                        <Route path="/shop" element={<PrivateRoute roles={['FARMER']}><ShopPage /></PrivateRoute>} />
                        <Route path="/scanner" element={<PrivateRoute roles={['FARMER']}><ScannerPage /></PrivateRoute>} />
                        <Route path="/analytics" element={<PrivateRoute roles={['FARMER', 'ADMIN', 'LABOUR', 'STORE_OWNER', 'VENDOR', 'VEHICLE_OWNER']}><AnalyticsPage /></PrivateRoute>} />
                        <Route path="/vehicles" element={<PrivateRoute roles={['FARMER', 'VEHICLE_OWNER', 'ADMIN']}><VehiclePage /></PrivateRoute>} />
                        <Route path="/vendors" element={<PrivateRoute roles={['FARMER', 'STORE_OWNER', 'VENDOR', 'ADMIN']}><VendorPage /></PrivateRoute>} />
                        <Route path="/knowledge" element={<PrivateRoute roles={['FARMER', 'ADMIN']}><KnowledgeHubPage /></PrivateRoute>} />
                        <Route path="/assistant" element={<PrivateRoute roles={['FARMER', 'ADMIN', 'LABOUR', 'STORE_OWNER', 'VENDOR', 'VEHICLE_OWNER']}><AssistantPage /></PrivateRoute>} />
                        <Route path="/welfare" element={<PrivateRoute roles={['FARMER', 'ADMIN', 'LABOUR']}><WelfareHubPage /></PrivateRoute>} />
                        <Route path="/manage" element={<PrivateRoute roles={['FARMER', 'STORE_OWNER', 'VEHICLE_OWNER', 'VENDOR', 'ADMIN', 'LABOUR']}><ManagementPage /></PrivateRoute>} />
                        <Route path="/admin" element={<PrivateRoute roles={['ADMIN']}><AdminDashboard /></PrivateRoute>} />
                        <Route path="/profile" element={<PrivateRoute roles={['FARMER', 'STORE_OWNER', 'VEHICLE_OWNER', 'VENDOR', 'ADMIN', 'LABOUR']}><ProfilePage /></PrivateRoute>} />
                    </Routes>
                </div>
            </Suspense>
    );
}
