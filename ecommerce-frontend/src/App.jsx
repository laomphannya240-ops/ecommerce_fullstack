import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';
import CustomerLayout from './layouts/CustomerLayout';
import AdminLayout from './layouts/AdminLayout';

// Customer pages
import HomePage from './pages/customer/HomePage';
import ShopPage from './pages/customer/ShopPage';
import ProductDetailsPage from './pages/customer/ProductDetailsPage';
import CategoriesPage from './pages/customer/CategoriesPage';
import SearchResultsPage from './pages/customer/SearchResultsPage';
import CartPage from './pages/customer/CartPage';
import WishlistPage from './pages/customer/WishlistPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import PaymentPage from './pages/customer/PaymentPage';
import PaymentSuccessPage from './pages/customer/PaymentSuccessPage';
import PaymentFailedPage from './pages/customer/PaymentFailedPage';
import MyAccountPage from './pages/customer/MyAccountPage';
import MyOrdersPage from './pages/customer/MyOrdersPage';
import OrderDetailsPage from './pages/customer/OrderDetailsPage';
import AboutPage from './pages/customer/AboutPage';
import ContactPage from './pages/customer/ContactPage';
import NotFoundPage from './pages/customer/NotFoundPage';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Admin pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminBrandsPage from './pages/admin/AdminBrandsPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminCustomersPage from './pages/admin/AdminCustomersPage';
import AdminCouponsPage from './pages/admin/AdminCouponsPage';
import AdminBannersPage from './pages/admin/AdminBannersPage';
import AdminPaymentsPage from './pages/admin/AdminPaymentsPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <BrowserRouter>
              <Routes>
                <Route element={<CustomerLayout />}>
                  <Route index element={<HomePage />} />
                  <Route path="shop" element={<ShopPage />} />
                  <Route path="products/:slug" element={<ProductDetailsPage />} />
                  <Route path="categories" element={<CategoriesPage />} />
                  <Route path="search" element={<SearchResultsPage />} />
                  <Route path="about" element={<AboutPage />} />
                  <Route path="contact" element={<ContactPage />} />
                  <Route path="login" element={<LoginPage />} />
                  <Route path="register" element={<RegisterPage />} />
                  <Route path="forgot-password" element={<ForgotPasswordPage />} />

                  <Route path="cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
                  <Route path="wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
                  <Route path="checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                  <Route path="payment/:id" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
                  <Route path="payment/success" element={<ProtectedRoute><PaymentSuccessPage /></ProtectedRoute>} />
                  <Route path="payment/failed" element={<ProtectedRoute><PaymentFailedPage /></ProtectedRoute>} />
                  <Route path="account" element={<ProtectedRoute><MyAccountPage /></ProtectedRoute>} />
                  <Route path="account/orders" element={<ProtectedRoute><MyOrdersPage /></ProtectedRoute>} />
                  <Route path="account/orders/:id" element={<ProtectedRoute><OrderDetailsPage /></ProtectedRoute>} />

                  <Route path="404" element={<NotFoundPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>

                <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                  <Route index element={<AdminDashboardPage />} />
                  <Route path="products" element={<AdminProductsPage />} />
                  <Route path="categories" element={<AdminCategoriesPage />} />
                  <Route path="brands" element={<AdminBrandsPage />} />
                  <Route path="orders" element={<AdminOrdersPage />} />
                  <Route path="customers" element={<AdminCustomersPage />} />
                  <Route path="coupons" element={<AdminCouponsPage />} />
                  <Route path="banners" element={<AdminBannersPage />} />
                  <Route path="payments" element={<AdminPaymentsPage />} />
                  <Route path="reports" element={<AdminReportsPage />} />
                  <Route path="*" element={<Navigate to="/admin" replace />} />
                </Route>
              </Routes>
            </BrowserRouter>
            <Toaster richColors position="top-right" />
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
