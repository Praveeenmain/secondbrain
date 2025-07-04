import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Navigation } from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";

interface SignupProps {
  onSignup: (name: string, email: string, password: string) => void;
  onNavigateToLogin: (path: '/login') => void;
  onNavigateToLanding: () => void;
}

export default function Signup({ onSignup, onNavigateToLogin, onNavigateToLanding }: SignupProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate signup process
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSignup(name, email, password);
      toast({
        title: "Welcome to Second Brain!",
        description: "Your account has been created successfully.",
      });
    } catch (error) {
      toast({
        title: "Signup failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navigation />
      
      <div className="flex items-center justify-center px-4 py-20">
        <Card className="w-full max-w-md shadow-glow bg-gradient-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              Create your{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Second Brain
              </span>
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Start your journey of organized thinking and AI-powered insights
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="transition-smooth focus:shadow-soft"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="transition-smooth focus:shadow-soft"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password (min 8 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="transition-smooth focus:shadow-soft"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="transition-smooth focus:shadow-soft"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                variant="hero"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
            
           
            
            <div className="mt-4 text-center">
              <button
                onClick={onNavigateToLanding}
                className="text-muted-foreground hover:text-foreground transition-smooth text-sm"
              >
                ← Back to home
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}