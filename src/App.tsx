import { useState, useCallback, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import SplashScreen from "@/components/SplashScreen";
import { GlobalSwipeNavigation } from "@/components/GlobalSwipeNavigation";
import IOSInstallBanner from "@/components/IOSInstallBanner";
import CookieConsent from "@/components/CookieConsent";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import ProfileCreationPage from "./pages/ProfileCreationPage";
import PermissionsPage from "./pages/PermissionsPage";
import SwipePage from "./pages/SwipePage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import MessagesPage from "./pages/MessagesPage";
import EducationPage from "./pages/EducationPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import SuccessStoriesPage from "./pages/SuccessStoriesPage";
import ConnectionsPage from "./pages/ConnectionsPage";
import TrustSafetyPage from "./pages/TrustSafetyPage";
import SupportPage from "./pages/SupportPage";
import ContactPage from "./pages/ContactPage";
import NotFound from "./pages/NotFound";
import ArticleReaderPage from "./pages/ArticleReaderPage";
import CommunityPage from "./pages/CommunityPage";
import LikesPage from "./pages/LikesPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import CookiePolicyPage from "./pages/CookiePolicyPage";
import IntellectualPropertyPage from "./pages/IntellectualPropertyPage";
import AccessibilityPage from "./pages/AccessibilityPage";

// Admin
import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./pages/admin/AdminLayout";
import DashboardPage from "./pages/admin/DashboardPage";
import AdminMessagesPage from "./pages/admin/MessagesPage";
import AdminUsersPage from "./pages/admin/UsersPage";

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const handleSplashFinished = useCallback(() => setShowSplash(false), []);

  useEffect(() => {
    const applyTheme = () => {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
    };
    applyTheme();
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    mql.addEventListener('change', applyTheme);
    return () => mql.removeEventListener('change', applyTheme);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          {showSplash && <SplashScreen onFinished={handleSplashFinished} />}
          <BrowserRouter>
            <GlobalSwipeNavigation>
              <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/auth/callback" element={<AuthCallbackPage />} />
              <Route path="/education" element={<EducationPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/success-stories" element={<SuccessStoriesPage />} />
              <Route path="/trust-safety" element={<TrustSafetyPage />} />
              <Route path="/support" element={<SupportPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/articles/:slug" element={<ArticleReaderPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/terms-of-service" element={<TermsOfServicePage />} />
              <Route path="/cookie-policy" element={<CookiePolicyPage />} />
              <Route path="/intellectual-property" element={<IntellectualPropertyPage />} />
              <Route path="/accessibility" element={<AccessibilityPage />} />

              {/* Onboarding routes (auth required) */}
              <Route path="/create-profile" element={<ProtectedRoute><ProfileCreationPage /></ProtectedRoute>} />
              <Route path="/permissions" element={<ProtectedRoute><PermissionsPage /></ProtectedRoute>} />

              {/* App routes (auth required) */}
              <Route path="/swipe" element={<ProtectedRoute><SwipePage /></ProtectedRoute>} />
              <Route path="/likes" element={<ProtectedRoute><LikesPage /></ProtectedRoute>} />
              <Route path="/community" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
              <Route path="/connections" element={<ProtectedRoute><ConnectionsPage /></ProtectedRoute>} />

              {/* Admin lines */}
              <Route path="/admin" element={<AdminRoute />}>
                <Route element={<AdminLayout />}>
                  <Route index element={<DashboardPage />} />
                  <Route path="messages" element={<AdminMessagesPage />} />
                  <Route path="users" element={<AdminUsersPage />} />
                </Route>
              </Route>

              <Route path="*" element={<NotFound />} />
              </Routes>
            </GlobalSwipeNavigation>
          <IOSInstallBanner />
          <CookieConsent />
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;
