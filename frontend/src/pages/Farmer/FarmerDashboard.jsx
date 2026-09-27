import React, { useEffect, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router';
import { Home as HomeIcon, ShoppingCart, ClipboardList, User as UserIcon } from 'lucide-react';

import DashboardNav from '../../components/dashboard/DashboardNav';
import DashboardFooter from '../../components/dashboard/DashboardFooter';
import CartModal from '../../components/cart/CartModal';
import { useAuth } from '../../context/AuthContext';
import { getPurchasedProducts, getRentalProducts } from '../../api/marketplace';
import { getCategories } from '../../api/catalog';
import { getOrders, savePurchasedOrder, saveRentalOrder } from '../../api/orders';

import FarmerHome from './home/FarmerHome';
import FarmerMarketplace from './marketplace/FarmerMarketplace';
import FarmerOrders from './orders/FarmerOrders';
import FarmerOrderDetail from './orders/FarmerOrderDetail';
import FarmerProfile from './profile/FarmerProfile';

const NAV_LINKS = [
    { to: '/farmer/home', label: 'Home', icon: <HomeIcon size={18} />, end: true },
    { to: '/farmer/marketplace', label: 'Marketplace', icon: <ShoppingCart size={18} /> },
    { to: '/farmer/orders', label: 'My Orders', icon: <ClipboardList size={18} /> },
    { to: '/farmer/profile', label: 'Profile', icon: <UserIcon size={18} /> },
];

function FarmerDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [purchasedProducts, setPurchasedProducts] = useState([]);
    const [rentalProducts, setRentalProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [productsLoading, setProductsLoading] = useState(true);
    const [productsError, setProductsError] = useState('');

    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [ordersError, setOrdersError] = useState('');

    const [cart, setCart] = useState([]);
    const [showCart, setShowCart] = useState(false);
    const [checkoutSaving, setCheckoutSaving] = useState(false);
    const [checkoutError, setCheckoutError] = useState('');

    const loadOrders = () => {
        setOrdersLoading(true);
        setOrdersError('');
        getOrders()
            .then(setOrders)
            .catch(() => setOrdersError('Could not load your orders.'))
            .finally(() => setOrdersLoading(false));
    };

    useEffect(() => {
        setProductsLoading(true);
        Promise.all([getPurchasedProducts(), getRentalProducts()])
            .then(([purchased, rental]) => {
                setPurchasedProducts(purchased);
                setRentalProducts(rental);
            })
            .catch(() => setProductsError('Could not load the marketplace. Please try again later.'))
            .finally(() => setProductsLoading(false));

        getCategories().then(setCategories).catch(() => setCategories([]));
        loadOrders();
    }, []);

    const categoryNameById = categories.reduce((acc, category) => {
        acc[category.category_id] = category.name;
        return acc;
    }, {});

    const handleAddToCart = (product) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.product_id === product.product_id);
            if (existing) {
                return prev.map((item) =>
                    item.product_id === product.product_id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, {
                product_id: product.product_id,
                purchased_product_id: product.product_id,
                name: product.name,
                price: Number(product.price ?? 0),
                quantity: 1,
            }];
        });
        setShowCart(true);
    };

    const handleUpdateQuantity = (productId, quantity) => {
        setCart((prev) => prev.map((item) => (item.product_id === productId ? { ...item, quantity } : item)));
    };

    const handleRemoveFromCart = (productId) => {
        setCart((prev) => prev.filter((item) => item.product_id !== productId));
    };

    const handleCheckout = async (address) => {
        setCheckoutSaving(true);
        setCheckoutError('');

        const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

        const payload = {
            order_type: 'purchased_order',
            discount_amount: 0,
            cancelled_at: null,
            cancellation_reason: null,
            ...address,
            address_type: 'shipping',
            payment_method: 'cod',
            payment_status: 'pending',
            amount: subtotal,
            transaction_id: `COD-${Date.now()}`,
            subtotal,
            grand_total: subtotal,
            order_status: 'pending',
            required_date: null,
            shipped_date: null,
            shipping_fee: 0,
            cart: cart.map((item) => ({
                purchased_product_id: item.purchased_product_id,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
            })),
        };

        try {
            await savePurchasedOrder(payload);
            setCart([]);
            setShowCart(false);
            loadOrders();
            navigate('/farmer/orders');
        } catch (err) {
            const errors = err.response?.data?.errors;
            const firstError = errors ? Object.values(errors)[0]?.[0] : null;
            setCheckoutError(firstError || err.response?.data?.message || 'Could not place your order.');
        } finally {
            setCheckoutSaving(false);
        }
    };

    const submitRentalOrder = async (product, { address, days, baseAmount }) => {
        const payload = {
            order_type: 'rental_order',
            discount_amount: 0,
            cancelled_at: null,
            cancellation_reason: null,
            rental_product_id: product.product_id,
            ...address,
            address_type: 'pickup',
            payment_method: 'cod',
            payment_status: 'pending',
            amount: baseAmount,
            transaction_id: `COD-${Date.now()}`,
            actual_pickup_date: null,
            actual_dropoff_date: null,
            rental_status: 'quote',
            pickup_status: 'pending',
            dropoff_status: 'pending',
            base_rental_amount: baseAmount,
            tax_amount: 0,
            insurance_total: 0,
            total_amount: baseAmount,
            refund_amount: 0,
            days,
        };

        await saveRentalOrder(payload);
        loadOrders();
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="dashboard-page">
            <DashboardNav
                title="Farmer"
                links={NAV_LINKS}
                userName={user?.name}
                onLogout={handleLogout}
                cartCount={cartCount}
                onCartClick={() => setShowCart(true)}
            />

            <div className="dashboard-page__content">
                <Routes>
                    <Route
                        path="home"
                        element={
                            <FarmerHome
                                userName={user?.name}
                                orders={orders}
                                ordersLoading={ordersLoading}
                                cartCount={cartCount}
                            />
                        }
                    />
                    <Route
                        path="marketplace"
                        element={
                            <FarmerMarketplace
                                purchasedProducts={purchasedProducts}
                                rentalProducts={rentalProducts}
                                loading={productsLoading}
                                error={productsError}
                                categories={categories}
                                categoryNameById={categoryNameById}
                                onAddToCart={handleAddToCart}
                                submitRentalOrder={submitRentalOrder}
                            />
                        }
                    />
                    <Route
                        path="orders"
                        element={<FarmerOrders orders={orders} loading={ordersLoading} error={ordersError} />}
                    />
                    <Route path="orders/:id" element={<FarmerOrderDetail />} />
                    <Route path="profile" element={<FarmerProfile />} />
                    <Route
                        path="*"
                        element={
                            <FarmerHome
                                userName={user?.name}
                                orders={orders}
                                ordersLoading={ordersLoading}
                                cartCount={cartCount}
                            />
                        }
                    />
                </Routes>
            </div>

            <DashboardFooter />

            {showCart && (
                <CartModal
                    items={cart}
                    saving={checkoutSaving}
                    error={checkoutError}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemove={handleRemoveFromCart}
                    onCheckout={handleCheckout}
                    onClose={() => setShowCart(false)}
                />
            )}
        </div>
    );
}

export default FarmerDashboard;
