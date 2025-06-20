import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { createClient } from '@supabase/supabase-js';

// Pages
import HomePage from './pages/HomePage';
import ToolsPage from './pages/ToolsPage';
import ToolDetailPage from './pages/ToolDetailPage';
import HackathonsPage from './pages/HackathonsPage';
import ProjectsPage from './pages/ProjectsPage';
import RequestHelpPage from './pages/RequestHelpPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import CertificatesPage from './pages/CertificatesPage';
import CompetitionsPage from './pages/CompetitionsPage';
import CreateCompetitionPage from './pages/CreateCompetitionPage';
import CompetitionDetailPage from './pages/CompetitionDetailPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRequests from './pages/admin/AdminRequests';
import AdminUsers from './pages/admin/AdminUsers';
import AdminTools from './pages/admin/AdminTools';
import AdminWorkshops from './pages/admin/AdminWorkshops';
import AdminHackathons from './pages/admin/AdminHackathons';
import AdminProjects from './pages/admin/AdminProjects';
import AdminCompetitions from './pages/admin/AdminCompetitions';
import AdminCertificates from './pages/admin/AdminCertificates';

// Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import TermsModal from './components/legal/TermsModal';

// Context
import { AuthProvider } from './context/AuthContext';

// Hooks
import { useTermsAcceptance } from './hooks/useTermsAcceptance';

// Create Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

function AppContent() {
  const { hasAcceptedTerms, showTermsModal, acceptTerms, declineTerms } = useTermsAcceptance();

  // Don't render the app until we know the terms acceptance status
  if (hasAcceptedTerms === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <TermsModal
        isOpen={showTermsModal}
        onAccept={acceptTerms}
        onDecline={declineTerms}
      />
      
      {hasAcceptedTerms && (
        <div className="flex flex-col min-h-screen bg-gray-50">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/tools" element={<ToolsPage />} />
              <Route path="/tools/:id" element={<ToolDetailPage />} />
              <Route path="/hackathons" element={<HackathonsPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/certificates" element={<CertificatesPage />} />
              <Route path="/competitions" element={<CompetitionsPage />} />
              <Route path="/competitions/:id" element={<CompetitionDetailPage />} />
              <Route path="/request-help" element={<RequestHelpPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Protected routes */}
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/competitions/create" 
                element={
                  <ProtectedRoute>
                    <CreateCompetitionPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Admin routes */}
              <Route 
                path="/admin" 
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } 
              />
              <Route 
                path="/admin/requests" 
                element={
                  <AdminRoute>
                    <AdminRequests />
                  </AdminRoute>
                } 
              />
              <Route 
                path="/admin/users" 
                element={
                  <AdminRoute>
                    <AdminUsers />
                  </AdminRoute>
                } 
              />
              <Route 
                path="/admin/tools" 
                element={
                  <AdminRoute>
                    <AdminTools />
                  </AdminRoute>
                } 
              />
              <Route 
                path="/admin/workshops" 
                element={
                  <AdminRoute>
                    <AdminWorkshops />
                  </AdminRoute>
                } 
              />
              <Route 
                path="/admin/hackathons" 
                element={
                  <AdminRoute>
                    <AdminHackathons />
                  </AdminRoute>
                } 
              />
              <Route 
                path="/admin/projects" 
                element={
                  <AdminRoute>
                    <AdminProjects />
                  </AdminRoute>
                } 
              />
              <Route 
                path="/admin/competitions" 
                element={
                  <AdminRoute>
                    <AdminCompetitions />
                  </AdminRoute>
                } 
              />
              <Route 
                path="/admin/certificates" 
                element={
                  <AdminRoute>
                    <AdminCertificates />
                  </AdminRoute>
                } 
              />
            </Routes>
          </main>
          <Footer />
        </div>
      )}
      
      <Toaster position="top-right" />
    </>
  );
}

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;