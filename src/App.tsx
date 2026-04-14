import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  MessageSquare, 
  Sparkles, 
  Mic, 
  Star, 
  Home as HomeIcon,
  Settings,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  Trash2,
  Plus,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { polishSentence, chatWithTutor, generateResponse } from './services/gemini';
import { Message, Scenario, FavoriteSentence } from './types';
import ReactMarkdown from 'react-markdown';

// --- Components ---

const Navbar = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) => {
  const tabs = [
    { id: 'home', icon: HomeIcon, label: '首页' },
    { id: 'scenarios', icon: BookOpen, label: '场景' },
    { id: 'polish', icon: Sparkles, label: '润色' },
    { id: 'tutor', icon: MessageSquare, label: '外教' },
    { id: 'favorites', icon: Star, label: '收藏' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 flex justify-around items-center z-50">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex flex-col items-center p-2 transition-colors ${
            activeTab === tab.id ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <tab.icon size={24} />
          <span className="text-xs mt-1 font-medium">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
};

const Header = ({ title, showBack, onBack }: { title: string, showBack?: boolean, onBack?: () => void }) => (
  <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center gap-4 z-40">
    {showBack && (
      <Button variant="ghost" size="icon" onClick={onBack}>
        <ArrowLeft size={20} />
      </Button>
    )}
    <h1 className="text-xl font-bold text-gray-900">{title}</h1>
  </header>
);

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [favorites, setFavorites] = useState<FavoriteSentence[]>([]);

  // Load favorites from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('favorites');
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  const saveFavorite = (sentence: FavoriteSentence) => {
    const newFavorites = [...favorites, sentence];
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    toast.success('已添加到收藏');
  };

  const removeFavorite = (id: string) => {
    const newFavorites = favorites.filter(f => f.id !== id);
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    toast.info('已从收藏中移除');
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <AnimatePresence mode="wait">
        {activeTab === 'home' && <Home key="home" setActiveTab={setActiveTab} />}
        {activeTab === 'scenarios' && !selectedScenario && (
          <Scenarios key="scenarios" onSelect={setSelectedScenario} />
        )}
        {activeTab === 'scenarios' && selectedScenario && (
          <Dialogue 
            key="dialogue" 
            scenario={selectedScenario} 
            onBack={() => setSelectedScenario(null)} 
            onSave={saveFavorite}
            speak={speak}
          />
        )}
        {activeTab === 'polish' && <Polish key="polish" onSave={saveFavorite} speak={speak} />}
        {activeTab === 'tutor' && <Tutor key="tutor" onSave={saveFavorite} speak={speak} />}
        {activeTab === 'favorites' && (
          <Favorites 
            key="favorites" 
            favorites={favorites} 
            onRemove={removeFavorite} 
            speak={speak}
          />
        )}
      </AnimatePresence>
      
      <Navbar activeTab={activeTab} setActiveTab={(tab) => {
        setActiveTab(tab);
        setSelectedScenario(null);
      }} />
      <Toaster position="top-center" />
    </div>
  );
}

// --- Feature Components ---

function Home({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 space-y-8"
    >
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">早安!</h2>
        <p className="text-gray-500">今天也要加油练习口语哦。</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-blue-600 text-white border-none shadow-lg shadow-blue-200 cursor-pointer" onClick={() => setActiveTab('scenarios')}>
          <CardHeader className="pb-2">
            <BookOpen size={24} />
            <CardTitle className="text-lg mt-2">场景练习</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-100 text-xs">模拟真实生活场景，沉浸式对话。</p>
          </CardContent>
        </Card>

        <Card className="bg-purple-600 text-white border-none shadow-lg shadow-purple-200 cursor-pointer" onClick={() => setActiveTab('tutor')}>
          <CardHeader className="pb-2">
            <MessageSquare size={24} />
            <CardTitle className="text-lg mt-2">AI 外教</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-purple-100 text-xs">随时随地与 AI 老师自由交流。</p>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">快速工具</h3>
        <div className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-between h-16 text-left px-4"
            onClick={() => setActiveTab('polish')}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                <Sparkles size={20} />
              </div>
              <div>
                <div className="font-medium">句子润色</div>
                <div className="text-xs text-gray-500">让你的表达更地道</div>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </Button>

          <Button 
            variant="outline" 
            className="w-full justify-between h-16 text-left px-4"
            onClick={() => setActiveTab('favorites')}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-100 text-pink-600 rounded-lg">
                <Star size={20} />
              </div>
              <div>
                <div className="font-medium">我的收藏</div>
                <div className="text-xs text-gray-500">复习你保存的精彩句子</div>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </Button>
        </div>
      </section>
    </motion.div>
  );
}

function Scenarios({ onSelect }: { onSelect: (s: Scenario) => void }) {
  const scenarios: Scenario[] = [
    { id: '1', title: 'At the Cafe', titleZh: '在咖啡馆', description: '学习如何点咖啡和点心。', icon: '☕' },
    { id: '2', title: 'Airport Check-in', titleZh: '机场值机', description: '办理登机手续和行李托运。', icon: '✈️' },
    { id: '3', title: 'Job Interview', titleZh: '求职面试', description: '练习常见的面试问题和回答。', icon: '💼' },
    { id: '4', title: 'Asking for Directions', titleZh: '问路', description: '在陌生的城市寻找目的地。', icon: '🗺️' },
    { id: '5', title: 'At the Doctor', titleZh: '看医生', description: '描述症状并咨询医生建议。', icon: '🏥' },
    { id: '6', title: 'Shopping for Clothes', titleZh: '买衣服', description: '询问尺码、价格和试穿。', icon: '🛍️' },
    { id: '7', title: 'Checking into a Hotel', titleZh: '入住酒店', description: '办理入住手续，询问设施。', icon: '🏨' },
    { id: '8', title: 'Ordering in a Restaurant', titleZh: '餐厅点餐', description: '看菜单、点菜及结账。', icon: '🍽️' },
    { id: '9', title: 'Making a Phone Call', titleZh: '拨打电话', description: '商务通话或预约服务。', icon: '📞' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-screen"
    >
      <Header title="场景练习" />
      <ScrollArea className="flex-1 p-6">
        <div className="grid grid-cols-1 gap-4">
          {scenarios.map((s) => (
            <Card key={s.id} className="hover:border-blue-300 transition-colors cursor-pointer group" onClick={() => onSelect(s)}>
              <CardHeader className="flex flex-row items-center gap-4 py-4">
                <div className="text-4xl">{s.icon}</div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{s.title}</CardTitle>
                  <CardDescription>{s.titleZh}</CardDescription>
                </div>
                <ChevronRight size={20} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
              </CardHeader>
              <CardContent className="pt-0 pb-4">
                <p className="text-sm text-gray-500">{s.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </motion.div>
  );
}

function Dialogue({ scenario, onBack, onSave, speak }: { 
  scenario: Scenario, 
  onBack: () => void, 
  onSave: (s: FavoriteSentence) => void,
  speak: (t: string) => void
}) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: `Hello! Welcome to the ${scenario.title} practice. I'll be your partner. Shall we start?` }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const history = messages.map(m => ({
      role: m.role === 'model' ? 'model' as const : 'user' as const,
      parts: [{ text: m.content }]
    }));
    history.push({ role: 'user', parts: [{ text: input }] });

    const prompt = `We are practicing a dialogue in the scenario: ${scenario.title}. 
    I am the user, you are the AI assistant. 
    Continue the conversation naturally. 
    Keep your response short (1-2 sentences). 
    If I make a mistake, correct me briefly at the end of your response.`;

    const response = await chatWithTutor(history);
    setMessages(prev => [...prev, { role: 'model', content: response || '' }]);
    setIsTyping(false);
    
    if (response) speak(response);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-screen bg-white"
    >
      <Header title={scenario.titleZh} showBack onBack={onBack} />
      
      <ScrollArea className="flex-1 p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
              m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'
            }`}>
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[10px] opacity-70 uppercase font-bold">
                  {m.role === 'user' ? 'You' : 'AI Partner'}
                </span>
                <div className="flex gap-1">
                  <button onClick={() => speak(m.content)} className="opacity-50 hover:opacity-100">
                    <Volume2 size={12} />
                  </button>
                  <button 
                    onClick={() => onSave({ id: Date.now().toString(), original: m.content, translation: '', timestamp: Date.now() })} 
                    className="opacity-50 hover:opacity-100"
                  >
                    <Star size={12} />
                  </button>
                </div>
              </div>
              <p className="text-sm leading-relaxed">{m.content}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl px-4 py-2 rounded-tl-none">
              <span className="animate-pulse text-gray-400">...</span>
            </div>
          </div>
        )}
      </ScrollArea>

      <div className="p-4 border-t border-gray-100 flex gap-2 items-center">
        <Input 
          placeholder="输入你的回答..." 
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 rounded-full bg-gray-50 border-none focus-visible:ring-blue-500"
        />
        <Button size="icon" className="rounded-full bg-blue-600 hover:bg-blue-700" onClick={handleSend}>
          <Mic size={20} />
        </Button>
      </div>
    </motion.div>
  );
}

function Polish({ onSave, speak }: { onSave: (s: FavoriteSentence) => void, speak: (t: string) => void }) {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePolish = async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    const res = await polishSentence(input);
    setResult(res || null);
    setIsLoading(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-screen"
    >
      <Header title="句子润色" />
      <ScrollArea className="flex-1 p-6 space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">输入你想改进的句子</label>
            <Input 
              placeholder="例如: I want to go to the park." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="h-12"
            />
          </div>
          <Button className="w-full bg-amber-500 hover:bg-amber-600" onClick={handlePolish} disabled={isLoading}>
            {isLoading ? '正在润色...' : '开始润色'}
          </Button>
        </div>

        {result && (
          <Card className="border-amber-100 bg-amber-50/30">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-bold text-amber-800 uppercase tracking-wider">润色结果</CardTitle>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => speak(result)}>
                    <Volume2 size={18} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onSave({ id: Date.now().toString(), original: input, polished: result, translation: '', timestamp: Date.now() })}>
                    <Star size={18} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none text-gray-800">
              <ReactMarkdown>{result}</ReactMarkdown>
            </CardContent>
          </Card>
        )}
      </ScrollArea>
    </motion.div>
  );
}

function Tutor({ onSave, speak }: { onSave: (s: FavoriteSentence) => void, speak: (t: string) => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: "Hi there! I'm your AI English tutor. How are you feeling today? What would you like to talk about?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const history = messages.map(m => ({
      role: m.role === 'model' ? 'model' as const : 'user' as const,
      parts: [{ text: m.content }]
    }));
    history.push({ role: 'user', parts: [{ text: input }] });

    const response = await chatWithTutor(history);
    setMessages(prev => [...prev, { role: 'model', content: response || '' }]);
    setIsTyping(false);
    
    if (response) speak(response);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-screen bg-white"
    >
      <Header title="AI 外教聊天" />
      
      <ScrollArea className="flex-1 p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
              m.role === 'user' ? 'bg-purple-600 text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'
            }`}>
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[10px] opacity-70 uppercase font-bold">
                  {m.role === 'user' ? 'You' : 'AI Tutor'}
                </span>
                <div className="flex gap-1">
                  <button onClick={() => speak(m.content)} className="opacity-50 hover:opacity-100">
                    <Volume2 size={12} />
                  </button>
                  <button 
                    onClick={() => onSave({ id: Date.now().toString(), original: m.content, translation: '', timestamp: Date.now() })} 
                    className="opacity-50 hover:opacity-100"
                  >
                    <Star size={12} />
                  </button>
                </div>
              </div>
              <p className="text-sm leading-relaxed">{m.content}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl px-4 py-2 rounded-tl-none">
              <span className="animate-pulse text-gray-400">AI 老师正在思考...</span>
            </div>
          </div>
        )}
      </ScrollArea>

      <div className="p-4 border-t border-gray-100 flex gap-2 items-center">
        <Input 
          placeholder="和老师聊聊吧..." 
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 rounded-full bg-gray-50 border-none focus-visible:ring-purple-500"
        />
        <Button size="icon" className="rounded-full bg-purple-600 hover:bg-purple-700" onClick={handleSend}>
          <Mic size={20} />
        </Button>
      </div>
    </motion.div>
  );
}

function Favorites({ favorites, onRemove, speak }: { 
  favorites: FavoriteSentence[], 
  onRemove: (id: string) => void,
  speak: (t: string) => void
}) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-screen"
    >
      <Header title="我的收藏" />
      <ScrollArea className="flex-1 p-6">
        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400 space-y-4">
            <Star size={48} strokeWidth={1} />
            <p>还没有收藏任何句子哦</p>
          </div>
        ) : (
          <div className="space-y-4">
            {favorites.map((f) => (
              <Card key={f.id} className="overflow-hidden">
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 space-y-2">
                      <p className="text-sm font-medium text-gray-900 leading-relaxed">{f.original}</p>
                      {f.polished && (
                        <div className="p-2 bg-amber-50 rounded text-xs text-amber-800 border border-amber-100">
                          <div className="font-bold mb-1 uppercase text-[10px]">Polished:</div>
                          <ReactMarkdown>{f.polished}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => speak(f.polished || f.original)}>
                        <Volume2 size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => onRemove(f.id)}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                  <div className="text-[10px] text-gray-400">
                    {new Date(f.timestamp).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </motion.div>
  );
}
