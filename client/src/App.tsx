import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Business from "@/pages/Business";
import Space from "@/pages/Space";
import SpaceDetail from "@/pages/SpaceDetail";
import Community from "@/pages/Community";
import EventDetail from "@/pages/EventDetail";
import Insight from "@/pages/Insight";
import InsightDetail from "@/pages/InsightDetail";
import Contact from "@/pages/Contact";
import Dashboard from "@/pages/Dashboard";
import MyPage from "@/pages/MyPage";
import ResidentReporterGuide from "@/pages/ResidentReporterGuide";
import HousingRecruitmentPage from "@/pages/community/HousingRecruitmentPage";
import SocialStreamPage from "@/pages/community/SocialStreamPage";
import ResidentReporterPage from "@/pages/community/ResidentReporterPage";
import ResidentReporterDetail from "@/pages/community/ResidentReporterDetail";
import SupportProgramsPage from "@/pages/community/SupportProgramsPage";
import EventsPage from "@/pages/community/EventsPage";
import SearchPage from "@/pages/Apply/SearchPage";
import LiveDetail from "@/pages/Live/LiveDetail";
import LiveLanding from "@/pages/Live/LiveLanding";
import PrivacyPolicy from "@/pages/legal/PrivacyPolicy";
import TermsOfService from "@/pages/legal/TermsOfService";

import AuthPage from "@/pages/auth/AuthPage";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/business" component={Business} />
      <Route path="/space" component={Space} />
      <Route path="/space/:id" component={SpaceDetail} />
      <Route path="/story" component={Community} />
      <Route path="/story/event/:id" component={EventDetail} />
      <Route path="/insight" component={Insight} />
      <Route path="/insight/:id" component={InsightDetail} />
      <Route path="/story/recruitment" component={HousingRecruitmentPage} />
      <Route path="/story/social" component={SocialStreamPage} />
      <Route path="/story/reporter" component={ResidentReporterPage} />
      <Route path="/story/reporter/:id" component={ResidentReporterDetail} />
      <Route path="/story/programs" component={SupportProgramsPage} />
      <Route path="/story/events" component={EventsPage} />
      <Route path="/resident-reporter-guide" component={ResidentReporterGuide} />
      <Route path="/apply" component={SearchPage} />
      <Route path="/live" component={LiveLanding} />
      <Route path="/live/:id" component={LiveDetail} />
      <Route path="/contact" component={Contact} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/terms" component={TermsOfService} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/mypage" component={MyPage} />
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

import ScrollToTop from "@/components/layout/ScrollToTop";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AuthProvider>
          <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme" attribute="class">
            <Router />
            <ScrollToTop />
          </ThemeProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
