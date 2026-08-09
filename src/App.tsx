import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

import { HomePage } from './pages/HomePage';
import { AreaScanPage } from './pages/AreaScanPage';
import { AuthPage } from './pages/AuthPage';
import { CreateRequestPage } from './pages/CreateRequestPage';
import { RequestDetailsPage } from './pages/RequestDetailsPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { ChatsPage } from './pages/ChatsPage';

import { ErrorBoundary } from './components/ErrorBoundary';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <ErrorBoundary>
            <div className="min-h-screen bg-[#FBFAF7] text-[#2F2F2F] flex flex-col font-sans selection:bg-[#355E3B] selection:text-white relative overflow-x-hidden">
              <Navbar />
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
                </Routes>
              </main>
              <Footer />
            </div>
          </ErrorBoundary>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
