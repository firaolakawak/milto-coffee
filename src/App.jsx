import React, { Suspense, useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ProtectedRoute from '@/components/ProtectedRoute';
import { CartProvider } from '@/lib/CartContext';
import AppLayout from '@/components/layout/AppLayout';
import AdminLayout from '@/components/admin/AdminLayout';
import PhoneRegistrationModal from '@/components/PhoneRegistrationModal';

// Lazy load all page components
const Login = React.lazy(() => import('@/pages/Login'));
const Register = React.lazy(() => import('@/pages/Register'));
const ForgotPassword = React.lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword = React.lazy(() => import('@/pages/ResetPassword'));
const Home = React.lazy(() => import('@/pages/Home'));
const Menu = React.lazy(() => import('@/pages/Menu'));
const Cart = React.lazy(() => import('@/pages/Cart'));
const Orders = React.lazy(() => import('@/pages/Orders'));
const OrderTracking = React.lazy(() => import('@/pages/OrderTracking'));
const Origins = React.lazy(() => import('@/pages/Origins'));
const Stores = React.lazy(() => import('@/pages/Stores'));
const Rewards = React.lazy(() => import('@/pages/Rewards'));
const Events = React.lazy(() => import('@/pages/Events'));
const Profile = React.lazy(() => import('@/pages/Profile'));
const Dashboard = React.lazy(() => import('@/pages/admin/Dashboard'));
const BranchesAdmin = React.lazy(() => import('@/pages/admin/BranchesAdmin'));
const ProductsAdmin = React.lazy(() => import('@/pages/admin/ProductsAdmin'));
const OrdersAdmin = React.lazy(() => import('@/pages/admin/OrdersAdmin'));
const LoyaltyAdmin = React.lazy(() => import('@/pages/admin/LoyaltyAdmin'));
const EventsAdmin = React.lazy(() => import('@/pages/admin/EventsAdmin'));
const PromotionsAdmin = React.lazy(() => import('@/pages/admin/PromotionsAdmin'));
const OriginsAdmin = React.lazy(() => import('@/pages/admin/OriginsAdmin'));
const StockInventory = React.lazy(() => import('@/pages/admin/StockInventory'));
const PushNotificationsAdmin = React.lazy(() => import('@/pages/admin/PushNotificationsAdmin'));
const About = React.lazy(() => import('@/pages/About'));
const Contact = React.lazy(() => import('@/pages/Contact'));

const PageLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-background z-40">
    <div className="w-8 h-8 border-4 border-muted border-t-secondary rounded-full animate-spin"></div>
  </div>
);

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin, user } = useAuth();
  const location = useLocation();
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneCheckDone, setPhoneCheckDone] = useState(false);

  useEffect(() => {
    if (user && !phoneCheckDone) {
      if (!user.phone) {
        setShowPhoneModal(true);
      }
      setPhoneCheckDone(true);
    }
  }, [user, phoneCheckDone]);

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-muted border-t-secondary rounded-full animate-spin"></div>
          <span className="text-sm text-muted-foreground font-medium">Loading Milto Coffee...</span>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <CartProvider>
      <PhoneRegistrationModal
        open={showPhoneModal}
        onComplete={() => setShowPhoneModal(false)}
      />
      <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -24 }}
        transition={{ duration: 0.18, ease: 'easeInOut' }}
        style={{ width: '100%' }}
      >
      <Routes location={location}>
        <Route path="/login" element={<Suspense fallback={<PageLoader />}><Login /></Suspense>} />
        <Route path="/register" element={<Suspense fallback={<PageLoader />}><Register /></Suspense>} />
        <Route path="/forgot-password" element={<Suspense fallback={<PageLoader />}><ForgotPassword /></Suspense>} />
        <Route path="/reset-password" element={<Suspense fallback={<PageLoader />}><ResetPassword /></Suspense>} />

        {/* Public pages — no login required */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<Suspense fallback={<PageLoader />}><Home /></Suspense>} />
          <Route path="/menu" element={<Suspense fallback={<PageLoader />}><Menu /></Suspense>} />
          <Route path="/origins" element={<Suspense fallback={<PageLoader />}><Origins /></Suspense>} />
          <Route path="/stores" element={<Suspense fallback={<PageLoader />}><Stores /></Suspense>} />
          <Route path="/events" element={<Suspense fallback={<PageLoader />}><Events /></Suspense>} />
          <Route path="/about" element={<Suspense fallback={<PageLoader />}><About /></Suspense>} />
          <Route path="/contact" element={<Suspense fallback={<PageLoader />}><Contact /></Suspense>} />
        </Route>

        {/* Protected pages — login required */}
        <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
          <Route element={<AppLayout />}>
            <Route path="/cart" element={<Suspense fallback={<PageLoader />}><Cart /></Suspense>} />
            <Route path="/orders" element={<Suspense fallback={<PageLoader />}><Orders /></Suspense>} />
            <Route path="/orders/track/:orderId" element={<Suspense fallback={<PageLoader />}><OrderTracking /></Suspense>} />
            <Route path="/rewards" element={<Suspense fallback={<PageLoader />}><Rewards /></Suspense>} />
            <Route path="/profile" element={<Suspense fallback={<PageLoader />}><Profile /></Suspense>} />
          </Route>

          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Suspense fallback={<PageLoader />}><Dashboard /></Suspense>} />
            <Route path="/admin/branches" element={<Suspense fallback={<PageLoader />}><BranchesAdmin /></Suspense>} />
            <Route path="/admin/products" element={<Suspense fallback={<PageLoader />}><ProductsAdmin /></Suspense>} />
            <Route path="/admin/orders" element={<Suspense fallback={<PageLoader />}><OrdersAdmin /></Suspense>} />
            <Route path="/admin/loyalty" element={<Suspense fallback={<PageLoader />}><LoyaltyAdmin /></Suspense>} />
            <Route path="/admin/events" element={<Suspense fallback={<PageLoader />}><EventsAdmin /></Suspense>} />
            <Route path="/admin/promotions" element={<Suspense fallback={<PageLoader />}><PromotionsAdmin /></Suspense>} />
            <Route path="/admin/origins" element={<Suspense fallback={<PageLoader />}><OriginsAdmin /></Suspense>} />
            <Route path="/admin/stock" element={<Suspense fallback={<PageLoader />}><StockInventory /></Suspense>} />
            <Route path="/admin/push" element={<Suspense fallback={<PageLoader />}><PushNotificationsAdmin /></Suspense>} />
          </Route>
        </Route>

        <Route path="*" element={<PageNotFound />} />
      </Routes>
      </motion.div>
      </AnimatePresence>
    </CartProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
        <SonnerToaster position="top-center" richColors />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App