import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { WalletProvider } from "./context/WalletContext";
import { AudioProvider } from "./context/AudioContext";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { AudioPlayerDock } from "./components/AudioPlayerDock";
import { AppShell } from "./components/AppShell";
import { GlobalWalletModals } from "./components/GlobalWalletModals";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Public Pages
import { HomePage } from "./pages/HomePage";
import { TracksPage } from "./pages/TracksPage";
import { TrackDetailPage } from "./pages/TrackDetailPage";
import { HowItWorksPage } from "./pages/HowItWorksPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";

// Listener Interface Pages
import { ListenerHomePage } from "./pages/listener/ListenerHomePage";
import { ListenerWalletPage } from "./pages/listener/ListenerWalletPage";
import { ListenerEarningsPage } from "./pages/listener/ListenerEarningsPage";

// Creator Interface Pages
import { CreatorDashboardPage } from "./pages/creator/CreatorDashboardPage";
import { CreatorTracksPage } from "./pages/creator/CreatorTracksPage";
import { ManageTrackSplitPage } from "./pages/creator/ManageTrackSplitPage";
import { CreatorPayoutsPage } from "./pages/creator/CreatorPayoutsPage";
import { AdminPage } from "./pages/AdminPage";
import { SettingsPage } from "./pages/SettingsPage";
import { DevAccountsDrawer } from "./components/DevAccountsDrawer";

// Public Layout Wrapper
function PublicLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-[#14120F] text-[#F6F1E7] selection:bg-[#C9A24B] selection:text-[#14120F]">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-4">
        {children}
      </main>
      <DevAccountsDrawer />
      <AudioPlayerDock />
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <WalletProvider>
      <AudioProvider>
        <ErrorBoundary>
          <Router>
          <Routes>
            {/* PUBLIC PAGES (Browseable without wallet connection) */}
            <Route
              path="/"
              element={
                <PublicLayout>
                  <HomePage />
                </PublicLayout>
              }
            />
            <Route
              path="/tracks"
              element={
                <PublicLayout>
                  <TracksPage />
                </PublicLayout>
              }
            />
            <Route
              path="/track/:id"
              element={
                <PublicLayout>
                  <TrackDetailPage />
                </PublicLayout>
              }
            />
            <Route
              path="/tracks/:trackId"
              element={
                <PublicLayout>
                  <TrackDetailPage />
                </PublicLayout>
              }
            />
            <Route
              path="/how-it-works"
              element={
                <PublicLayout>
                  <HowItWorksPage />
                </PublicLayout>
              }
            />
            <Route
              path="/analytics"
              element={
                <PublicLayout>
                  <AnalyticsPage />
                </PublicLayout>
              }
            />

            {/* APP SHELL (Role-Aware Navigation & Portals) */}
            <Route path="/app" element={<AppShell />}>
              {/* Index redirect to listen or dashboard */}
              <Route index element={<Navigate to="/app/listen" replace />} />

              {/* LISTENER INTERFACE (Fan View) */}
              <Route path="listen" element={<ListenerHomePage />} />
              <Route path="wallet" element={<ListenerWalletPage />} />
              <Route path="earnings" element={<ListenerEarningsPage />} />

              {/* CREATOR INTERFACE (Stakeholder View) */}
              <Route path="dashboard" element={<CreatorDashboardPage />} />
              <Route path="my-tracks" element={<CreatorTracksPage />} />
              <Route path="my-tracks/:trackId/manage" element={<ManageTrackSplitPage />} />
              <Route path="register-track" element={<AdminPage />} />
              <Route path="payouts" element={<CreatorPayoutsPage />} />

              {/* SHARED SETTINGS */}
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* Global Modals */}
          <GlobalWalletModals />

          {/* Studio Ledger Toaster Notification Container */}
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 5000,
              style: {
                background: "#1A1814",
                color: "#F6F1E7",
                border: "1px solid rgba(138, 114, 56, 0.35)",
                borderRadius: "2px",
                padding: "0.85rem 1.25rem",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.7)",
                fontSize: "0.8125rem",
                fontFamily: '"IBM Plex Mono", monospace',
              },
              success: {
                iconTheme: {
                  primary: "#C9A24B",
                  secondary: "#14120F",
                },
              },
              error: {
                iconTheme: {
                  primary: "#8C8578",
                  secondary: "#14120F",
                },
              },
            }}
          />
        </Router>
      </ErrorBoundary>
    </AudioProvider>
  </WalletProvider>
);
}
