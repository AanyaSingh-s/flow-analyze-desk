import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import NotFound from "./pages/NotFound";
import Iridescence from "./components/Iridescence";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <SidebarProvider>
                    <div className="min-h-screen flex w-full relative">
                      <div className="fixed inset-0 z-0">
                        <Iridescence color={[0.4, 0.7, 0.9]} speed={0.5} amplitude={0.2} />
                      </div>
                      <AppSidebar />
                      <main className="flex-1 relative z-10">
                        <div className="sticky top-0 z-20 bg-background/60 backdrop-blur-lg border-b border-border/50 px-4 py-2">
                          <SidebarTrigger />
                        </div>
                        <Dashboard />
                      </main>
                    </div>
                  </SidebarProvider>
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <SidebarProvider>
                    <div className="min-h-screen flex w-full relative">
                      <div className="fixed inset-0 z-0">
                        <Iridescence color={[0.4, 0.7, 0.9]} speed={0.5} amplitude={0.2} />
                      </div>
                      <AppSidebar />
                      <main className="flex-1 relative z-10">
                        <div className="sticky top-0 z-20 bg-background/60 backdrop-blur-lg border-b border-border/50 px-4 py-2">
                          <SidebarTrigger />
                        </div>
                        <History />
                      </main>
                    </div>
                  </SidebarProvider>
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
