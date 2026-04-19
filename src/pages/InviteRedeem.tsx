import { useEffect, useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HardHat, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function InviteRedeem() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user, loading, signIn, signUp } = useAuth();
  const { toast } = useToast();

  const [invite, setInvite] = useState<any>(null);
  const [job, setJob] = useState<any>(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [redeeming, setRedeeming] = useState(false);

  // Look up the invite
  useEffect(() => {
    const fetch = async () => {
      if (!token) return;
      const { data: inv } = await (supabase as any)
        .from("job_invites")
        .select("*")
        .eq("token", token)
        .maybeSingle();
      if (!inv) { setError("This invite link is invalid."); setChecking(false); return; }
      if (new Date(inv.expires_at) < new Date()) { setError("This invite link has expired."); setChecking(false); return; }
      setInvite(inv);
      const { data: j } = await supabase.from("jobs").select("case_no, title, address").eq("id", inv.job_id).maybeSingle();
      setJob(j);
      setChecking(false);
    };
    fetch();
  }, [token]);

  // After auth, redeem and continue onboarding
  useEffect(() => {
    if (!user || !invite || redeeming) return;
    const redeem = async () => {
      setRedeeming(true);
      const { data, error: rpcErr } = await (supabase as any).rpc("redeem_job_invite", { _token: token });
      if (rpcErr) {
        toast({ title: "Could not accept invite", description: rpcErr.message, variant: "destructive" });
        setError(rpcErr.message);
        setRedeeming(false);
        return;
      }
      navigate(`/onboarding/${data}`, { replace: true });
    };
    redeem();
  }, [user, invite, token, navigate, toast, redeeming]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "signin") {
        const { error: e1 } = await signIn(email, password);
        if (e1) throw e1;
      } else {
        const { error: e2 } = await signUp(email, password, firstName, lastName, "owner");
        if (e2) throw e2;
      }
    } catch (err: any) {
      toast({ title: "Authentication failed", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || checking) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading invite...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center space-y-3">
            <h1 className="text-lg font-semibold text-foreground">Invite Unavailable</h1>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" onClick={() => navigate("/login")}>Go to Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user && redeeming) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Attaching you to this job...</div>;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md border-border shadow-lg">
        <CardHeader className="text-center space-y-3 pb-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <HardHat className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Welcome to Manta Ray Energy</h1>
            <p className="text-sm text-muted-foreground mt-1">
              You've been invited to complete property details
              {job?.case_no ? <> for Case No. <span className="font-medium text-foreground">{job.case_no}</span></> : ""}.
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleAuth} className="space-y-3">
            {mode === "signup" && (
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                <Input placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </div>
            )}
            <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Loading..." : mode === "signup" ? "Create Account & Continue" : "Sign In & Continue"}
            </Button>
          </form>
          <div className="text-center">
            <button
              type="button"
              className="text-sm text-primary hover:underline"
              onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
            >
              {mode === "signup" ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
