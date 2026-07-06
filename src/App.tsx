import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import SubjectsPage from "./pages/SubjectsPage";
import LearningPage from "./pages/LearningPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import ProfilePage from "./pages/ProfilePage";
import OnboardingPage from "./pages/OnboardingPage";
import AuthPage from "./pages/AuthPage";
import GameStorePage from "./pages/GameStorePage";
import PlayGamePage from "./pages/PlayGamePage";
import ChessPage from "./pages/ChessPage";
import SettingsPage from "./pages/SettingsPage";
import AchievementsPage from "./pages/AchievementsPage";
import AIOpponentPage from "./pages/AIOpponentPage";
import MultiplayerPage from "./pages/MultiplayerPage";
import CodeHomePage from "./pages/CodeHomePage";
import CodeLevelPage from "./pages/CodeLevelPage";
import CodeLessonPage from "./pages/CodeLessonPage";
import NotFound from "./pages/NotFound";
import OAuthConsentPage from "./pages/OAuthConsentPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <ThemeProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/subjects" element={<SubjectsPage />} />
              <Route path="/learn/:subjectId" element={<LearningPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/store" element={<GameStorePage />} />
              <Route path="/play/:id" element={<PlayGamePage />} />
              <Route path="/chess" element={<ChessPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/achievements" element={<AchievementsPage />} />
              <Route path="/ai-opponent" element={<AIOpponentPage />} />
              <Route path="/multiplayer" element={<MultiplayerPage />} />
              <Route path="/code" element={<CodeHomePage />} />
              <Route path="/code/:lang" element={<CodeLevelPage />} />
              <Route path="/code/:lang/:level" element={<CodeLessonPage />} />
              <Route path="/.lovable/oauth/consent" element={<OAuthConsentPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
