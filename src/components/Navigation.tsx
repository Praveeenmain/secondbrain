import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface NavigationProps {
  user?: { name: string; email: string } | null;
  onLogout?: () => void;
}

export function Navigation({ user, onLogout }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-border shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Second Brain
              </h1>
            </div>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-muted-foreground">
                  Welcome, {user.name}
                </span>
                <Avatar>
                  <AvatarFallback className="bg-gradient-primary text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline" onClick={onLogout}>
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost">Log In</Button>
                <Button variant="hero">Sign Up Free</Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gradient-hero">
              {user ? (
                <div className="flex flex-col space-y-2">
                  <span className="text-muted-foreground px-3 py-2">
                    Welcome, {user.name}
                  </span>
                  <Button variant="outline" onClick={onLogout} className="w-full">
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2">
          
                  <Button variant="hero" className="w-full">Sign Up Free</Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}