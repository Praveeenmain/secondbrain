import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { Youtube, ExternalLink } from "lucide-react";
import heroImage from "@/assets/hero-brain.jpg";
import { useNavigate } from "react-router-dom";

interface LandingProps {
  onNavigateToLogin: () => void;
  onNavigateToSignup: () => void;
}

export default function Landing() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
            {/* Text Content */}
            <div className="mb-12 lg:mb-0">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Build Your{" "}
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Second Brain
                </span>
              </h1>
              
              <p className="mt-6 text-xl text-muted-foreground leading-relaxed">
                Capture your thoughts, reflect on your experiences, and have intelligent conversations with your personal AI assistant. Transform your scattered ideas into organized wisdom.
              </p>
              
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Button 
                  variant="hero" 
                  size="lg" 
                  onClick={() => navigate('/signup')}
                  className="text-lg px-8 py-4"
                >
                  Start Building Free
                </Button>
                <Button 
                  variant="glass" 
                  size="lg" 
                  onClick={() => navigate('/login')}
                  className="text-lg px-8 py-4"
                >
                  Log In
                </Button>
              </div>
              
              <div className="mt-8 flex items-center space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                  No credit card required
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                  AI-powered insights
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                  Private & secure
                </div>
              </div>
            </div>
            
            {/* Hero Image */}
            <div className="relative">
              <div className="relative z-10">
                <img
                  src={heroImage}
                  alt="Second Brain AI visualization"
                  className="w-full h-auto rounded-2xl shadow-glow"
                />
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-primary rounded-full opacity-20 blur-xl"></div>
              <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-accent rounded-full opacity-30 blur-xl"></div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Everything you need for your digital mind
            </h2>
            <p className="mt-4 text-xl text-muted-foreground">
              Powerful features designed to help you think better and remember more
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl bg-gradient-card shadow-card">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl mx-auto mb-4 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Capture Reflections</h3>
              <p className="text-muted-foreground">
                Easily save your thoughts, experiences, and learnings in organized categories
              </p>
            </div>
            
            <div className="text-center p-6 rounded-xl bg-gradient-card shadow-card">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl mx-auto mb-4 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">AI Conversations</h3>
              <p className="text-muted-foreground">
                Chat with your Second Brain to gain insights and discover patterns in your thinking
              </p>
            </div>
            
            <div className="text-center p-6 rounded-xl bg-gradient-card shadow-card">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl mx-auto mb-4 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Smart Insights</h3>
              <p className="text-muted-foreground">
                Get personalized insights and connections across your professional, physical, mental, and social life
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer Section */}
      <footer className="py-12 bg-gradient-hero border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-foreground mb-6">
              Connect with the Creator
            </h3>
            <div className="flex justify-center space-x-6">
              <a
                href="https://www.youtube.com/@praveenunfiltered-11"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm text-foreground hover:bg-white/20 transition-smooth border border-white/20"
              >
                <Youtube className="w-5 h-5 text-red-500" />
                <span>YouTube Channel</span>
              </a>
              <a
                href="https://www.praveenn.site/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm text-foreground hover:bg-white/20 transition-smooth border border-white/20"
              >
                <ExternalLink className="w-5 h-5" />
                <span>Portfolio</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}