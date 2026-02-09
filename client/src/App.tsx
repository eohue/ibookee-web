import { lazy, Suspense } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import ScrollToTop from "@/components/layout/ScrollToTop";

// Route-level code splitting: each page is loaded on-demand
const Home = lazy(() => import("@/pages/Home"));
const About = lazy(() => import("@/pages/About"));
const Business = lazy(() => import("@/pages/Business"));
const Space = lazy(() => import("@/pages/Space"));
const SpaceDetail = lazy(() => import("@/pages/SpaceDetail"));
const Community = lazy(() => import("@/pages/Community"));
const EventDetail = lazy(() => import("@/pages/EventDetail"));
const Insight = lazy(() => import("@/pages/Insight"));
const InsightDetail = lazy(() => import("@/pages/InsightDetail"));
const Contact = lazy(() => import("@/pages/Contact"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const MyPage = lazy(() => import("@/pages/MyPage"));
const ResidentReporterGuide = lazy(() => import("@/pages/ResidentReporterGuide"));
const HousingRecruitmentPage = lazy(() => import("@/pages/community/HousingRecruitmentPage"));
const SocialStreamPage = lazy(() => import("@/pages/community/SocialStreamPage"));
const ResidentReporterPage = lazy(() => import("@/pages/community/ResidentReporterPage"));
const ResidentReporterDetail = lazy(() => import("@/pages/community/ResidentReporterDetail"));
const SupportProgramsPage = lazy(() => import("@/pages/community/SupportProgramsPage"));
const EventsPage = lazy(() => import("@/pages/community/EventsPage"));
const SearchPage = lazy(() => import("@/pages/Apply/SearchPage"));
const LiveDetail = lazy(() => import("@/pages/Live/LiveDetail"));
const LiveLanding = lazy(() => import("@/pages/Live/LiveLanding"));
const PrivacyPolicy = lazy(() => import("@/pages/legal/PrivacyPolicy"));
const TermsOfService = lazy(() => import("@/pages/legal/TermsOfService"));
const AuthPage = lazy(() => import("@/pages/auth/AuthPage"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Minimal loading spinner for page transitions
function PageLoader() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
      <div style={{
        width: 36, height: 36,
        border: "3px solid #e5e7eb",
        borderTopColor: "#6366f1",
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
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
    </Suspense>
  );
}

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
