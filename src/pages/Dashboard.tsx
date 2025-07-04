import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Navigation } from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";

interface User {
  name: string;
  email: string;
}

interface Reflection {
  id: string;
  content: string;
  timestamp: Date;
  categories: {
    Professional?: string[];
    Physical?: string[];
    Mental?: string[];
    Social?: string[];
  };
}

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [newReflection, setNewReflection] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [reflections, setReflections] = useState<Reflection[]>([
    {
      id: "1",
      content: "Had a productive team meeting today. We discussed the new project roadmap and I feel more aligned with the team's vision. Also went for a 30-minute run which helped clear my mind.",
      timestamp: new Date("2024-01-15T10:30:00"),
      categories: {
        Professional: ["Team collaboration", "Project planning"],
        Physical: ["Exercise", "Running"],
        Mental: ["Clarity", "Focus"]
      }
    },
    {
      id: "2", 
      content: "Feeling a bit overwhelmed with the current workload. Need to prioritize better and perhaps delegate some tasks. Connected with an old friend over coffee - it was refreshing to catch up.",
      timestamp: new Date("2024-01-14T16:45:00"),
      categories: {
        Professional: ["Workload management", "Delegation"],
        Mental: ["Stress", "Overwhelm"],
        Social: ["Friendship", "Connection"]
      }
    }
  ]);
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      type: "ai",
      content: "Hello! I'm your Second Brain AI. I can help you analyze your reflections, find patterns in your thinking, and provide insights. What would you like to explore today?",
      timestamp: new Date()
    }
  ]);
  
  const [newMessage, setNewMessage] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [expandedReflection, setExpandedReflection] = useState<string | null>(null);
  const { toast } = useToast();

  const handleUploadReflection = async () => {
    if (!newReflection.trim()) {
      toast({
        title: "Empty reflection",
        description: "Please write something before uploading",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      // Simulate processing and categorization
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const reflection: Reflection = {
        id: Date.now().toString(),
        content: newReflection,
        timestamp: new Date(),
        categories: {
          // Mock categorization based on keywords
          Professional: newReflection.toLowerCase().includes("work") || newReflection.toLowerCase().includes("meeting") ? ["Work insights"] : undefined,
          Physical: newReflection.toLowerCase().includes("exercise") || newReflection.toLowerCase().includes("run") ? ["Physical activity"] : undefined,
          Mental: newReflection.toLowerCase().includes("think") || newReflection.toLowerCase().includes("feel") ? ["Emotional state"] : undefined,
          Social: newReflection.toLowerCase().includes("friend") || newReflection.toLowerCase().includes("social") ? ["Social interaction"] : undefined,
        }
      };
      
      setReflections(prev => [reflection, ...prev]);
      setNewReflection("");
      
      toast({
        title: "Reflection saved!",
        description: "Your reflection has been processed and categorized.",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: newMessage,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setNewMessage("");
    setIsSendingMessage(true);

    try {
      // Simulate AI response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: `Based on your reflections, I can see patterns in your ${Math.random() > 0.5 ? 'professional growth' : 'personal development'}. Your recent entries show ${Math.random() > 0.5 ? 'increased focus on work-life balance' : 'growing self-awareness'}. Would you like me to analyze specific themes or help you explore a particular area further?`,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      toast({
        title: "Message failed",
        description: "Could not send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSendingMessage(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navigation user={user} onLogout={onLogout} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user.name}! 👋
          </h1>
          <p className="text-muted-foreground mt-2">
            Continue building your Second Brain with new reflections and insights
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Reflections */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload Section */}
            <Card className="shadow-card bg-gradient-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Add New Reflection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="What's on your mind? Share your thoughts, experiences, learnings, or any insights from your day..."
                  value={newReflection}
                  onChange={(e) => setNewReflection(e.target.value)}
                  className="min-h-32 transition-smooth focus:shadow-soft"
                />
                <Button 
                  onClick={handleUploadReflection}
                  disabled={isUploading}
                  variant="hero"
                  className="w-full"
                >
                  {isUploading ? "Processing..." : "Save Reflection"}
                </Button>
              </CardContent>
            </Card>

            {/* Reflections List */}
            <Card className="shadow-card bg-gradient-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  Your Reflections ({reflections.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {reflections.map((reflection) => (
                  <div
                    key={reflection.id}
                    className="border border-border rounded-lg p-4 hover:shadow-soft transition-smooth cursor-pointer"
                    onClick={() => setExpandedReflection(
                      expandedReflection === reflection.id ? null : reflection.id
                    )}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm text-muted-foreground">
                        {formatDate(reflection.timestamp)}
                      </span>
                      <Button variant="ghost" size="sm">
                        {expandedReflection === reflection.id ? "Collapse" : "Expand"}
                      </Button>
                    </div>
                    
                    <p className="text-foreground mb-3 line-clamp-3">
                      {reflection.content}
                    </p>
                    
                    {expandedReflection === reflection.id && (
                      <div className="mt-4 space-y-3 border-t border-border pt-4">
                        <h4 className="font-medium text-foreground">AI Categories:</h4>
                        {Object.entries(reflection.categories).map(([category, items]) => 
                          items && items.length > 0 ? (
                            <div key={category} className="flex flex-wrap gap-2">
                              <span className="text-sm font-medium text-muted-foreground min-w-20">
                                {category}:
                              </span>
                              {items.map((item, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {item}
                                </Badge>
                              ))}
                            </div>
                          ) : null
                        )}
                      </div>
                    )}
                  </div>
                ))}
                
                {reflections.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No reflections yet. Start by adding your first reflection above!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Chat */}
          <div className="lg:col-span-1">
            <Card className="shadow-card bg-gradient-card h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary-glow rounded-full"></div>
                  Chat with Your Second Brain
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col">
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.type === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-secondary-foreground'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <span className="text-xs opacity-70 mt-1 block">
                          {formatDate(message.timestamp)}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {isSendingMessage && (
                    <div className="flex justify-start">
                      <div className="bg-secondary text-secondary-foreground rounded-lg p-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-75"></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-150"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask about your reflections..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={isSendingMessage}
                    variant="hero"
                    size="icon"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}