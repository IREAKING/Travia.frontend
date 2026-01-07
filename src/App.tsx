import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Public Pages
import { HomePage } from './pages/public/Home';
import { ToursPage } from './pages/public/Tours';
import { TourDetailPage } from './pages/public/TourDetail';
import { DestinationsPage } from './pages/public/Destinations';
import { CategoriesPage } from './pages/public/Categories';
import { BlogPage } from './pages/public/Blog';
import { AboutPage } from './pages/public/About';
import { ContactPage } from './pages/public/Contact';
import { FAQPage } from './pages/public/FAQ';
import { ChatbotPage } from './pages/public/ChatbotPage';
import { RecommendedToursPage } from './pages/public/RecommendedToursPage';
import { TermsPage } from './pages/public/Terms';
import { PrivacyPage } from './pages/public/Privacy';
import { RefundPage } from './pages/public/Refund';
import { PaymentPage } from './pages/public/Payment';
import { PaymentSuccessPage } from './pages/public/PaymentSuccess';
import { PaymentFailurePage } from './pages/public/PaymentFailure';
import { VNPayReturnPage } from './pages/public/VNPayReturn';
import { ReviewsPage } from './pages/public/Reviews';
import { BookingPage } from './pages/public/Booking';

// Auth Pages
import { UserLoginPage } from './pages/auth/UserLogin';
import { AdminLoginPage } from './pages/auth/AdminLogin';
import { SupplierLoginPage } from './pages/auth/SupplierLogin';
import { RegisterPage } from './pages/auth/Register';
import { RegisterPartnerPage } from './pages/auth/RegisterPartner';

// Dashboard Pages
import { UserDashboard } from './pages/user/Dashboard';
import { AdminDashboard } from './pages/admin/Dashboard';
import { SupplierDashboard } from './pages/supplier/Dashboard';

// Supplier Pages
import { CreateTourPage } from './pages/supplier/CreateTour';
import { ManageToursPage } from './pages/supplier/ManageTours';
import { EditTourPage } from './pages/supplier/EditTour';
import { SupplierBookingsPage } from './pages/supplier/Bookings';
import { SupplierReviewsPage } from './pages/supplier/Reviews';
import { SupplierRevenuePage } from './pages/supplier/Revenue';
import { SupplierProfilePage } from './pages/supplier/Profile';
import { SupplierSettingsPage } from './pages/supplier/Settings';

// Admin Pages
import { SupplierManagement } from './pages/admin/SupplierManagement';
import { UserManagementPage } from './pages/admin/UserManagement';
import { AnalyticsPage as AdminAnalyticsPage } from './pages/admin/Analytics';
import { TourManagementPage } from './pages/admin/TourManagement';
import { BookingManagementPage } from './pages/admin/BookingManagement';
import { PaymentManagementPage } from './pages/admin/PaymentManagement';
import { ContactManagementPage } from './pages/admin/ContactManagement';
import { AdminSettingsPage } from './pages/admin/Settings';

// User Pages
import { ProfilePage } from './pages/user/Profile';
import { MyBookingsPage } from './pages/user/MyBookings';
import { MyFavoritesPage } from './pages/user/MyFavorites';
import { SettingsPage } from './pages/user/Settings';
import { BookingDetailsPage } from './pages/user/BookingDetails';
import { NotificationsPage } from './pages/user/Notifications';
import { MyContactsPage } from './pages/user/MyContacts';

// Error Pages
const NotFoundPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">Trang không tồn tại</p>
      <a href="/" className="btn-primary">
        Về trang chủ
      </a>
    </div>
  </div>
);

const UnauthorizedPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-red-600 mb-4">403</h1>
      <p className="text-xl text-gray-600 mb-8">Bạn không có quyền truy cập trang này</p>
      <a href="/" className="btn-primary">
        Về trang chủ
      </a>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        {/* Debug component - chỉ hiển thị trong development */}
        
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/tours" element={<ToursPage />} />
          <Route path="/tours/:id" element={<TourDetailPage />} />
          <Route path="/destinations" element={<DestinationsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/chatbot" element={<ChatbotPage />} />
          <Route path="/recommended-tours" element={<RecommendedToursPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/refund" element={<RefundPage />} />
          <Route path="/payment/:id" element={<PaymentPage />} />
          <Route path="/payment/success" element={<PaymentSuccessPage />} />
          <Route path="/payment/failure" element={<PaymentFailurePage />} />
          <Route path="/payment/vnpay/return" element={<VNPayReturnPage />} />
          <Route path="/tours/:id/reviews" element={<ReviewsPage />} />
          <Route path="/booking/new/:id" element={<BookingPage />} />

            {/* Auth Routes */}
            <Route path="/login" element={<UserLoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/supplier/login" element={<SupplierLoginPage />} />
            <Route path="/supplier/register" element={<RegisterPartnerPage />} />

          {/* Protected Routes - User/Customer */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['khach_hang']}>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['khach_hang', 'quan_tri', 'nha_cung_cap']}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute allowedRoles={['khach_hang']}>
                <MyBookingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-favorites"
            element={
              <ProtectedRoute allowedRoles={['khach_hang']}>
                <MyFavoritesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute allowedRoles={['khach_hang', 'quan_tri', 'nha_cung_cap']}>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking/:id"
            element={
              <ProtectedRoute allowedRoles={['khach_hang']}>
                <BookingDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute allowedRoles={['khach_hang']}>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-contacts"
            element={
              <ProtectedRoute allowedRoles={['khach_hang']}>
                <MyContactsPage />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Admin */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['quan_tri']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/suppliers"
            element={
              <ProtectedRoute allowedRoles={['quan_tri']}>
                <SupplierManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['quan_tri']}>
                <UserManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute allowedRoles={['quan_tri']}>
                <AdminAnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute allowedRoles={['quan_tri']}>
                <AdminAnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tours"
            element={
              <ProtectedRoute allowedRoles={['quan_tri']}>
                <TourManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <ProtectedRoute allowedRoles={['quan_tri']}>
                <BookingManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/payments"
            element={
              <ProtectedRoute allowedRoles={['quan_tri']}>
                <PaymentManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/contacts"
            element={
              <ProtectedRoute allowedRoles={['quan_tri']}>
                <ContactManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute allowedRoles={['quan_tri']}>
                <AdminSettingsPage />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Supplier */}
          <Route
            path="/supplier/dashboard"
            element={
              <ProtectedRoute allowedRoles={['nha_cung_cap']}>
                <SupplierDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supplier/create-tour"
            element={
              <ProtectedRoute allowedRoles={['nha_cung_cap']}>
                <CreateTourPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supplier/tours/create"
            element={
              <ProtectedRoute allowedRoles={['nha_cung_cap']}>
                <CreateTourPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supplier/manage-tours"
            element={
              <ProtectedRoute allowedRoles={['nha_cung_cap']}>
                <ManageToursPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supplier/tours"
            element={
              <ProtectedRoute allowedRoles={['nha_cung_cap']}>
                <ManageToursPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supplier/tours/edit/:id"
            element={
              <ProtectedRoute allowedRoles={['nha_cung_cap']}>
                <EditTourPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supplier/edit-tour/:id"
            element={
              <ProtectedRoute allowedRoles={['nha_cung_cap']}>
                <EditTourPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supplier/bookings"
            element={
              <ProtectedRoute allowedRoles={['nha_cung_cap']}>
                <SupplierBookingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supplier/reviews"
            element={
              <ProtectedRoute allowedRoles={['nha_cung_cap']}>
                <SupplierReviewsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supplier/revenue"
            element={
              <ProtectedRoute allowedRoles={['nha_cung_cap']}>
                <SupplierRevenuePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supplier/profile"
            element={
              <ProtectedRoute allowedRoles={['nha_cung_cap']}>
                <SupplierProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supplier/settings"
            element={
              <ProtectedRoute allowedRoles={['nha_cung_cap']}>
                <SupplierSettingsPage />
              </ProtectedRoute>
            }
          />

          {/* Error Routes */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
