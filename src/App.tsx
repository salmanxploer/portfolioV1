import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import PageLoader from "@/components/PageLoader";
import GlobalCursor from "@/components/GlobalCursor";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import RequireAdminAuth from "@/components/RequireAdminAuth";
import { ADMIN_BASE_PATH, ADMIN_DASHBOARD_PATH } from "@/lib/adminRoute";

// Lazy load pages for better initial load performance
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const StudyHub = lazy(() => import("./pages/StudyHub"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});

const RouteScopedFloatingWhatsApp = () => {
  const location = useLocation();
  if (location.pathname !== "/") return null;
  return <FloatingWhatsApp />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <GlobalCursor />
      <BrowserRouter>
        <AnalyticsTracker />
        <RouteScopedFloatingWhatsApp />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/study" element={<StudyHub />} />
            <Route path={`/${ADMIN_BASE_PATH}`} element={<AdminLogin />} />
            <Route
              path={ADMIN_DASHBOARD_PATH}
              element={
                <RequireAdminAuth>
                  <AdminDashboard />
                </RequireAdminAuth>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
