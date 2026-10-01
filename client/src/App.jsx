import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';
import { SocketProvider } from './context/SocketContext';

// Components
import ProtectedRoute from './components/common/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';

// Public Pages
import Landing from './pages/Landing';
import NotFound from './pages/NotFound';

// Auth Pages
import StudentLogin from './pages/auth/StudentLogin';
import StudentRegister from './pages/auth/StudentRegister';
import VendorLogin from './pages/auth/VendorLogin';
import VendorRegister from './pages/auth/VendorRegister';
import AdminLogin from './pages/auth/AdminLogin';
import ForgotPassword from './pages/auth/ForgotPassword';

// Layouts
import StudentLayout from './layouts/StudentLayout';
import VendorLayout from './layouts/VendorLayout';
import AdminLayout from './layouts/AdminLayout';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import Menu from './pages/student/Menu';
import FoodDetails from './pages/student/FoodDetails';
import Cart from './pages/student/Cart';
import Checkout from './pages/student/Checkout';
import PaymentStatus from './pages/student/PaymentStatus';
import OrderTracking from './pages/student/OrderTracking';
import OrderHistory from './pages/student/OrderHistory';
import Favorites from './pages/student/Favorites';
import Profile from './pages/student/Profile';
import StudentNotifications from './pages/student/Notifications';

// Vendor Pages
import VendorDashboard from './pages/vendor/Dashboard';
import VendorOrders from './pages/vendor/Orders';
import ManageMenu from './pages/vendor/ManageMenu';
import AddFood from './pages/vendor/AddFood';
import EditFood from './pages/vendor/EditFood';
import Revenue from './pages/vendor/Revenue';
import Feedback from './pages/vendor/Feedback';
import VendorNotifications from './pages/vendor/Notifications';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import Students from './pages/admin/Students';
import Vendors from './pages/admin/Vendors';
import Categories from './pages/admin/Categories';
import Foods from './pages/admin/Foods';
import AdminOrders from './pages/admin/Orders';
import AdminRevenue from './pages/admin/AdminRevenue';
import Reports from './pages/admin/Reports';
import Announcements from './pages/admin/Announcements';
import ActivityLogs from './pages/admin/ActivityLogs';
import Settings from './pages/admin/Settings';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <CartProvider>
              <NotificationProvider>
                <BrowserRouter>
                  <Toaster
                    position="top-right"
                    toastOptions={{
                      duration: 4000,
                      style: {
                        borderRadius: '16px',
                        background: '#FFF8F2',
                        color: '#2B2927',
                        border: '1px solid #F0DDD3',
                        boxShadow: '0 8px 24px rgba(43, 41, 39, 0.12)',
                      },
                    }}
                  />
                  <Routes>
                    {/* Public Landing & Auth Routes */}
                    <Route path="/" element={<Landing />} />
                    <Route path="/student/login" element={<StudentLogin />} />
                    <Route path="/student/register" element={<StudentRegister />} />
                    <Route path="/vendor/login" element={<VendorLogin />} />
                    <Route path="/vendor/register" element={<VendorRegister />} />
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />

                    {/* Student Protected Routes */}
                    <Route
                      path="/student"
                      element={
                        <ProtectedRoute allowedRoles={['student']}>
                          <StudentLayout />
                        </ProtectedRoute>
                      }
                    >
                      <Route index element={<StudentDashboard />} />
                      <Route path="menu" element={<Menu />} />
                      <Route path="menu/:id" element={<FoodDetails />} />
                      <Route path="cart" element={<Cart />} />
                      <Route path="checkout" element={<Checkout />} />
                      <Route path="payment-status" element={<PaymentStatus />} />
                      <Route path="orders/:id" element={<OrderTracking />} />
                      <Route path="orders" element={<OrderHistory />} />
                      <Route path="favorites" element={<Favorites />} />
                      <Route path="profile" element={<Profile />} />
                      <Route path="notifications" element={<StudentNotifications />} />
                    </Route>

                    {/* Vendor Protected Routes */}
                    <Route
                      path="/vendor"
                      element={
                        <ProtectedRoute allowedRoles={['vendor']}>
                          <VendorLayout />
                        </ProtectedRoute>
                      }
                    >
                      <Route index element={<VendorDashboard />} />
                      <Route path="orders" element={<VendorOrders />} />
                      <Route path="menu" element={<ManageMenu />} />
                      <Route path="add-food" element={<AddFood />} />
                      <Route path="edit-food/:id" element={<EditFood />} />
                      <Route path="revenue" element={<Revenue />} />
                      <Route path="feedback" element={<Feedback />} />
                      <Route path="notifications" element={<VendorNotifications />} />
                    </Route>

                    {/* Admin Protected Routes */}
                    <Route
                      path="/admin"
                      element={
                        <ProtectedRoute allowedRoles={['admin']}>
                          <AdminLayout />
                        </ProtectedRoute>
                      }
                    >
                      <Route index element={<AdminDashboard />} />
                      <Route path="students" element={<Students />} />
                      <Route path="vendors" element={<Vendors />} />
                      <Route path="categories" element={<Categories />} />
                      <Route path="foods" element={<Foods />} />
                      <Route path="orders" element={<AdminOrders />} />
                      <Route path="revenue" element={<AdminRevenue />} />
                      <Route path="reports" element={<Reports />} />
                      <Route path="announcements" element={<Announcements />} />
                      <Route path="activity-logs" element={<ActivityLogs />} />
                      <Route path="settings" element={<Settings />} />
                    </Route>

                    {/* Catch All 404 */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </NotificationProvider>
            </CartProvider>
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
