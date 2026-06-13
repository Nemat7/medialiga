import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/AuthContext";
import Layout from "@/components/layout/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import HomePage from "@/pages/HomePage";
import PlayersPage from "@/pages/PlayersPage";
import ClubsPage from "@/pages/ClubsPage";
import LeaderboardPage from "@/pages/LeaderboardPage";
import DashboardPage from "@/pages/DashboardPage";
import LoginPage from "@/pages/LoginPage";
import VerifyPage from "@/pages/VerifyPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import TeamBuilderPage from "@/pages/TeamBuilderPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Auth routes (no layout) */}
            <Route path="login" element={<LoginPage />} />
            <Route path="verify" element={<VerifyPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />

            {/* Main app routes */}
            <Route element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="players" element={<PlayersPage />} />
              <Route path="clubs" element={<ClubsPage />} />
              <Route path="leaderboard" element={<LeaderboardPage />} />
              <Route
                path="dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="team/create"
                element={
                  <ProtectedRoute>
                    <TeamBuilderPage />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
