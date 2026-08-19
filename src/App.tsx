import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { LocationProvider } from './context/LocationContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LocationPermissionBanner } from './components/LocationPermissionBanner';
import { ProfileSetupModal } from './components/profile/ProfileSetupModal';

import { HomePage } from './pages/HomePage';
import { AreaScanPage } from './pages/AreaScanPage';
import { AuthPage } from './pages/AuthPage';
import { CreateRequestPage } from './pages/CreateRequestPage';
import { RequestDetailsPage } from './pages/RequestDetailsPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { ChatsPage } from './pages/ChatsPage';
import { CirclesPage } from './pages/CirclesPage';
import { CircleDetailsPage } from './pages/CircleDetailsPage';

import { ErrorBoundary } from './components/ErrorBoundary';

const ProfileSetupChecker: React.FC = () => {
  const { user } = useAuth();
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    if (user && user.profileCompleted === false) {
      setShowSetup(true);
    } else {
      setShowSetup(false);
    }
  }, [user]);

  return (
    <ProfileSetupModal
      isOpen={showSetup}
      onClose={() => setShowSetup(false)}
    />
  );
};

export function App() {
  return (
    <BrowserRouter>
      <LocationProvider>
        <AuthProvider>
          <SocketProvider>
            <ErrorBoundary>
              <div className="min-h-screen bg-[#FBFAF7] text-[#2F2F2F] flex flex-col font-sans selection:bg-[#355E3B] selection:text-white relative overflow-x-hidden">
                <LocationPermissionBanner />
                <Navbar />
                <ProfileSetupChecker />
                <main className="flex-1 relative z-10 pb-20">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/area-scan" element={<AreaScanPage />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/create-request" element={<CreateRequestPage />} />
                    <Route path="/request/:id" element={<RequestDetailsPage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/leaderboard" element={<LeaderboardPage />} />
                    <Route path="/chats" element={<ChatsPage />} />
                    <Route path="/circles" element={<CirclesPage />} />
                    <Route path="/circles/:id" element={<CircleDetailsPage />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            </ErrorBoundary>
          </SocketProvider>
        </AuthProvider>
      </LocationProvider>
    </BrowserRouter>
  );
}

export default App;
