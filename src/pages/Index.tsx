import { FlaskConical, LineChart, ShieldCheck, UploadCloud } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Iridescence from "@/components/Iridescence";

const Index = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 opacity-60">
        <Iridescence color={[0.35, 0.65, 0.95]} speed={0.4} amplitude={0.15} />
      </div>

      <header className="relative z-10 border-b border-white/10 bg-black/30 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-6 py-8">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/20 p-3">
              <FlaskConical className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-widest text-white/70">ChemFlow Analytics</p>
              <h1 className="text-3xl font-semibold text-white">Chemical Equipment Intelligence</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="text-white/80 hover:text-white">
              <Link to="/login">Log In</Link>
            </Button>
            <Button asChild className="hover:bg-black/90">
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex max-w-6xl flex-col gap-20 px-6 py-16">
        <section className="grid gap-12 lg:grid-cols-[3fr_2fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-sm text-white/70">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
              Real-time CSV analytics for modern process labs
            </div>
            <h2 className="text-4xl font-bold leading-tight sm:text-5xl">
              Upload, analyze, and visualize chemical equipment datasets in seconds.
            </h2>
            <p className="max-w-xl text-lg text-white/70">
              Flow-rate trends, pressure deviations, temperature correlations, and more. Unlock insights from every CSV
              using interactive dashboards built for process engineers and researchers.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" asChild className="gap-2 hover:bg-white/10">
                <Link to="/signup">
                  <UploadCloud className="h-4 w-4" />
                  Create your workspace
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="bg-slate-300 border-white/30 text-black hover:bg-white/10">
                <Link to="/login">View dashboard</Link>
              </Button>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-white/20 p-6 shadow-2xl">
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-2xl bg-black/30 p-4">
                <div className="rounded-xl bg-primary/25 p-3">
                  <UploadCloud className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-wide text-white/60">1. Upload CSV</p>
                  <p className="text-base font-semibold text-white">Drag, drop, and validate your process data</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-black/30 p-4">
                <div className="rounded-xl bg-emerald-500/25 p-3">
                  <LineChart className="h-6 w-6 text-emerald-300" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-wide text-white/60">2. Visualize instantly</p>
                  <p className="text-base font-semibold text-white">Interactive charts and KPIs with zero config</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-black/30 p-4">
                <div className="rounded-xl bg-sky-500/25 p-3">
                  <ShieldCheck className="h-6 w-6 text-sky-300" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-wide text-white/60">3. Track safely</p>
                  <p className="text-base font-semibold text-white">
                    Secure login, history controls, and reproducible records
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-8 rounded-3xl border border-white/10 bg-black/40 p-10 backdrop-blur md:grid-cols-3">
          {[
            {
              icon: <LineChart className="h-8 w-8 text-emerald-300" />,
              title: "Dynamic dashboards",
              description: "Monitor flow, pressure, and temperature variations across all equipment at a glance.",
            },
            {
              icon: <UploadCloud className="h-8 w-8 text-sky-300" />,
              title: "History controls",
              description: "Review previous CSV uploads, pause historical tracking, and restore datasets instantly.",
            },
            {
              icon: <ShieldCheck className="h-8 w-8 text-purple-300" />,
              title: "Ready for teams",
              description: "Secure login and signup flow keeps your lab's data organized and accessible.",
            },
          ].map((feature) => (
            <div key={feature.title} className="space-y-3 rounded-2xl border border-white/5 bg-white/5 p-6">
              <div className="inline-flex rounded-full bg-black/40 p-3">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
              <p className="text-sm text-white/65">{feature.description}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/10 bg-black/40 py-6 text-center text-sm text-white/60 backdrop-blur">
        <p>© {new Date().getFullYear()} ChemFlow Analytics • Built with React, Chart.js, and django.</p>
      </footer>
    </div>
  );
};

export default Index;
