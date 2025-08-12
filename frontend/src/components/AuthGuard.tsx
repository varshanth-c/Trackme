// Make sure this path is correct for your project structure
import { useAuth } from "@/hooks/useAuth"; 
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  // ✅ STEP 1: Add `forgotPassword` to the functions you get from your useAuth hook.
  const { user, loading, signIn, signUp, forgotPassword } = useAuth();

  // ✅ STEP 2: Change state to handle three different modes.
  const [mode, setMode] = useState<'login' | 'signup' | 'forgotPassword'>('login');
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    // ✅ STEP 3: Update the main handler to manage all three actions.
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      try {
        if (mode === 'login') {
          await signIn(email, password);
          toast({
            title: "Welcome back!",
            description: "You have been signed in successfully.",
          });
        } else if (mode === 'signup') {
          const userDetails = { fullName, email, password };
          await signUp(userDetails);
          toast({
            title: "Account created!",
            description: "Please check your email to verify your account.",
          });
        } else { // 'forgotPassword' mode
          await forgotPassword(email);
          toast({
            title: "Check your email",
            description: "If an account exists, a password reset link has been sent.",
          });
          setMode('login'); // Switch back to login view after sending
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    };

    // Helper to get the correct title and description for the card
    const getCardText = () => {
        switch (mode) {
            case 'signup': return { title: 'Create Account', description: 'Start tracking your financial journey' };
            case 'forgotPassword': return { title: 'Reset Password', description: 'Enter your email to get a reset link' };
            default: return { title: 'Welcome Back', description: 'Sign in to manage your finances' };
        }
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
                <img src="/favicon1.svg" alt="Rupee Coin Logo" width="100" />
              </div>
              <h1 className="text-2xl font-bold">Track₹</h1>
            </div>
            <CardTitle>{getCardText().title}</CardTitle>
            <CardDescription>{getCardText().description}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" type="text" placeholder="Enter your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required/>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required/>
              </div>

              {mode !== 'forgotPassword' && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
              )}
              
              {/* ✅ STEP 4: Add the "Forgot Password?" link to the login view */}
              {mode === 'login' && (
                  <div className="text-right">
                      <Button variant="link" type="button" className="p-0 h-auto text-sm" onClick={() => setMode('forgotPassword')}>
                          Forgot Password?
                      </Button>
                  </div>
              )}
              
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {mode === 'login' ? "Sign In" : mode === 'signup' ? "Sign Up" : "Send Reset Link"}
              </Button>
            </form>
            
            <div className="mt-4 text-center">
              <Button variant="link" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="text-sm">
                {mode === 'forgotPassword' ? "Back to Sign In" : mode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}