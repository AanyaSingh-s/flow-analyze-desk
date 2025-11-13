import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ShieldPlus, Loader2 } from "lucide-react";
import Iridescence from "@/components/Iridescence";

const Signup = () => {
  const navigate = useNavigate();
  const { signup, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!email || !password || !confirmPassword) {
      setError("Fill in all fields to continue.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setSubmitting(true);
      await signup(email, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error(err);
      setError("Unable to create account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="fixed inset-0 -z-10 opacity-80">
        <Iridescence color={[0.2, 0.6, 0.9]} speed={0.35} amplitude={0.2} />
      </div>

      <div className="mx-auto w-full max-w-md">
        <Card className="backdrop-blur bg-background/80 border-border/60 shadow-xl">
          <CardHeader className="space-y-2 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <ShieldPlus className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-semibold">Create your account</CardTitle>
            <p className="text-sm text-muted-foreground">
              Build dashboards, manage uploads, and explore past CSV histories.
            </p>
          </CardHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <CardContent className="space-y-4">
              <div className="space-y-2 text-left">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  placeholder="name@example.com"
                  required
                />
              </div>
              <div className="space-y-2 text-left">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="space-y-2 text-left">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  required
                />
              </div>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={submitting || loading}>
                {(submitting || loading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign up
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="font-medium text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Signup;