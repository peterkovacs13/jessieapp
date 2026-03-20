import { useState, useEffect, useCallback } from "react";
import { Trophy, Utensils, MapPin, Star, Heart, ChevronRight, Plus, X, Check, Sun, Moon, Sparkles, Flame, Globe, Camera, Award, ChefHat, CheckCircle2, Circle, Trash2, ArrowLeft, Gift, Compass, Coffee, Pizza, Plane, Mountain, Music, Palette, ShoppingBag } from "lucide-react";

// ─── STORAGE HELPERS (localStorage) ───
const STORAGE_KEY = "pj-adventures";

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveData(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

// ─── QUEST DEFINITIONS ───
const QUEST_TEMPLATES = [
  { id: "q1", title: "Try a cuisine neither of you has eaten before", category: "food", points: 30, icon: "pizza" },
  { id: "q2", title: "Cook a 3-course meal together", category: "cooking", points: 40, icon: "chef" },
  { id: "q3", title: "Visit a new country together", category: "travel", points: 50, icon: "plane" },
  { id: "q4", title: "Find a hidden gem restaurant in Budapest", category: "food", points: 25, icon: "compass" },
  { id: "q5", title: "Have a picnic in a park you've never been to", category: "explore", points: 20, icon: "mountain" },
  { id: "q6", title: "Recreate a dish from your favorite restaurant", category: "cooking", points: 35, icon: "chef" },
  { id: "q7", title: "Take a day trip to a nearby town", category: "travel", points: 30, icon: "compass" },
  { id: "q8", title: "Try street food from 3 different vendors in one day", category: "food", points: 25, icon: "pizza" },
  { id: "q9", title: "Visit a museum or gallery together", category: "explore", points: 20, icon: "palette" },
  { id: "q10", title: "Cook something from a country you've visited", category: "cooking", points: 30, icon: "globe" },
  { id: "q11", title: "Explore a neighborhood you've never walked through", category: "explore", points: 15, icon: "compass" },
  { id: "q12", title: "Have a breakfast date at a new café", category: "food", points: 15, icon: "coffee" },
  { id: "q13", title: "Take a cooking class together", category: "cooking", points: 45, icon: "chef" },
  { id: "q14", title: "Go on a hike or nature walk", category: "explore", points: 25, icon: "mountain" },
  { id: "q15", title: "Visit a farmers' market and cook with what you find", category: "cooking", points: 35, icon: "shopping" },
  { id: "q16", title: "Photograph 5 beautiful doors or facades in the city", category: "explore", points: 15, icon: "camera" },
  { id: "q17", title: "Have a movie marathon with themed snacks", category: "fun", points: 20, icon: "music" },
  { id: "q18", title: "Try a Michelin-starred or fine dining experience", category: "food", points: 50, icon: "star" },
  { id: "q19", title: "Explore a Christmas/seasonal market together", category: "explore", points: 20, icon: "gift" },
  { id: "q20", title: "Master a signature cocktail as a couple", category: "cooking", points: 25, icon: "coffee" },
];

const BADGE_DEFINITIONS = [
  { id: "b1", title: "First Steps", description: "Complete your first quest", icon: "🌟", condition: (s) => s.completedQuests >= 1 },
  { id: "b2", title: "Adventurers", description: "Complete 5 quests", icon: "🏔️", condition: (s) => s.completedQuests >= 5 },
  { id: "b3", title: "Unstoppable Duo", description: "Complete 10 quests", icon: "🔥", condition: (s) => s.completedQuests >= 10 },
  { id: "b4", title: "Foodies", description: "Log 5 restaurants", icon: "🍽️", condition: (s) => s.restaurants >= 5 },
  { id: "b5", title: "Home Chefs", description: "Log 5 recipes", icon: "👨‍🍳", condition: (s) => s.recipes >= 5 },
  { id: "b6", title: "Globe Trotters", description: "Add 5 map memories", icon: "🌍", condition: (s) => s.mapPins >= 5 },
  { id: "b7", title: "Dream Big", description: "Add 10 bucket list items", icon: "✨", condition: (s) => s.bucketItems >= 10 },
  { id: "b8", title: "Century Club", description: "Earn 100 points", icon: "💯", condition: (s) => s.points >= 100 },
  { id: "b9", title: "Point Masters", description: "Earn 500 points", icon: "👑", condition: (s) => s.points >= 500 },
  { id: "b10", title: "Bucket Crushers", description: "Complete 5 bucket list items", icon: "🎯", condition: (s) => s.completedBucket >= 5 },
];

const CATEGORY_COLORS = {
  food: { bg: "bg-amber-50 dark:bg-amber-950/30", text: "text-amber-700 dark:text-amber-400", border: "border-amber-200 dark:border-amber-800" },
  cooking: { bg: "bg-rose-50 dark:bg-rose-950/30", text: "text-rose-700 dark:text-rose-400", border: "border-rose-200 dark:border-rose-800" },
  travel: { bg: "bg-sky-50 dark:bg-sky-950/30", text: "text-sky-700 dark:text-sky-400", border: "border-sky-200 dark:border-sky-800" },
  explore: { bg: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-700 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-800" },
  fun: { bg: "bg-violet-50 dark:bg-violet-950/30", text: "text-violet-700 dark:text-violet-400", border: "border-violet-200 dark:border-violet-800" },
};

const ICON_MAP = {
  pizza: Pizza, chef: ChefHat, plane: Plane, compass: Compass, mountain: Mountain,
  globe: Globe, coffee: Coffee, palette: Palette, camera: Camera, music: Music,
  star: Star, gift: Gift, shopping: ShoppingBag,
};

const DEFAULT_DATA = {
  quests: [],
  restaurants: [],
  recipes: [],
  mapPins: [],
  bucketList: [],
  points: 0,
  level: 1,
};

// ─── MAIN APP ───
export default function App() {
  const [dark, setDark] = useState(false);
  const [tab, setTab] = useState("home");
  const [data, setData] = useState(DEFAULT_DATA);
  const [loaded, setLoaded] = useState(false);
  const [subView, setSubView] = useState(null);
  const [showNewBadge, setShowNewBadge] = useState(null);
  const [formOpen, setFormOpen] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const saved = loadData();
    if (saved) setData(saved);
    setLoaded(true);
  }, []);

  // Save helper
  const save = useCallback((newData) => {
    setData(newData);
    saveData(newData);
  }, []);

  // Stats for badges
  const stats = {
    completedQuests: data.quests.filter(q => q.completed).length,
    restaurants: data.restaurants.length,
    recipes: data.recipes.length,
    mapPins: data.mapPins.length,
    bucketItems: data.bucketList.length,
    completedBucket: data.bucketList.filter(b => b.completed).length,
    points: data.points,
  };

  const earnedBadges = BADGE_DEFINITIONS.filter(b => b.condition(stats));

  const checkNewBadges = (newStats) => {
    const oldBadges = BADGE_DEFINITIONS.filter(b => b.condition(stats)).map(b => b.id);
    const newBadges = BADGE_DEFINITIONS.filter(b => b.condition(newStats)).map(b => b.id);
    const fresh = newBadges.find(id => !oldBadges.includes(id));
    if (fresh) {
      const badge = BADGE_DEFINITIONS.find(b => b.id === fresh);
      setShowNewBadge(badge);
      setTimeout(() => setShowNewBadge(null), 3500);
    }
  };

  const level = Math.floor(data.points / 100) + 1;
  const levelProgress = (data.points % 100);

  if (!loaded) return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="animate-pulse flex flex-col items-center gap-3">
        <Heart className="w-8 h-8 text-rose-400" />
        <p className="text-stone-400 text-sm tracking-widest uppercase">Loading your adventures...</p>
      </div>
    </div>
  );

  const tabs = [
    { id: "home", label: "Home", icon: Heart },
    { id: "quests", label: "Quests", icon: Trophy },
    { id: "food", label: "Food", icon: Utensils },
    { id: "map", label: "Memories", icon: Camera },
    { id: "bucket", label: "Wishes", icon: Star },
  ];

  return (
    <div className={`${dark ? "dark" : ""}`}>
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-800 dark:text-stone-200 transition-colors duration-500">

        {/* Badge notification */}
        {showNewBadge && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[999] badge-pop">
            <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-2xl border border-amber-200 dark:border-amber-700 px-6 py-4 flex items-center gap-4">
              <span className="text-4xl">{showNewBadge.icon}</span>
              <div>
                <p className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider">Badge Unlocked!</p>
                <p className="font-display text-lg font-semibold">{showNewBadge.title}</p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="sticky top-0 z-50 bg-stone-50/80 dark:bg-stone-950/80 backdrop-blur-xl border-b border-stone-200 dark:border-stone-800">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
            {subView ? (
              <button onClick={() => { setSubView(null); setFormOpen(false); }} className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-400 fill-rose-400" />
                <h1 className="font-display text-lg font-semibold tracking-tight">Peter & Jess</h1>
              </div>
            )}
            <button onClick={() => setDark(!dark)} className="p-2 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors">
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="max-w-lg mx-auto px-4 pb-24">
          {tab === "home" && !subView && <HomeTab data={data} stats={stats} earnedBadges={earnedBadges} level={level} levelProgress={levelProgress} setTab={setTab} />}
          {tab === "quests" && <QuestsTab data={data} save={save} subView={subView} setSubView={setSubView} checkNewBadges={checkNewBadges} stats={stats} earnedBadges={earnedBadges} />}
          {tab === "food" && <FoodTab data={data} save={save} subView={subView} setSubView={setSubView} formOpen={formOpen} setFormOpen={setFormOpen} checkNewBadges={checkNewBadges} stats={stats} />}
          {tab === "map" && <MapTab data={data} save={save} subView={subView} setSubView={setSubView} formOpen={formOpen} setFormOpen={setFormOpen} checkNewBadges={checkNewBadges} stats={stats} />}
          {tab === "bucket" && <BucketTab data={data} save={save} formOpen={formOpen} setFormOpen={setFormOpen} checkNewBadges={checkNewBadges} stats={stats} />}
        </main>

        {/* Bottom nav */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-stone-900/90 backdrop-blur-xl border-t border-stone-200 dark:border-stone-800">
          <div className="max-w-lg mx-auto flex">
            {tabs.map(t => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button key={t.id} onClick={() => { setTab(t.id); setSubView(null); setFormOpen(false); }}
                  className={`flex-1 py-3 flex flex-col items-center gap-1 transition-all duration-300 ${active ? "text-stone-900 dark:text-white" : "text-stone-400 dark:text-stone-600"}`}>
                  <Icon className={`w-5 h-5 transition-transform duration-300 ${active ? "scale-110" : ""}`} fill={active && t.id === "home" ? "currentColor" : "none"} />
                  <span className={`text-[10px] font-medium tracking-wide uppercase ${active ? "opacity-100" : "opacity-60"}`}>{t.label}</span>
                  {active && <div className="w-1 h-1 rounded-full bg-rose-400 mt-0.5" />}
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}

// ─── HOME TAB ───
function HomeTab({ data, stats, earnedBadges, level, levelProgress, setTab }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const totalQuests = data.quests.filter(q => q.completed).length;

  return (
    <div className="fade-in py-6 space-y-6">
      <div className="text-center space-y-1">
        <p className="text-sm text-stone-400 dark:text-stone-500">{greeting}</p>
        <h2 className="font-display text-3xl font-bold tracking-tight">Peter & Jess's<br/>Adventures</h2>
        <p className="text-sm text-stone-400 dark:text-stone-500 mt-2">Your journey together, gamified ✨</p>
      </div>

      {/* Level card */}
      <div className="bg-gradient-to-br from-stone-100 to-stone-50 dark:from-stone-900 dark:to-stone-800 rounded-2xl p-5 border border-stone-200 dark:border-stone-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-rose-400 flex items-center justify-center text-white font-bold text-lg shadow-lg">{level}</div>
            <div>
              <p className="text-xs text-stone-400 uppercase tracking-wider font-medium">Adventure Level</p>
              <p className="font-display text-xl font-semibold">{data.points} points</p>
            </div>
          </div>
          <Flame className="w-6 h-6 text-amber-400" />
        </div>
        <div className="w-full bg-stone-200 dark:bg-stone-700 rounded-full h-2.5 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-amber-400 to-rose-400 rounded-full transition-all duration-1000 ease-out" style={{ width: `${levelProgress}%` }} />
        </div>
        <p className="text-xs text-stone-400 mt-2 text-right">{100 - levelProgress} points to level {level + 1}</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Quests", value: totalQuests, icon: Trophy, color: "text-amber-500" },
          { label: "Places", value: stats.restaurants, icon: Utensils, color: "text-rose-500" },
          { label: "Memories", value: stats.mapPins, icon: Camera, color: "text-sky-500" },
          { label: "Wishes", value: stats.bucketItems, icon: Star, color: "text-violet-500" },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-stone-900 rounded-xl p-3 text-center border border-stone-100 dark:border-stone-800">
            <s.icon className={`w-4 h-4 mx-auto mb-1 ${s.color}`} />
            <p className="text-xl font-semibold">{s.value}</p>
            <p className="text-[10px] text-stone-400 uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Badges */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-lg font-semibold">Badges</h3>
          <span className="text-xs text-stone-400">{earnedBadges.length}/{BADGE_DEFINITIONS.length}</span>
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          {BADGE_DEFINITIONS.map(b => {
            const earned = earnedBadges.find(e => e.id === b.id);
            return (
              <div key={b.id} className={`flex-shrink-0 w-20 py-3 rounded-xl text-center border transition-all ${earned ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800" : "bg-stone-100 dark:bg-stone-900 border-stone-200 dark:border-stone-800 opacity-40"}`}>
                <span className="text-2xl">{b.icon}</span>
                <p className="text-[9px] mt-1 font-medium leading-tight px-1">{b.title}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick actions */}
      <div className="space-y-2">
        <h3 className="font-display text-lg font-semibold">Quick Start</h3>
        {[
          { label: "Start a new quest", tab: "quests", icon: Trophy, color: "bg-amber-400" },
          { label: "Log a restaurant visit", tab: "food", icon: Utensils, color: "bg-rose-400" },
          { label: "Save a memory", tab: "map", icon: Camera, color: "bg-sky-400" },
          { label: "Add to bucket list", tab: "bucket", icon: Star, color: "bg-violet-400" },
        ].map(a => (
          <button key={a.tab} onClick={() => setTab(a.tab)}
            className="w-full flex items-center gap-3 p-3 bg-white dark:bg-stone-900 rounded-xl border border-stone-100 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-600 transition-all group">
            <div className={`w-9 h-9 rounded-lg ${a.color} flex items-center justify-center`}>
              <a.icon className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium flex-1 text-left">{a.label}</span>
            <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-stone-500 transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── QUESTS TAB ───
function QuestsTab({ data, save, checkNewBadges, stats }) {
  const [filter, setFilter] = useState("available");

  const completeQuest = (quest) => {
    const newQuests = [...data.quests];
    const idx = newQuests.findIndex(q => q.id === quest.id);
    if (idx >= 0) {
      newQuests[idx] = { ...newQuests[idx], completed: true, completedDate: new Date().toISOString() };
    } else {
      newQuests.push({ ...quest, completed: true, completedDate: new Date().toISOString() });
    }
    const newPoints = data.points + quest.points;
    const newData = { ...data, quests: newQuests, points: newPoints };
    const newStats = { ...stats, completedQuests: newQuests.filter(q => q.completed).length, points: newPoints };
    checkNewBadges(newStats);
    save(newData);
  };

  const completedIds = data.quests.filter(q => q.completed).map(q => q.id);
  const available = QUEST_TEMPLATES.filter(q => !completedIds.includes(q.id));
  const completed = data.quests.filter(q => q.completed);

  return (
    <div className="fade-in py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Quests</h2>
        <div className="flex items-center gap-1.5 text-sm">
          <Trophy className="w-4 h-4 text-amber-500" />
          <span className="font-semibold">{data.points}</span>
          <span className="text-stone-400">pts</span>
        </div>
      </div>

      <div className="flex gap-2">
        {["available", "completed"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider transition-all ${filter === f ? "bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900" : "bg-stone-100 dark:bg-stone-800 text-stone-500"}`}>
            {f} ({f === "available" ? available.length : completed.length})
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filter === "available" ? (
          available.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="w-8 h-8 text-amber-400 mx-auto mb-3" />
              <p className="font-display text-lg font-semibold">All quests completed!</p>
              <p className="text-sm text-stone-400">You two are amazing 🎉</p>
            </div>
          ) : available.map(q => {
            const Icon = ICON_MAP[q.icon] || Star;
            const colors = CATEGORY_COLORS[q.category] || CATEGORY_COLORS.fun;
            return (
              <div key={q.id} className={`p-4 rounded-xl border ${colors.border} ${colors.bg} flex items-center gap-3 group`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors.bg} border ${colors.border}`}>
                  <Icon className={`w-5 h-5 ${colors.text}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-snug">{q.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] uppercase tracking-wider font-medium ${colors.text}`}>{q.category}</span>
                    <span className="text-[10px] text-stone-400">•</span>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">+{q.points} pts</span>
                  </div>
                </div>
                <button onClick={() => completeQuest(q)}
                  className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100">
                  <Check className="w-5 h-5 text-emerald-500" />
                </button>
              </div>
            );
          })
        ) : (
          completed.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-8 h-8 text-stone-300 mx-auto mb-3" />
              <p className="text-sm text-stone-400">No quests completed yet. Start your first adventure!</p>
            </div>
          ) : completed.map(q => {
            const template = QUEST_TEMPLATES.find(t => t.id === q.id);
            return (
              <div key={q.id} className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex items-center gap-3 opacity-70">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium line-through">{template?.title || q.title}</p>
                  <p className="text-[10px] text-stone-400 mt-0.5">{new Date(q.completedDate).toLocaleDateString()}</p>
                </div>
                <span className="text-xs text-amber-500 font-medium">+{template?.points || q.points}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── FOOD TAB ───
function FoodTab({ data, save, formOpen, setFormOpen, checkNewBadges, stats }) {
  const [foodTab, setFoodTab] = useState("restaurants");
  const [form, setForm] = useState({ name: "", rating: 5, cuisine: "", notes: "", date: new Date().toISOString().slice(0, 10) });

  const addItem = () => {
    if (!form.name.trim()) return;
    const item = { ...form, id: Date.now().toString() };
    const key = foodTab === "restaurants" ? "restaurants" : "recipes";
    const newList = [...data[key], item];
    const newData = { ...data, [key]: newList };
    const newStats = { ...stats, [key]: newList.length };
    checkNewBadges(newStats);
    save(newData);
    setForm({ name: "", rating: 5, cuisine: "", notes: "", date: new Date().toISOString().slice(0, 10) });
    setFormOpen(false);
  };

  const deleteItem = (id) => {
    const key = foodTab === "restaurants" ? "restaurants" : "recipes";
    save({ ...data, [key]: data[key].filter(i => i.id !== id) });
  };

  const items = foodTab === "restaurants" ? data.restaurants : data.recipes;

  return (
    <div className="fade-in py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">{foodTab === "restaurants" ? "Restaurants" : "Recipes"}</h2>
        <button onClick={() => setFormOpen(!formOpen)} className="w-9 h-9 rounded-full bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900 flex items-center justify-center hover:scale-105 transition-transform">
          {formOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex gap-2">
        {["restaurants", "recipes"].map(f => (
          <button key={f} onClick={() => { setFoodTab(f); setFormOpen(false); }}
            className={`px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider transition-all ${foodTab === f ? "bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900" : "bg-stone-100 dark:bg-stone-800 text-stone-500"}`}>
            {f} ({f === "restaurants" ? data.restaurants.length : data.recipes.length})
          </button>
        ))}
      </div>

      {formOpen && (
        <div className="fade-in bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4 space-y-3">
          <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder={foodTab === "restaurants" ? "Restaurant name" : "Recipe name"}
            className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
          <input value={form.cuisine} onChange={e => setForm({...form, cuisine: e.target.value})} placeholder="Cuisine type"
            className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
          <div className="flex items-center gap-3">
            <span className="text-sm text-stone-500">Rating:</span>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setForm({...form, rating: n})}>
                  <Star className={`w-5 h-5 transition-colors ${n <= form.rating ? "text-amber-400 fill-amber-400" : "text-stone-300 dark:text-stone-600"}`} />
                </button>
              ))}
            </div>
          </div>
          <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Notes..." rows={2}
            className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none" />
          <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})}
            className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
          <button onClick={addItem} className="w-full py-2.5 bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            Add {foodTab === "restaurants" ? "Restaurant" : "Recipe"}
          </button>
        </div>
      )}

      <div className="space-y-2">
        {items.length === 0 ? (
          <div className="text-center py-12">
            <Utensils className="w-8 h-8 text-stone-300 mx-auto mb-3" />
            <p className="text-sm text-stone-400">No {foodTab} logged yet.</p>
            <p className="text-xs text-stone-300 mt-1">Tap + to add your first one!</p>
          </div>
        ) : [...items].reverse().map(item => (
          <div key={item.id} className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 group">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-medium text-sm">{item.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  {item.cuisine && <span className="text-[10px] uppercase tracking-wider text-stone-400 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-full">{item.cuisine}</span>}
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(n => <Star key={n} className={`w-3 h-3 ${n <= item.rating ? "text-amber-400 fill-amber-400" : "text-stone-200 dark:text-stone-700"}`} />)}
                  </div>
                </div>
                {item.notes && <p className="text-xs text-stone-400 mt-1.5 leading-relaxed">{item.notes}</p>}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-stone-300">{item.date}</span>
                <button onClick={() => deleteItem(item.id)} className="p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-3.5 h-3.5 text-stone-300 hover:text-rose-400 transition-colors" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAP / MEMORIES TAB ───
function MapTab({ data, save, formOpen, setFormOpen, checkNewBadges, stats }) {
  const [form, setForm] = useState({ title: "", location: "", date: new Date().toISOString().slice(0, 10), notes: "", emoji: "📍" });
  const emojis = ["📍", "✈️", "🏖️", "🏔️", "🏛️", "🎡", "🌅", "🍽️", "☕", "🎭", "🎵", "💑"];

  const addMemory = () => {
    if (!form.title.trim()) return;
    const pin = { ...form, id: Date.now().toString() };
    const newPins = [...data.mapPins, pin];
    const newData = { ...data, mapPins: newPins };
    const newStats = { ...stats, mapPins: newPins.length };
    checkNewBadges(newStats);
    save(newData);
    setForm({ title: "", location: "", date: new Date().toISOString().slice(0, 10), notes: "", emoji: "📍" });
    setFormOpen(false);
  };

  const deleteMemory = (id) => {
    save({ ...data, mapPins: data.mapPins.filter(p => p.id !== id) });
  };

  return (
    <div className="fade-in py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Memories</h2>
        <button onClick={() => setFormOpen(!formOpen)} className="w-9 h-9 rounded-full bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900 flex items-center justify-center hover:scale-105 transition-transform">
          {formOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>
      </div>

      <p className="text-sm text-stone-400">Every place, every moment — saved forever.</p>

      {formOpen && (
        <div className="fade-in bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4 space-y-3">
          <div className="flex gap-2 flex-wrap">
            {emojis.map(e => (
              <button key={e} onClick={() => setForm({...form, emoji: e})}
                className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${form.emoji === e ? "bg-stone-800 dark:bg-stone-200 scale-110" : "bg-stone-100 dark:bg-stone-800 hover:bg-stone-200"}`}>
                {e}
              </button>
            ))}
          </div>
          <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Memory title (e.g. 'First trip to Vienna')"
            className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300" />
          <input value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="Location"
            className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300" />
          <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="What made this special..." rows={2}
            className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 resize-none" />
          <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})}
            className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300" />
          <button onClick={addMemory} className="w-full py-2.5 bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            Save Memory
          </button>
        </div>
      )}

      <div className="space-y-0">
        {data.mapPins.length === 0 ? (
          <div className="text-center py-12">
            <Camera className="w-8 h-8 text-stone-300 mx-auto mb-3" />
            <p className="text-sm text-stone-400">No memories yet.</p>
            <p className="text-xs text-stone-300 mt-1">Start pinning your favorite moments together!</p>
          </div>
        ) : [...data.mapPins].reverse().map((pin, i) => (
          <div key={pin.id} className="flex gap-3 group">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-lg flex-shrink-0">
                {pin.emoji}
              </div>
              {i < data.mapPins.length - 1 && <div className="w-px flex-1 bg-stone-200 dark:bg-stone-800 my-1" />}
            </div>
            <div className="pb-4 flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-sm">{pin.title}</p>
                  {pin.location && <p className="text-xs text-stone-400 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{pin.location}</p>}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-stone-300">{pin.date}</span>
                  <button onClick={() => deleteMemory(pin.id)} className="p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-3.5 h-3.5 text-stone-300 hover:text-rose-400 transition-colors" />
                  </button>
                </div>
              </div>
              {pin.notes && <p className="text-xs text-stone-400 mt-1 leading-relaxed bg-stone-50 dark:bg-stone-900 rounded-lg p-2.5 border border-stone-100 dark:border-stone-800">{pin.notes}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── BUCKET LIST TAB ───
function BucketTab({ data, save, formOpen, setFormOpen, checkNewBadges, stats }) {
  const [form, setForm] = useState({ title: "", category: "travel" });
  const categories = ["travel", "food", "cooking", "explore", "fun"];

  const addItem = () => {
    if (!form.title.trim()) return;
    const item = { ...form, id: Date.now().toString(), completed: false };
    const newList = [...data.bucketList, item];
    const newData = { ...data, bucketList: newList };
    const newStats = { ...stats, bucketItems: newList.length };
    checkNewBadges(newStats);
    save(newData);
    setForm({ title: "", category: "travel" });
    setFormOpen(false);
  };

  const toggleItem = (id) => {
    const newList = data.bucketList.map(i => i.id === id ? { ...i, completed: !i.completed, completedDate: !i.completed ? new Date().toISOString() : null } : i);
    const newData = { ...data, bucketList: newList, points: data.points + (newList.find(i => i.id === id).completed ? 10 : -10) };
    const newStats = { ...stats, completedBucket: newList.filter(b => b.completed).length, points: newData.points };
    checkNewBadges(newStats);
    save(newData);
  };

  const deleteItem = (id) => {
    save({ ...data, bucketList: data.bucketList.filter(i => i.id !== id) });
  };

  const pending = data.bucketList.filter(i => !i.completed);
  const done = data.bucketList.filter(i => i.completed);

  return (
    <div className="fade-in py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Bucket List</h2>
        <button onClick={() => setFormOpen(!formOpen)} className="w-9 h-9 rounded-full bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900 flex items-center justify-center hover:scale-105 transition-transform">
          {formOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>
      </div>

      <p className="text-sm text-stone-400">Dreams you want to chase together.</p>

      {formOpen && (
        <div className="fade-in bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4 space-y-3">
          <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="What's on your wish list?"
            className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300" />
          <div className="flex gap-2 flex-wrap">
            {categories.map(c => {
              const colors = CATEGORY_COLORS[c];
              return (
                <button key={c} onClick={() => setForm({...form, category: c})}
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-all ${form.category === c ? `${colors.bg} ${colors.text} ${colors.border} border` : "bg-stone-100 dark:bg-stone-800 text-stone-400"}`}>
                  {c}
                </button>
              );
            })}
          </div>
          <button onClick={addItem} className="w-full py-2.5 bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            Add to List
          </button>
        </div>
      )}

      {data.bucketList.length === 0 ? (
        <div className="text-center py-12">
          <Star className="w-8 h-8 text-stone-300 mx-auto mb-3" />
          <p className="text-sm text-stone-400">Your bucket list is empty.</p>
          <p className="text-xs text-stone-300 mt-1">What do you two dream of doing?</p>
        </div>
      ) : (
        <>
          {pending.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs text-stone-400 uppercase tracking-wider font-medium">To Do ({pending.length})</p>
              {pending.map(item => {
                const colors = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.fun;
                return (
                  <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 group">
                    <button onClick={() => toggleItem(item.id)}>
                      <Circle className="w-5 h-5 text-stone-300 hover:text-violet-400 transition-colors" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{item.title}</p>
                      <span className={`text-[10px] uppercase tracking-wider font-medium ${colors.text}`}>{item.category}</span>
                    </div>
                    <button onClick={() => deleteItem(item.id)} className="p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-3.5 h-3.5 text-stone-300 hover:text-rose-400 transition-colors" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          {done.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs text-stone-400 uppercase tracking-wider font-medium">Done ({done.length}) 🎉</p>
              {done.map(item => (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl border border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/50 group opacity-60">
                  <button onClick={() => toggleItem(item.id)}>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </button>
                  <p className="text-sm line-through flex-1">{item.title}</p>
                  <button onClick={() => deleteItem(item.id)} className="p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-3.5 h-3.5 text-stone-300 hover:text-rose-400 transition-colors" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
