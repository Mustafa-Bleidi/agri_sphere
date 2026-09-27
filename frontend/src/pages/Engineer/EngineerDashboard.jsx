import React, { useEffect, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router';
import { Home as HomeIcon, MessageSquare, ShoppingCart, Video, Star } from 'lucide-react';

import DashboardNav from '../../components/dashboard/DashboardNav';
import ProductModal from '../../components/ProductModal/ProductModal';
import ChatModal from '../../components/Chat/ChatModal';
import { useAuth } from '../../context/AuthContext';
import { engineerProductApi } from '../../api/products';
import { getCategories, getBrands } from '../../api/catalog';

import HomePage from './home/HomePage';
import ConsultationsPage from './consultation/Consultation';
import MarketplacePage from './marketplace/MarketplacePage';
import VideoCallPage from './video call/VideoCallPage';
import FeedbackPage from './feedback/FeedbackPage';

const NAV_LINKS = [
    { to: '/engineer/home', label: 'Home', icon: <HomeIcon size={18} />, end: true },
    { to: '/engineer/consultations', label: 'Consultations', icon: <MessageSquare size={18} /> },
    { to: '/engineer/marketplace', label: 'Marketplace', icon: <ShoppingCart size={18} /> },
    { to: '/engineer/video-call', label: 'Video Call', icon: <Video size={18} /> },
    { to: '/engineer/feedback', label: 'Feedback', icon: <Star size={18} /> },
];

const initialConsultations = [
    { id: 1, farmer: 'Fatima Al-Rashid', type: 'video', content: 'My wheat crop has yellow spots on leaves. Need urgent video consultation to identify the disease and get treatment recommendations.', status: 'pending', date: '2025-11-28 10:00', category: 'Video Call', topic: 'Wheat crop disease identification' },
    { id: 2, farmer: 'Fatima Al-Rashid', type: 'text', content: 'Looking for advice on the best organic fertilizer for my tomato plantation. Also need dosage recommendations.', status: 'pending', date: '2025-11-28 14:00', category: 'Text', topic: 'Best fertilizer for tomato plants' },
    { id: 3, farmer: 'Omar Hassan', type: 'video', content: 'Need consultation on setting up a drip irrigation system for my vegetable farm.', status: 'pending', date: '2025-12-28 10:00', category: 'Video Call', topic: 'Irrigation system setup' },
    { id: 4, farmer: 'Sara Ibrahim', type: 'pest', content: 'Found small white insects on my cucumber plants. Need advice on safe pest control methods.', status: 'pending', date: '2025-05-28 14:00', category: 'Pest Report', topic: 'Pest control for cucumber plants' },
];

const initialFeedback = [
    { id: 1, farmer: 'Ahmed Hassan', type: 'consultation', rating: 5, date: '2025-12-11' },
    { id: 2, farmer: 'Sara Mohamed', type: 'product', rating: 4, date: '2025-12-10' },
    { id: 3, farmer: 'Omar Hassan', type: 'pest', rating: 4, date: '2025-12-09' },
];

const initialUpcomingCalls = [
    { id: 1, farmer: 'Ahmed Khalil', topic: 'Wheat crop disease identification', date: 'Today at 10:00 AM', duration: '30 min' },
];

const initialCompletedCalls = [
    { id: 1, farmer: 'Layla Hassan', topic: 'Pest management strategies', date: 'Yesterday at 9:00 AM', duration: '40 min' },
];

function EngineerDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // ----- Demo-only state (no backend endpoint exists yet for these) -----
    const [consultations, setConsultations] = useState(initialConsultations);
    const [, setAlerts] = useState([]);
    const [upcomingCalls, setUpcomingCalls] = useState(initialUpcomingCalls);
    const [completedCalls] = useState(initialCompletedCalls);
    const [feedback] = useState(initialFeedback);
    const [orders] = useState([]);

    const [showChatModal, setShowChatModal] = useState(false);
    const [currentChatFarmer, setCurrentChatFarmer] = useState(null);
    const [chatMessages, setChatMessages] = useState({});

    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [selectedCallId, setSelectedCallId] = useState(null);
    const [newDate, setNewDate] = useState('');
    const [newTime, setNewTime] = useState('');

    // ----- Real, backend-connected state: this engineer's storefront -----
    const [products, setProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(true);
    const [productsError, setProductsError] = useState('');
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);

    const [showProductModal, setShowProductModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [savingProduct, setSavingProduct] = useState(false);
    const [saveError, setSaveError] = useState('');

    const loadProducts = () => {
        setProductsLoading(true);
        setProductsError('');

        engineerProductApi
            .list()
            .then((data) => setProducts(data))
            .catch(() => setProductsError('Could not load your products. Please try again later.'))
            .finally(() => setProductsLoading(false));
    };

    useEffect(() => {
        loadProducts();
        getCategories().then(setCategories).catch(() => setCategories([]));
        getBrands().then(setBrands).catch(() => setBrands([]));
    }, []);

    const categoryNameById = categories.reduce((acc, category) => {
        acc[category.category_id] = category.name;
        return acc;
    }, {});

    const handleOpenChat = (farmerName) => {
        setCurrentChatFarmer(farmerName);
        if (!chatMessages[farmerName]) {
            setChatMessages((prev) => ({
                ...prev,
                [farmerName]: [{ id: 1, text: "Hello! I'm having issues with my crop.", sender: 'farmer', timestamp: '9:30 AM' }],
            }));
        }
        setShowChatModal(true);
    };

    const handleSaveProduct = async (formData) => {
        setSavingProduct(true);
        setSaveError('');

        const payload = {
            category_id: Number(formData.category_id),
            brand_id: formData.brand_id ? Number(formData.brand_id) : null,
            product_type: 'purchased_product',
            name: formData.name,
            sku: formData.sku,
            description: formData.description,
            short_description: formData.short_description,
            stock_quantity: formData.stock_quantity || 0,
            price: Number(formData.price),
            compare_price: formData.compare_price ? Number(formData.compare_price) : null,
            is_active: true,
        };

        try {
            if (editingProduct) {
                await engineerProductApi.update(editingProduct.product_id, payload);
            } else {
                await engineerProductApi.create(payload);
            }

            setShowProductModal(false);
            setEditingProduct(null);
            loadProducts();
        } catch (error) {
            const errors = error.response?.data?.errors;
            const firstError = errors ? Object.values(errors)[0]?.[0] : null;
            setSaveError(firstError || 'Could not save this product. Please check the fields and try again.');
        } finally {
            setSavingProduct(false);
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (!window.confirm('Delete this product? This cannot be undone.')) return;

        try {
            await engineerProductApi.remove(productId);
            setProducts((prev) => prev.filter((product) => product.product_id !== productId));
        } catch {
            window.alert('Could not delete this product. Please try again.');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="dashboard-page">
            <DashboardNav
                title="Engineer"
                links={NAV_LINKS}
                userName={user?.name}
                onLogout={handleLogout}
            />

            <div className="dashboard-page__content">
                <Routes>
                    <Route
                        path="home"
                        element={
                            <HomePage
                                consultations={consultations}
                                upcomingCalls={upcomingCalls}
                                orders={orders}
                                feedback={feedback}
                                setCurrentPage={(page) => navigate(`/engineer/${page}`)}
                            />
                        }
                    />
                    <Route
                        path="consultations"
                        element={
                            <ConsultationsPage
                                consultations={consultations}
                                setConsultations={setConsultations}
                                handleOpenChat={handleOpenChat}
                                setUpcomingCalls={setUpcomingCalls}
                                setAlerts={setAlerts}
                            />
                        }
                    />
                    <Route
                        path="marketplace"
                        element={
                            <MarketplacePage
                                products={products}
                                loading={productsLoading}
                                error={productsError}
                                categoryNameById={categoryNameById}
                                setShowProductModal={setShowProductModal}
                                setEditingProduct={setEditingProduct}
                                handleDeleteProduct={handleDeleteProduct}
                            />
                        }
                    />
                    <Route
                        path="video-call"
                        element={
                            <VideoCallPage
                                upcomingCalls={upcomingCalls}
                                setUpcomingCalls={setUpcomingCalls}
                                completedCalls={completedCalls}
                                setShowDownloadModal={setShowDownloadModal}
                                showDownloadModal={showDownloadModal}
                                setShowRescheduleModal={setShowRescheduleModal}
                                selectedCallId={selectedCallId}
                                setSelectedCallId={setSelectedCallId}
                                newDate={newDate}
                                setNewDate={setNewDate}
                                newTime={newTime}
                                setNewTime={setNewTime}
                                showRescheduleModal={showRescheduleModal}
                            />
                        }
                    />
                    <Route path="feedback" element={<FeedbackPage feedback={feedback} />} />
                    <Route path="*" element={<HomePage
                        consultations={consultations}
                        upcomingCalls={upcomingCalls}
                        orders={orders}
                        feedback={feedback}
                        setCurrentPage={(page) => navigate(`/engineer/${page}`)}
                    />} />
                </Routes>
            </div>

            {showProductModal && (
                <ProductModal
                    product={editingProduct}
                    categories={categories}
                    brands={brands}
                    saving={savingProduct}
                    error={saveError}
                    onSave={handleSaveProduct}
                    onClose={() => {
                        setShowProductModal(false);
                        setEditingProduct(null);
                        setSaveError('');
                    }}
                />
            )}

            {showChatModal && (
                <ChatModal
                    showChatModal={showChatModal}
                    setShowChatModal={setShowChatModal}
                    currentChatFarmer={currentChatFarmer}
                    setCurrentChatFarmer={setCurrentChatFarmer}
                    chatMessages={chatMessages}
                    setChatMessages={setChatMessages}
                />
            )}
        </div>
    );
}

export default EngineerDashboard;
