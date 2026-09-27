import React, { useEffect, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router';
import { Home as HomeIcon, Package, Star, Wrench, AlertTriangle } from 'lucide-react';

import DashboardNav from '../../components/dashboard/DashboardNav';
import DashboardFooter from '../../components/dashboard/DashboardFooter';
import { useAuth } from '../../context/AuthContext';
import { dealerProductApi } from '../../api/products';
import { getCategories, getBrands } from '../../api/catalog';

import HomePage from './home/HomePage';
import EquipmentAndOrdersPage from './equipments and orders management/Equipment_and_order_management';
import FeedbackPage from './feedback/Feedback';

const NAV_LINKS = [
    { to: '/dealer/home', label: 'Home', icon: <HomeIcon size={18} />, end: true },
    { to: '/dealer/products', label: 'Products', icon: <Package size={18} /> },
    { to: '/dealer/feedback', label: 'Feedback', icon: <Star size={18} /> },
];

// Demo-only, since the backend has no feedback/review endpoint exposed yet.
const feedbackData = [
    { farmer: 'Farmer Ahmed Ali', equipment: 'Tractor #1', time: '2 hours ago', rating: 4 },
    { farmer: 'Farmer Mohammed Hassan', equipment: 'Harvester #2', time: '1 day ago', rating: 5 },
];

function DealerDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);

    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');

    const loadProducts = () => {
        setLoading(true);
        setError('');

        dealerProductApi
            .list()
            .then((data) => setProducts(data))
            .catch(() => setError('Could not load your listings. Please try again later.'))
            .finally(() => setLoading(false));
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

    const buildPayload = (form) => {
        const base = {
            category_id: Number(form.category_id),
            brand_id: form.brand_id ? Number(form.brand_id) : null,
            product_type: form.product_type,
            name: form.name,
            sku: form.sku,
        };

        if (form.product_type === 'purchased_product') {
            return {
                ...base,
                price: Number(form.price),
                compare_price: form.compare_price ? Number(form.compare_price) : null,
                stock_quantity: form.stock_quantity || 0,
                is_active: true,
            };
        }

        return {
            ...base,
            hourly_rate: Number(form.hourly_rate),
            daily_base_rate: Number(form.daily_base_rate),
            weekly_base_rate: Number(form.weekly_base_rate),
            monthly_base_rate: Number(form.monthly_base_rate),
            transmission: form.transmission,
            fuel_type: form.fuel_type,
            rent_product_status: form.rent_product_status,
        };
    };

    const handleCreate = async (form) => {
        setSaving(true);
        setSaveError('');

        try {
            await dealerProductApi.create(buildPayload(form));
            loadProducts();
            return true;
        } catch (err) {
            const errors = err.response?.data?.errors;
            const firstError = errors ? Object.values(errors)[0]?.[0] : null;
            setSaveError(firstError || 'Could not save this listing. Please check the fields and try again.');
            return false;
        } finally {
            setSaving(false);
        }
    };

    const handleUpdate = async (id, form) => {
        setSaving(true);
        setSaveError('');

        try {
            await dealerProductApi.update(id, buildPayload(form));
            loadProducts();
            return true;
        } catch (err) {
            const errors = err.response?.data?.errors;
            const firstError = errors ? Object.values(errors)[0]?.[0] : null;
            setSaveError(firstError || 'Could not update this listing. Please check the fields and try again.');
            return false;
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this listing? This cannot be undone.')) return;

        try {
            await dealerProductApi.remove(id);
            setProducts((prev) => prev.filter((product) => product.product_id !== id));
        } catch {
            window.alert('Could not delete this listing. Please try again.');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const rentalProducts = products.filter((product) => product.product_type === 'rental_product');
    const forSaleProducts = products.filter((product) => product.product_type === 'purchased_product');
    const availableRentals = rentalProducts.filter((product) => product.rental_product?.rent_product_status === 'available').length;
    const maintenanceRentals = rentalProducts.filter((product) => product.rental_product?.rent_product_status === 'maintenance').length;

    const dashboardStats = [
        {
            title: 'Total Listings',
            value: String(products.length),
            subtitle: `${forSaleProducts.length} for sale, ${rentalProducts.length} for rent`,
            icon: <Package className="icon-size icon-gray-600" />,
        },
        {
            title: 'Available For Rent',
            value: String(availableRentals),
            subtitle: `${rentalProducts.length} total rental listings`,
            icon: <Wrench className="icon-size icon-gray-600" />,
        },
        {
            title: 'Under Maintenance',
            value: String(maintenanceRentals),
            subtitle: 'Needs attention before renting out',
            icon: <AlertTriangle className="icon-size icon-yellow-500" />,
        },
        {
            title: 'Avg. Rating',
            value: (feedbackData.reduce((sum, f) => sum + f.rating, 0) / feedbackData.length).toFixed(1),
            subtitle: `Based on ${feedbackData.length} reviews`,
            icon: <Star className="icon-size icon-yellow-500" />,
        },
    ];

    const recentActivity = products.slice(0, 4).map((product) => ({
        type: 'trend',
        text: `${product.name} is listed as ${product.product_type === 'rental_product' ? 'available for rent' : 'for sale'}`,
        time: '',
    }));

    const feedbackStats = {
        averageRating: (feedbackData.reduce((sum, f) => sum + f.rating, 0) / feedbackData.length).toFixed(1),
        oneStarReviews: feedbackData.filter((f) => f.rating === 1).length,
        fiveStarReviews: feedbackData.filter((f) => f.rating === 5).length,
        thisMonthChange: '+0',
    };

    const ratingDistribution = [1, 2, 3, 4, 5].map((stars) => {
        const count = feedbackData.filter((f) => f.rating === stars).length;
        const percentage = feedbackData.length ? Math.round((count / feedbackData.length) * 100) : 0;
        return { stars, percentage };
    });

    return (
        <div className="dashboard-page">
            <DashboardNav
                title="Dealer"
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
                                dashboardStats={dashboardStats}
                                recentActivity={recentActivity}
                                thisWeekStats={{ newRentals: 0, completed: 0, revenue: '0 SYP' }}
                                equipmentUtilization={[
                                    { status: 'Available', count: availableRentals },
                                    { status: 'Maintenance', count: maintenanceRentals },
                                    { status: 'Rented', count: rentalProducts.length - availableRentals - maintenanceRentals },
                                ]}
                            />
                        }
                    />
                    <Route
                        path="products"
                        element={
                            <EquipmentAndOrdersPage
                                products={products}
                                loading={loading}
                                error={error}
                                categories={categories}
                                brands={brands}
                                categoryNameById={categoryNameById}
                                onCreate={handleCreate}
                                onUpdate={handleUpdate}
                                onDelete={handleDelete}
                                saving={saving}
                                saveError={saveError}
                            />
                        }
                    />
                    <Route
                        path="feedback"
                        element={
                            <FeedbackPage
                                feedbackStats={feedbackStats}
                                ratingDistribution={ratingDistribution}
                                equipmentFeedback={feedbackData}
                            />
                        }
                    />
                    <Route
                        path="*"
                        element={
                            <HomePage
                                dashboardStats={dashboardStats}
                                recentActivity={recentActivity}
                                thisWeekStats={{ newRentals: 0, completed: 0, revenue: '0 SYP' }}
                                equipmentUtilization={[
                                    { status: 'Available', count: availableRentals },
                                    { status: 'Maintenance', count: maintenanceRentals },
                                ]}
                            />
                        }
                    />
                </Routes>
            </div>

            <DashboardFooter />
        </div>
    );
}

export default DealerDashboard;
