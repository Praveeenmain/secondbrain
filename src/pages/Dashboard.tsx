import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Navigation } from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import { useRef } from "react";
import { Loader2, User as UserIcon, Sparkles, Settings as SettingsIcon, Bot as BotIcon } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ReactMarkdown from 'react-markdown';

const MOODS = [
  { label: "Happy", emoji: "😊" },
  { label: "Sad", emoji: "😢" },
  { label: "Stressed", emoji: "😰" },
  { label: "Excited", emoji: "🤩" },
  { label: "Calm", emoji: "😌" },
  { label: "Angry", emoji: "😡" },
];

interface User {
  name: string;
  email: string;
  avatarUrl?: string;
}

interface Reflection {
  _id: string;
  content: string;
  timestamp: Date;
  mood?: string;
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

export default function Dashboard() {
  const [newReflection, setNewReflection] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      type: "ai",
      content: "Hello! I'm your Second Brain AI. Ask me anything about your reflections or personal growth.",
      timestamp: new Date()
    }
  ]);
  
  const [newMessage, setNewMessage] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [expandedReflection, setExpandedReflection] = useState<string | null>(null);
  const [groqApiKey, setGroqApiKey] = useState("");
  const { toast } = useToast();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [aiMentionsReflection, setAiMentionsReflection] = useState(true);
  const navigate = useNavigate();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [userMood, setUserMood] = useState<string>("");
  const [showSettings, setShowSettings] = useState(false);
  const [aiName, setAiName] = useState("Second Brain AI");
  const [aiTone, setAiTone] = useState("friendly");
  const [milestone, setMilestone] = useState<string | null>(null);
  const [weeklySummary, setWeeklySummary] = useState<string>("");

  // Get user info from token (simple, not decoded)
  const token = localStorage.getItem('token');
  let user = { name: 'User', email: '', avatarUrl: '' };
  // Optionally decode JWT for real user info

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Fetch reflections from backend on mount
  useEffect(() => {
    const fetchReflections = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:3000/api/reflections', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch reflections');
        setReflections(data);
      } catch (err: any) {
        toast({ title: 'Error', description: err.message, variant: 'destructive' });
      }
    };
    fetchReflections();
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, isSendingMessage]);

  // Fetch weekly summary and check milestones
  useEffect(() => {
    // Dummy summary and milestone logic for now
    if (reflections.length > 0) {
      setWeeklySummary(`You wrote ${reflections.length} reflections this week! Keep it up!`);
      if (reflections.length === 1) setMilestone("First Reflection!");
      else if (reflections.length === 7) setMilestone("1 Week Streak!");
      else if (reflections.length === 30) setMilestone("1 Month of Reflections!");
      else setMilestone(null);
    }
  }, [reflections]);

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
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/api/reflections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: newReflection, mood: userMood }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add reflection');
      setReflections(prev => [data, ...prev]);
      setNewReflection("");
      
      toast({
        title: "Reflection saved!",
        description: "Your reflection has been saved.",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !groqApiKey.trim()) return;

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
      const token = localStorage.getItem('token');
      // Compose system prompt with user's reflections as context
      const systemPrompt = `You are ${aiName}, a ${aiTone} AI assistant. The user's name is ${user.name}. Their current mood is ${userMood || 'unknown'}. The user has the following reflections: ${reflections.map(r => `- (${r.mood || 'No mood'}) ${r.content}`).join('\n')}`;
      // Prepare conversation history for multi-turn chat (last 10 messages)
      const history = chatMessages.slice(-9).map(m => ({
        role: m.type === 'user' ? 'user' : 'assistant',
        content: m.content
      }));
      history.push({ role: 'user', content: newMessage });
      const requestBody = {
        message: newMessage,
        groqApiKey,
        systemPrompt,
        history
      };
      const res = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody),
      });
      const data = await res.json();
      let aiContent = '';
      if (!res.ok) {
        aiContent = data.error ? `Error: ${data.error}` : 'Sorry, the AI could not answer your request.';
        toast({
          title: "AI Error",
          description: aiContent,
          variant: "destructive",
        });
      } else if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
        aiContent = data.choices[0].message.content;
      } else if (data.reply) {
        aiContent = data.reply;
      } else {
        aiContent = 'Sorry, I could not understand the response.';
      }
      // Check if AI mentions any reflection
      let mentions = false;
      if (aiContent && reflections.length > 0) {
        mentions = reflections.some(r => aiContent.toLowerCase().includes(r.content.toLowerCase().slice(0, 10)));
      }
      setAiMentionsReflection(mentions);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: aiContent,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      toast({
        title: "Chat failed",
        description: error.message,
        variant: "destructive",
      });
      setChatMessages(prev => [...prev, {
        id: (Date.now() + 2).toString(),
        type: "ai",
        content: "Sorry, there was an error processing your request.",
        timestamp: new Date()
      }]);
      setAiMentionsReflection(true);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleDeleteReflection = async (id: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:3000/api/reflections/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete reflection');
      setReflections(prev => prev.filter(r => r._id !== id));
      toast({ title: 'Deleted', description: 'Reflection deleted.' });
    } catch (err: any) {
      toast({ title: 'Delete failed', description: err.message, variant: 'destructive' });
    }
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navigation user={user} onLogout={handleLogout} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Profile & Settings */}
        <div className="flex items-center gap-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-3xl">
              {user.avatarUrl ? <img src={user.avatarUrl} alt="avatar" className="w-full h-full rounded-full" /> : <UserIcon />}
            </div>
            <div>
              <div className="font-bold text-lg">{user.name}</div>
              <div className="text-muted-foreground text-sm">{user.email}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">Mood:</span>
            <select value={userMood} onChange={e => setUserMood(e.target.value)} className="rounded px-2 py-1 border">
              <option value="">Select mood</option>
              {MOODS.map(m => <option key={m.label} value={m.label}>{m.emoji} {m.label}</option>)}
            </select>
          </div>
          <Button variant="outline" size="icon" onClick={() => setShowSettings(true)}><SettingsIcon /></Button>
        </div>
        {/* Milestone Celebration */}
        {milestone && (
          <div className="flex items-center gap-2 bg-yellow-100 border border-yellow-300 rounded p-3 mb-6">
            <Sparkles className="text-yellow-500" />
            <span className="font-semibold">{milestone}</span>
          </div>
        )}
        {/* Weekly Summary */}
        {weeklySummary && (
          <Card className="mb-6">
            <CardHeader><CardTitle>Weekly Summary</CardTitle></CardHeader>
            <CardContent>{weeklySummary}</CardContent>
          </Card>
        )}
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
                    key={reflection._id}
                    className="border border-border rounded-lg p-4 hover:shadow-soft transition-smooth cursor-pointer"
                    onClick={() => setExpandedReflection(
                      expandedReflection === reflection._id ? null : reflection._id
                    )}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm text-muted-foreground">
                        {formatDate(reflection.timestamp)}
                      </span>
                      <Button variant="ghost" size="sm">
                        {expandedReflection === reflection._id ? "Collapse" : "Expand"}
                      </Button>
                    </div>
                    
                    <p className="text-foreground mb-3 line-clamp-3">
                      {reflection.content}
                    </p>
                    
                    {expandedReflection === reflection._id && (
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
                    <Button
                      variant="destructive"
                      size="sm"
                      className="ml-2"
                      onClick={e => {
                        e.stopPropagation();
                        handleDeleteReflection(reflection._id);
                      }}
                    >
                      Delete
                    </Button>
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
            <Card className="shadow-card bg-gradient-card h-[600px] flex flex-col min-h-0 p-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BotIcon className="w-6 h-6 text-primary-glow" />
                  Chat with {aiName}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col min-h-0 p-0">
                {/* Groq API Key Input */}
                <div className="mb-2 px-4 pt-4">
                  <Input
                    placeholder="Enter your Groq API key (never stored)"
                    value={groqApiKey}
                    onChange={e => setGroqApiKey(e.target.value)}
                    type="password"
                    className="mb-2"
                  />
                  {/* <Button onClick={() => { setGroqApiKey('sk-...'); setNewMessage('Tell me something inspiring!'); }}>Try Example</Button> */}
                </div>
                {/* Chat Messages */}
                <div ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-4 px-4 pb-4" style={{ minHeight: 0 }}>
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 shadow-md transition-all text-sm whitespace-pre-line
                          ${message.type === 'user'
                            ? 'bg-primary text-primary-foreground self-end'
                            : 'bg-secondary text-secondary-foreground self-start border border-border'}
                        `}
                      >
                        {message.type === 'ai' ? (
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        ) : (
                          <p>{message.content}</p>
                        )}
                        <span className="text-xs opacity-70 mt-1 block text-right">
                          {formatDate(message.timestamp)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {isSendingMessage && (
                    <div className="flex justify-start">
                      <div className="bg-secondary text-secondary-foreground rounded-lg p-3 flex items-center gap-2">
                        <Loader2 className="animate-spin w-4 h-4" />
                        <span>AI is thinking...</span>
                      </div>
                    </div>
                  )}
                </div>
                {/* Chat Input - sticky at bottom */}
                <div className="flex gap-2 p-4 border-t border-border bg-gradient-card sticky bottom-0 z-10 items-end">
                  <Textarea
                    ref={textareaRef}
                    placeholder={
                      reflections.length === 0
                        ? "Add at least one reflection to get personalized AI answers!"
                        : "Ask about your reflections... (AI will answer based on your saved reflections)"
                    }
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="flex-1 min-h-[40px] max-h-32 resize-none rounded-lg border border-border bg-background px-3 py-2 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    disabled={isSendingMessage}
                    rows={1}
                    style={{ overflow: 'auto' }}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={isSendingMessage || !groqApiKey || !newMessage.trim()}
                    variant="hero"
                    size="icon"
                    className="self-end"
                    aria-label="Send"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </Button>
                </div>
                {!isSendingMessage && newMessage && !aiMentionsReflection && (
                  <div className="px-4 pb-2 text-xs text-warning-foreground bg-warning/10 rounded mt-2">
                    The AI response may not be using your reflections. Try rephrasing or adding more details!
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {/* Settings Modal */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Customize Your AI</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block mb-1">AI Name</label>
              <Input value={aiName} onChange={e => setAiName(e.target.value)} />
            </div>
            <div>
              <label className="block mb-1">AI Tone</label>
              <select value={aiTone} onChange={e => setAiTone(e.target.value)} className="rounded px-2 py-1 border">
                <option value="friendly">Friendly</option>
                <option value="professional">Professional</option>
                <option value="humorous">Humorous</option>
              </select>
            </div>
            <Button onClick={() => setShowSettings(false)}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}