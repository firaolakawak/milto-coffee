import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ProtectedRoute from '@/components/ProtectedRoute';
import { CartProvider } from '@/lib/CartContext';

import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

import AppLayout from '@/components/layout/AppLayout';
import AdminLayout from '@/components/admin/AdminLayout';

import Home from '@/pages/Home';
import Menu from '@/pages/Menu';
import Cart from '@/pages/Cart';
import Orders from '@/pages/Orders';
import OrderTracking from '@/pages/OrderTracking';
import Origins from '@/pages/Origins';
import Stores from '@/pages/Stores';
import Rewards from '@/pages/Rewards';
import Events from '@/pages/Events';
import Profile from '@/pages/Profile';

import Dashboard from '@/pages/admin/Dashboard';
import BranchesAdmin from '@/pages/admin/BranchesAdmin';
import ProductsAdmin from '@/pages/admin/ProductsAdmin';
import OrdersAdmin from '@/pages/admin/OrdersAdmin';
import LoyaltyAdmin from '@/pages/admin/LoyaltyAdmin';
import EventsAdmin from '@/pages/admin/EventsAdmin';
import PromotionsAdmin from '@/pages/admin/PromotionsAdmin';
import OriginsAdmin from '@/pages/admin/OriginsAdmin';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

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
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/track/:orderId" element={<OrderTracking />} />
            <Route path="/origins" element={<Origins />} />
            <Route path="/stores" element={<Stores />} />
            <Route path="/rewards" element={<Rewards />} />
            <Route path="/events" element={<Events />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/branches" element={<BranchesAdmin />} />
            <Route path="/admin/products" element={<ProductsAdmin />} />
            <Route path="/admin/orders" element={<OrdersAdmin />} />
            <Route path="/admin/loyalty" element={<LoyaltyAdmin />} />
            <Route path="/admin/events" element={<EventsAdmin />} />
            <Route path="/admin/promotions" element={<PromotionsAdmin />} />
            <Route path="/admin/origins" element={<OriginsAdmin />} />
          </Route>
        </Route>

        <Route path="*" element={<PageNotFound />} />
      </Routes>
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