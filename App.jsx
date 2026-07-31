import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
// Add page imports here
import Home from './pages/Home';
import ThankYou from './pages/ThankYou';
import Tips from './pages/Tips';
import BehindTheScenes from './pages/BehindTheScenes';
import YouTube from './pages/YouTube';
import Sponsors from './pages/Sponsors';
import About from './pages/About';
import Shop from './pages/Shop';
import CatchBoard from './pages/CatchBoard';
import Leaderboard from './pages/Leaderboard';
import Community from './pages/Community';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import Login from './pages/Login';
import WilbanksLayout from './components/WilbanksLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminRoute from '@/components/AdminRoute';
import ErrorBoundary from '@/components/ErrorBoundary';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      {/* Add your page Route elements here */}
      <Route path="/login" element={<Login />} />
      <Route element={<WilbanksLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/Tips" element={<Tips />} />
        <Route path="/BehindTheScenes" element={<BehindTheScenes />} />
        <Route path="/YouTube" element={<YouTube />} />
        <Route path="/Sponsors" element={<Sponsors />} />
        <Route path="/About" element={<About />} />
        <Route path="/Shop" element={<Shop />} />
        <Route path="/CatchGallery" element={<Navigate to="/CatchBoard" replace />} />
        <Route path="/CatchBoard" element={<CatchBoard />} />
        <Route path="/Leaderboard" element={<Leaderboard />} />
        <Route path="/Community" element={<Community />} />
        <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
          <Route path="/Profile" element={<Profile />} />
        </Route>
      </Route>
      <Route path="/ThankYou" element={<ThankYou />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<Admin />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ErrorBoundary>
            <ScrollToTop />
            <AuthenticatedApp />
          </ErrorBoundary>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App