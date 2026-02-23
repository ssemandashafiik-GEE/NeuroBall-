import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Trophy, 
  List, 
  CreditCard, 
  Info, 
  User, 
  ChevronRight, 
  TrendingUp, 
  ShieldCheck,
  Zap,
  Filter,
  Search,
  LogIn,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { MatchPrediction, PredictionStatus } from './types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const AuthModal = ({ isOpen, onClose, onAuthSuccess }: { isOpen: boolean, onClose: () => void, onAuthSuccess: (user: any) => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        onAuthSuccess(data.user);
        onClose();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Connection failed');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl w-full max-w-md relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-black text-white mb-2">{isLogin ? 'Welcome Back' : 'Join NerdyTips'}</h2>
        <p className="text-zinc-400 mb-6 text-sm">{isLogin ? 'Login to access your personalized tips.' : 'Start your journey to smarter betting today.'}</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Email Address</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="john@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Password</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-red-500 text-xs font-bold">{error}</p>}
          <button type="submit" className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20">
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>
        
        <button 
          onClick={() => setIsLogin(!isLogin)}
          className="w-full mt-6 text-sm text-zinc-500 hover:text-emerald-500 transition-colors"
        >
          {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
        </button>
      </motion.div>
    </div>
  );
};

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200",
      active 
        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
        : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
    )}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </button>
);

const MatchCard = ({ match }: { match: MatchPrediction }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-emerald-500/30 transition-colors group"
  >
    <div className="flex justify-between items-start mb-4">
      <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">{match.league}</span>
      <div className={cn(
        "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tighter",
        match.isElite ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "bg-zinc-800 text-zinc-400"
      )}>
        {match.isElite ? "Elite Tip" : "Standard"}
      </div>
    </div>
    
    <div className="flex items-center justify-between mb-6">
      <div className="flex-1 text-center">
        <div className="w-12 h-12 bg-zinc-800 rounded-full mx-auto mb-2 flex items-center justify-center text-xl font-bold text-zinc-400">
          {match.homeTeam[0]}
        </div>
        <p className="text-sm font-semibold text-zinc-200 truncate">{match.homeTeam}</p>
      </div>
      <div className="px-4 text-zinc-600 font-mono text-xs">VS</div>
      <div className="flex-1 text-center">
        <div className="w-12 h-12 bg-zinc-800 rounded-full mx-auto mb-2 flex items-center justify-center text-xl font-bold text-zinc-400">
          {match.awayTeam[0]}
        </div>
        <p className="text-sm font-semibold text-zinc-200 truncate">{match.awayTeam}</p>
      </div>
    </div>

    <div className="space-y-3">
      <div className="flex justify-between items-center p-3 bg-zinc-950 rounded-xl border border-zinc-800">
        <div>
          <p className="text-[10px] text-zinc-500 uppercase font-bold">Prediction</p>
          <p className="text-emerald-400 font-bold">{match.prediction}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-zinc-500 uppercase font-bold">Odds</p>
          <p className="text-zinc-200 font-mono">{match.odds.toFixed(2)}</p>
        </div>
      </div>
      
      <div className="relative h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${match.confidence}%` }}
          className="absolute top-0 left-0 h-full bg-emerald-500"
        />
      </div>
      <div className="flex justify-between text-[10px] font-bold uppercase">
        <span className="text-zinc-500">AI Confidence</span>
        <span className="text-emerald-500">{match.confidence}%</span>
      </div>
    </div>
  </motion.div>
);

const PricingCard = ({ tier, price, features, highlighted }: { tier: string, price: string, features: string[], highlighted?: boolean }) => (
  <div className={cn(
    "p-8 rounded-3xl border transition-all duration-300",
    highlighted 
      ? "bg-emerald-600 border-emerald-400 text-white scale-105 shadow-2xl shadow-emerald-500/20" 
      : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700"
  )}>
    <h3 className="text-xl font-bold mb-2">{tier}</h3>
    <div className="flex items-baseline gap-1 mb-6">
      <span className="text-4xl font-black">{price}</span>
      <span className="text-sm opacity-70">/month</span>
    </div>
    <ul className="space-y-4 mb-8">
      {features.map((f, i) => (
        <li key={i} className="flex items-center gap-3 text-sm">
          <ShieldCheck size={18} className={highlighted ? "text-emerald-200" : "text-emerald-500"} />
          {f}
        </li>
      ))}
    </ul>
    <button className={cn(
      "w-full py-3 rounded-xl font-bold transition-all",
      highlighted 
        ? "bg-white text-emerald-600 hover:bg-zinc-100" 
        : "bg-emerald-500 text-white hover:bg-emerald-600"
    )}>
      Get Started
    </button>
  </div>
);

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'elites' | 'all' | 'subscribe' | 'tutorial'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [predictions, setPredictions] = useState<MatchPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // In a real app, verify token and fetch user
      setUser({ email: 'demo@nerdytips.ai', tier: 'pro' });
    }
    
    fetch('/api/predictions')
      .then(res => res.json())
      .then(data => {
        setPredictions(data.map((p: any) => ({
          ...p,
          homeTeam: p.home_team,
          awayTeam: p.away_team,
          startTime: p.start_time,
          isElite: !!p.is_elite
        })));
        setLoading(false);
      });
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const elitePredictions = predictions.filter(p => p.isElite);

  return (
    <div className="min-h-screen bg-black text-zinc-200 font-sans selection:bg-emerald-500/30">
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onAuthSuccess={(u) => setUser(u)} 
      />
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 h-full bg-zinc-950 border-r border-zinc-900 transition-all duration-300 z-50",
        isSidebarOpen ? "w-64" : "w-20"
      )}>
        <div className="p-6 flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <Zap size={24} fill="currentColor" />
          </div>
          {isSidebarOpen && <h1 className="text-xl font-black tracking-tighter text-white">NERDYTIPS AI</h1>}
        </div>

        <nav className="px-3 space-y-2">
          <SidebarItem 
            icon={LayoutDashboard} 
            label={isSidebarOpen ? "Dashboard" : ""} 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <SidebarItem 
            icon={Trophy} 
            label={isSidebarOpen ? "Elite Tips" : ""} 
            active={activeTab === 'elites'} 
            onClick={() => setActiveTab('elites')} 
          />
          <SidebarItem 
            icon={List} 
            label={isSidebarOpen ? "All Matches" : ""} 
            active={activeTab === 'all'} 
            onClick={() => setActiveTab('all')} 
          />
          <SidebarItem 
            icon={CreditCard} 
            label={isSidebarOpen ? "Subscription" : ""} 
            active={activeTab === 'subscribe'} 
            onClick={() => setActiveTab('subscribe')} 
          />
          <SidebarItem 
            icon={Info} 
            label={isSidebarOpen ? "Master Class" : ""} 
            active={activeTab === 'tutorial'} 
            onClick={() => setActiveTab('tutorial')} 
          />
        </nav>

        <div className="absolute bottom-6 left-0 w-full px-3">
          {user ? (
            <button 
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-all"
            >
              <LogOut size={20} />
              {isSidebarOpen && <span className="font-medium">Sign Out</span>}
            </button>
          ) : (
            <button 
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-all"
            >
              <LogIn size={20} />
              {isSidebarOpen && <span className="font-medium">Sign In</span>}
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "transition-all duration-300 min-h-screen",
        isSidebarOpen ? "pl-64" : "pl-20"
      )}>
        {/* Header */}
        <header className="sticky top-0 bg-black/80 backdrop-blur-md border-bottom border-zinc-900 z-40 px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h2 className="text-lg font-bold capitalize">{activeTab.replace('-', ' ')}</h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-zinc-900 rounded-full border border-zinc-800">
              <TrendingUp size={16} className="text-emerald-500" />
              <span className="text-xs font-bold text-zinc-400">Win Rate: <span className="text-emerald-400">84.2%</span></span>
            </div>
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-white">{user.email.split('@')[0]}</p>
                    <p className="text-[10px] text-emerald-500 font-bold uppercase">{user.tier} Member</p>
                  </div>
                  <div className="w-10 h-10 bg-zinc-800 rounded-full border-2 border-zinc-700 flex items-center justify-center">
                    <User size={20} className="text-zinc-400" />
                  </div>
                </>
              ) : (
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-xs font-bold hover:bg-zinc-800 transition-all"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                {/* Hero Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 rounded-3xl shadow-xl shadow-emerald-500/10">
                    <p className="text-emerald-100 text-sm font-bold uppercase mb-1">Today's Best Tip</p>
                    <h3 className="text-2xl font-black text-white mb-4">Arsenal vs Man City</h3>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-emerald-200 text-xs font-bold">Prediction</p>
                        <p className="text-white text-lg font-bold">Home Win</p>
                      </div>
                      <div className="text-right">
                        <p className="text-emerald-200 text-xs font-bold">Confidence</p>
                        <p className="text-white text-2xl font-black">92%</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl">
                    <p className="text-zinc-500 text-sm font-bold uppercase mb-1">Weekly Profit</p>
                    <h3 className="text-3xl font-black text-white mb-2">+14.2 Units</h3>
                    <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold">
                      <TrendingUp size={14} />
                      <span>+12% from last week</span>
                    </div>
                  </div>

                  <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl">
                    <p className="text-zinc-500 text-sm font-bold uppercase mb-1">Active Predictions</p>
                    <h3 className="text-3xl font-black text-white mb-2">{predictions.length}</h3>
                    <p className="text-zinc-500 text-xs font-bold uppercase">Updated 5 mins ago</p>
                  </div>
                </div>

                {/* Featured Section */}
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Trophy size={20} className="text-amber-500" />
                      Elite Selections
                    </h3>
                    <button onClick={() => setActiveTab('elites')} className="text-emerald-500 text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
                      View All <ChevronRight size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {elitePredictions.slice(0, 3).map(p => (
                      <MatchCard key={p.id} match={p} />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'elites' && (
              <motion.div
                key="elites"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl mb-8">
                  <h3 className="text-2xl font-black text-white mb-2">Daily Elite Slip</h3>
                  <p className="text-zinc-400 mb-6">Our highest confidence predictions combined for maximum value.</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {elitePredictions.map(p => (
                      <div key={p.id} className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
                        <p className="text-xs font-bold text-zinc-500 mb-1">{p.homeTeam} vs {p.awayTeam}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-emerald-400 font-bold">{p.prediction}</span>
                          <span className="text-zinc-300 font-mono">{p.odds}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 pt-8 border-t border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div>
                      <p className="text-zinc-500 text-xs font-bold uppercase">Total Odds</p>
                      <p className="text-3xl font-black text-white">4.82</p>
                    </div>
                    <button className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-500/20">
                      Copy Bet Slip
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {elitePredictions.map(p => (
                    <MatchCard key={p.id} match={p} />
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'all' && (
              <motion.div
                key="all"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                    <input 
                      type="text" 
                      placeholder="Search teams or leagues..." 
                      className="w-full pl-12 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={async () => {
                        if (!user) {
                          setIsAuthModalOpen(true);
                          return;
                        }
                        setLoading(true);
                        try {
                          const res = await fetch('/api/predictions/generate', {
                            method: 'POST',
                            headers: { 
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${localStorage.getItem('token')}`
                            },
                            body: JSON.stringify({ home: 'Chelsea', away: 'Arsenal', league: 'Premier League' })
                          });
                          const newPred = await res.json();
                          setPredictions([newPred, ...predictions]);
                        } catch (e) {
                          console.error(e);
                        } finally {
                          setLoading(false);
                        }
                      }}
                      className="px-4 py-3 bg-emerald-500 text-white rounded-xl flex items-center gap-2 hover:bg-emerald-600 transition-colors font-bold"
                    >
                      <Zap size={18} fill="currentColor" />
                      <span>AI Generate Tip</span>
                    </button>
                    <button className="px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center gap-2 hover:bg-zinc-800 transition-colors">
                      <Filter size={18} />
                      <span>Filters</span>
                    </button>
                    <select className="px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:outline-none hover:bg-zinc-800 transition-colors">
                      <option>All Leagues</option>
                      <option>Premier League</option>
                      <option>La Liga</option>
                      <option>Champions League</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {predictions.map(p => (
                    <MatchCard key={p.id} match={p} />
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'subscribe' && (
              <motion.div
                key="subscribe"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="py-8"
              >
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-black text-white mb-4">Choose Your Strategy</h2>
                  <p className="text-zinc-400 max-w-2xl mx-auto">Unlock professional-grade AI analysis and the highest confidence elite tips to transform your betting game.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                  <PricingCard 
                    tier="Basic" 
                    price="$9.99" 
                    features={["10 Standard Tips/Day", "Basic AI Analysis", "Email Support", "No Ads"]} 
                  />
                  <PricingCard 
                    tier="Pro" 
                    price="$24.99" 
                    highlighted
                    features={["Unlimited Standard Tips", "3 Elite Tips/Day", "Advanced Neural Analysis", "Real-time Notifications", "Priority Support"]} 
                  />
                  <PricingCard 
                    tier="Elite" 
                    price="$49.99" 
                    features={["Full Access to All Tips", "Unlimited Elite Tips", "Betting Master Class", "1-on-1 Strategy Call", "Exclusive Discord Access"]} 
                  />
                </div>
              </motion.div>
            )}

            {activeTab === 'tutorial' && (
              <motion.div
                key="tutorial"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-3xl mx-auto space-y-12"
              >
                <section>
                  <h3 className="text-3xl font-black text-white mb-6">Betting Master Class</h3>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-6">
                    <div className="flex gap-6">
                      <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center shrink-0">
                        <ShieldCheck size={24} />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-white mb-2">Risk Management</h4>
                        <p className="text-zinc-400 leading-relaxed">Learn how to manage your bankroll effectively. We recommend never wagering more than 2-5% of your total bankroll on a single selection.</p>
                      </div>
                    </div>
                    <div className="flex gap-6">
                      <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center shrink-0">
                        <Zap size={24} />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-white mb-2">Value Betting</h4>
                        <p className="text-zinc-400 leading-relaxed">Our AI identifies "value" by comparing its calculated probability against the bookmaker's odds. If our probability is higher, it's a value bet.</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-3xl font-black text-white mb-6">Our Methodology</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl">
                      <h4 className="font-bold text-white mb-2">Neural Analysis</h4>
                      <p className="text-sm text-zinc-400">Our engine processes over 10,000 data points per match, including player metrics, tactical setups, and historical trends.</p>
                    </div>
                    <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl">
                      <h4 className="font-bold text-white mb-2">Real-time Grounding</h4>
                      <p className="text-sm text-zinc-400">We use Google Search Grounding to factor in last-minute news like injury reports, weather conditions, and lineup changes.</p>
                    </div>
                  </div>
                </section>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
