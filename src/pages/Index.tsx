import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import Iridescence from "@/components/Iridescence";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <Iridescence color={[0.4, 0.7, 0.9]} speed={0.5} amplitude={0.2} />
      </div>

      {/* Header */}
      <header className="relative z-10 bg-background/60 backdrop-blur-lg border-b border-border/50 text-foreground shadow-lg">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <FlaskConical className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Chemical Equipment Analyzer</h1>
                <p className="text-primary-foreground/90 mt-1">
                  Upload, analyze, and visualize your equipment data
                </p>
              </div>
            </div>
            <Button onClick={() => navigate("/auth")} size="lg">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold">
              Analyze Your Chemical Equipment Data
            </h2>
            <p className="text-xl text-muted-foreground">
              Upload CSV files, visualize data with interactive charts, and track your equipment history
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="bg-background/60 backdrop-blur-lg border border-border/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">Easy Upload</h3>
              <p className="text-muted-foreground">
                Drag and drop CSV files with equipment data
              </p>
            </div>
            <div className="bg-background/60 backdrop-blur-lg border border-border/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">Visual Analytics</h3>
              <p className="text-muted-foreground">
                Interactive charts and statistics dashboards
              </p>
            </div>
            <div className="bg-background/60 backdrop-blur-lg border border-border/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">Track History</h3>
              <p className="text-muted-foreground">
                Save and review up to 5 recent datasets
              </p>
            </div>
          </div>

          <div className="pt-8">
            <Button onClick={() => navigate("/auth")} size="lg" className="px-8">
              Sign In to Get Started
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 bg-background/60 backdrop-blur-lg mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>Chemical Equipment Analyzer • Built with React & Chart.js</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
