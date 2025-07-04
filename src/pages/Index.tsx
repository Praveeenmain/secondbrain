import { useState } from "react";
import Landing from "./Landing";
import Login from "./Login";
import Signup from "./Signup";
import Dashboard from "./Dashboard";

type Page = 'landing' | 'login' | 'signup' | 'dashboard';

interface User {
  name: string;
  email: string;
}

const Index = () => {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (email: string, password: string) => {
    // Mock login - in real app this would make an API call
    const mockUser = {
      name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
      email: email
    };
    setUser(mockUser);
    setCurrentPage('dashboard');
  };

  const handleSignup = (name: string, email: string, password: string) => {
    // Mock signup - in real app this would make an API call
    const newUser = {
      name: name,
      email: email
    };
    setUser(newUser);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('landing');
  };

  if (currentPage === 'landing') {
    return (
      <Landing
        onNavigateToLogin={() => setCurrentPage('login')}
        onNavigateToSignup={() => setCurrentPage('signup')}
      />
    );
  }

  if (currentPage === 'login') {
    return (
      <Login
        onLogin={handleLogin}
        onNavigateToSignup={() => setCurrentPage('signup')}
        onNavigateToLanding={() => setCurrentPage('landing')}
      />
    );
  }

  if (currentPage === 'signup') {
    return (
      <Signup
        onSignup={handleSignup}
        onNavigateToLogin={() => setCurrentPage('login')}
        onNavigateToLanding={() => setCurrentPage('landing')}
      />
    );
  }

  if (currentPage === 'dashboard' && user) {
    return (
      <Dashboard
        user={user}
        onLogout={handleLogout}
      />
    );
  }

  // Fallback
  return <Landing onNavigateToLogin={() => setCurrentPage('login')} onNavigateToSignup={() => setCurrentPage('signup')} />;
};

export default Index;
