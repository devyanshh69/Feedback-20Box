import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CheckCircle2,
  CircleUser,
  LogIn,
  MessageSquare,
  ThumbsUp,
  User,
  PlusCircle,
  Home,
  Filter,
  ShieldCheck,
  ShieldX,
  XCircle,
  Check,
  BarChart3,
  LogOut,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

// Types
type Role = "student" | "admin";

type Comment = {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: number;
};

type Feedback = {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  category: string;
  customCategory?: string;
  content: string;
  status: "pending" | "accepted" | "denied";
  votes: string[]; // userIds who upvoted
  comments: Comment[];
  createdAt: number;
};

type UserType = {
  id: string;
  role: Role;
  email?: string;
  username?: string;
  name: string;
  avatar?: string; // emoji avatar
};

// Local storage keys
const LS_KEYS = {
  feedbacks: "afb_feedbacks",
  anonCounter: "afb_anonCounter",
  studentNameByEmail: (email: string) => `afb_student_${email}`,
  currentUser: "afb_currentUser",
} as const;

const CATEGORIES = [
  "faculty",
  "food and mess",
  "sports",
  "academics",
  "facilities",
  "others",
] as const;

const CATEGORY_LABELS: Record<string, string> = {
  faculty: "Faculty",
  "food and mess": "Food and Mess",
  sports: "Sports",
  academics: "Academics",
  facilities: "Facilities",
  others: "Others",
};

const CATEGORY_STYLES: Record<
  string,
  { bg: string; border: string; text: string }
> = {
  faculty: {
    bg: "bg-indigo-500/15",
    border: "border-indigo-400/30",
    text: "text-indigo-300",
  },
  "food and mess": {
    bg: "bg-amber-500/15",
    border: "border-amber-400/30",
    text: "text-amber-300",
  },
  sports: {
    bg: "bg-emerald-500/15",
    border: "border-emerald-400/30",
    text: "text-emerald-300",
  },
  academics: {
    bg: "bg-sky-500/15",
    border: "border-sky-400/30",
    text: "text-sky-300",
  },
  facilities: {
    bg: "bg-violet-500/15",
    border: "border-violet-400/30",
    text: "text-violet-300",
  },
  others: {
    bg: "bg-slate-500/15",
    border: "border-slate-400/30",
    text: "text-slate-300",
  },
};

const AVATARS = [
  "🧑🏻",
  "🧑🏼",
  "🧑🏽",
  "🧑🏾",
  "🧑🏿",
  "👩🏻",
  "👩🏼",
  "👩🏽",
  "👩🏾",
  "👨🏻",
  "👨🏼",
  "👨🏽",
];

function genId(prefix: string = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`;
}

function loadFeedbacks(): Feedback[] {
  try {
    const raw = localStorage.getItem(LS_KEYS.feedbacks);
    return raw ? (JSON.parse(raw) as Feedback[]) : [];
  } catch {
    return [];
  }
}
function saveFeedbacks(list: Feedback[]) {
  localStorage.setItem(LS_KEYS.feedbacks, JSON.stringify(list));
}

function assignAnonymousName(email: string): string {
  // If already assigned, reuse
  const existing = localStorage.getItem(LS_KEYS.studentNameByEmail(email));
  if (existing) return existing;
  const n = Number(localStorage.getItem(LS_KEYS.anonCounter) || "122");
  const next = n + 1;
  localStorage.setItem(LS_KEYS.anonCounter, String(next));
  const name = `Anonymous${next}`;
  localStorage.setItem(LS_KEYS.studentNameByEmail(email), name);
  return name;
}

function LoginView({ onLogin }: { onLogin: (user: UserType) => void }) {
  const [tab, setTab] = useState<Role>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string>(AVATARS[0]);

  function handleStudentLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }
    const name = assignAnonymousName(email);
    const user: UserType = {
      id: `stu_${email.toLowerCase()}`,
      role: "student",
      email,
      name,
      avatar,
    };
    localStorage.setItem(LS_KEYS.currentUser, JSON.stringify(user));
    onLogin(user);
  }

  function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault();
    if (username === "admin@123" && adminPass === "adm123") {
      const user: UserType = {
        id: "admin",
        role: "admin",
        username,
        name: "Administrator",
      };
      localStorage.setItem(LS_KEYS.currentUser, JSON.stringify(user));
      onLogin(user);
      setError(null);
    } else {
      setError("Invalid admin credentials");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="absolute top-6 left-0 right-0 text-center px-6">
        <h1 className="text-2xl md:text-3xl font-extrabold drop-shadow-sm">
          Anonymous Feedback Box
        </h1>
      </div>
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-stretch">
        <div className="hidden md:flex flex-col justify-between p-8 rounded-2xl glass drop-shadow-glow">
          <div>
            <div className="inline-flex items-center gap-2 text-sm text-white/70 mb-6">
              <MessageSquare className="w-4 h-4" />
              Anonymous Feedback Box
            </div>
            <h1 className="text-4xl font-extrabold leading-tight">
              Speak Freely. Stay Anonymous.
            </h1>
            <p className="mt-4 text-white/80">
              Share your thoughts on faculty, food and mess, sports, academics,
              facilities, or anything else. Your identity remains hidden while
              your voice helps improve the community.
            </p>
          </div>
          <div className="flex items-center gap-3 mt-10">
            <div className="h-10 w-10 rounded-full bg-violet-500/40 animate-float" />
            <div className="h-10 w-10 rounded-full bg-cyan-400/30 animate-float [animation-delay:300ms]" />
            <div className="h-10 w-10 rounded-full bg-fuchsia-500/30 animate-float [animation-delay:600ms]" />
          </div>
        </div>

        <div className="p-6 md:p-8 rounded-2xl glass">
          <div className="flex gap-2 mb-6">
            <button
              className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                tab === "student"
                  ? "bg-white/15 text-white"
                  : "bg-white/5 text-white/70 hover:bg-white/10"
              }`}
              onClick={() => setTab("student")}
            >
              Student
            </button>
            <button
              className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                tab === "admin"
                  ? "bg-white/15 text-white"
                  : "bg-white/5 text-white/70 hover:bg-white/10"
              }`}
              onClick={() => setTab("admin")}
            >
              Admin
            </button>
          </div>

          {tab === "student" ? (
            <form onSubmit={handleStudentLogin} className="space-y-4">
              <div>
                <label className="block text-sm text-white/70 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/60"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/60"
                  placeholder="••••••••"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-2">
                  Choose your avatar
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {AVATARS.map((a) => (
                    <button
                      type="button"
                      key={a}
                      onClick={() => setAvatar(a)}
                      className={`grid place-items-center h-10 rounded-xl border transition ${
                        avatar === a
                          ? "bg-white/20 border-white/30"
                          : "bg-white/10 border-white/10 hover:bg-white/15"
                      }`}
                    >
                      <span className="text-lg leading-none select-none">
                        {a}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button type="submit" className="btn-primary w-full">
                <LogIn className="w-4 h-4" /> Login as Student
              </button>
            </form>
          ) : (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-sm text-white/70 mb-1">
                  <p>Username </p>
                </label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/60"
                  placeholder=""
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1">
                  <p>Password </p>
                </label>
                <input
                  type="password"
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/60"
                  placeholder=""
                />
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button type="submit" className="btn-primary w-full">
                <ShieldCheck className="w-4 h-4" /> Login as Admin
              </button>
            </form>
          )}

          <p className="mt-6 text-xs text-white/60">
            <br />
          </p>
        </div>
      </div>
    </div>
  );
}

function AvatarBubble({ emoji, size = 36 }: { emoji?: string; size?: number }) {
  return (
    <div
      style={{ width: size, height: size, fontSize: Math.floor(size * 0.55) }}
      className="shrink-0 grid place-items-center rounded-xl bg-white/10 border border-white/10"
    >
      <span className="leading-none select-none">{emoji || "👤"}</span>
    </div>
  );
}

function LogoutConfirmModal({ isOpen, onClose, onConfirm, userName }: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center min-h-screen p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative glass rounded-xl p-6 w-full max-w-md transform transition-all duration-200 scale-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-red-500/20 border border-red-400/30 flex items-center justify-center">
            <LogOut className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Confirm Logout</h3>
            <p className="text-sm text-white/70">Are you sure you want to logout?</p>
          </div>
        </div>
        <p className="text-sm text-white/80 mb-6">
          You will be logged out as <span className="font-medium">{userName}</span> and redirected to the login page.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white/90 hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 rounded-lg bg-red-500/20 border border-red-400/30 text-red-300 hover:bg-red-500/30 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

function Header({
  user,
  onLogout,
  notifications,
}: {
  user: UserType;
  onLogout: () => void;
  notifications?: { id: string; text: string; status: Feedback["status"] }[];
}) {
  const [open, setOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const hasAlert = notifications?.some((n) => n.status !== "pending");

  const handleLogout = () => {
    setShowLogoutModal(false);
    onLogout();
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 10) {
        // Always show header at top
        setIsHeaderVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down and past 100px - hide header
        setIsHeaderVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up - show header
        setIsHeaderVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);
  return (
    <header className={`sticky top-0 z-40 transition-transform duration-300 ease-in-out ${
      isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
    }`}>
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <a
          href="#"
          className="inline-flex items-center gap-2 font-extrabold text-lg"
        >
          <div
            className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 drop-shadow-glow sm:bg-gradient-to-br"
            style={{
              backgroundImage: window.innerWidth <= 640 ? 'url(https://cdn.builder.io/api/v1/image/assets%2Fe23b91e5618940f6856f4b7325f6f25e%2F33e18f4ea18f4977b34451309cc83ce7)' : undefined,
              backgroundRepeat: window.innerWidth <= 640 ? 'no-repeat' : undefined,
              backgroundPosition: window.innerWidth <= 640 ? 'center' : undefined,
              backgroundSize: window.innerWidth <= 640 ? 'cover' : undefined,
            }}
          />
          Anonymous Feedback Box
        </a>
        <div className="flex items-center gap-3">
          {user.role === "student" && (
            <div className="relative">
              <button
                onClick={() => setOpen((v) => !v)}
                className="btn-ghost relative"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {hasAlert && (
                  <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-background" />
                )}
              </button>
              {open && (
                <div className="absolute right-0 mt-2 w-80 p-4 glass rounded-xl">
                  <p className="text-sm font-semibold mb-3">Notifications</p>
                  <div className="space-y-3 max-h-72 overflow-auto pr-1">
                    {notifications && notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div key={n.id} className="flex items-start gap-3">
                          <span
                            className={`mt-1 h-2.5 w-2.5 rounded-full ${
                              n.status === "accepted"
                                ? "bg-emerald-400"
                                : n.status === "denied"
                                  ? "bg-red-400"
                                  : "bg-white/30"
                            }`}
                          />
                          <p className="text-sm text-white/90">{n.text}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-white/70">No updates yet.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="hidden sm:flex items-center gap-3 px-3 py-2 rounded-xl glass">
            <AvatarBubble emoji={user.avatar} size={28} />
            <span className="text-sm">{user.name}</span>
          </div>
          <button onClick={() => setShowLogoutModal(true)} className="btn-ghost">
            Logout
          </button>
        </div>
      </div>
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        userName={user.name}
      />
    </header>
  );
}

function CategoryChip({ label }: { label: string }) {
  const key = label.toLowerCase();
  const style = CATEGORY_STYLES[key] || CATEGORY_STYLES["others"];
  const display = CATEGORY_LABELS[key] || label;
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs border ${style.bg} ${style.border} ${style.text}`}
    >
      {display}
    </span>
  );
}

function FeedbackCard({
  fb,
  canModerate,
  onUpvote,
  onComment,
  onAccept,
  onDeny,
  currentUserId,
}: {
  fb: Feedback;
  canModerate?: boolean;
  onUpvote?: () => void;
  onComment?: (text: string) => void;
  onAccept?: () => void;
  onDeny?: () => void;
  currentUserId?: string;
}) {
  const [showComments, setShowComments] = useState(false);
  const [text, setText] = useState("");
  const voted = currentUserId ? fb.votes.includes(currentUserId) : false;

  return (
    <div className="glass rounded-xl p-4 md:p-5 space-y-3">
      <div className="flex items-center gap-3">
        <AvatarBubble emoji={fb.authorAvatar} size={36} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold truncate">{fb.authorName}</p>
            <CategoryChip label={fb.customCategory || fb.category} />
            <span
              className={`ml-auto inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border ${
                fb.status === "accepted"
                  ? "text-emerald-300 bg-emerald-500/10 border-emerald-400/30"
                  : fb.status === "denied"
                    ? "text-red-300 bg-red-500/10 border-red-400/30"
                    : "text-white/70 bg-white/5 border-white/10"
              }`}
            >
              {fb.status === "accepted" ? (
                <Check className="w-3 h-3" />
              ) : fb.status === "denied" ? (
                <XCircle className="w-3 h-3" />
              ) : (
                <Filter className="w-3 h-3" />
              )}
              {fb.status}
            </span>
          </div>
          <p className="text-sm text-white/90 mt-1 whitespace-pre-wrap">
            {fb.content}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        {onUpvote && (
          <button
            onClick={onUpvote}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition ${
              voted
                ? "bg-emerald-500/15 border-emerald-400/30 text-emerald-300"
                : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
            }`}
          >
            <ThumbsUp className="w-4 h-4" /> {fb.votes.length}
          </button>
        )}
        <button
          onClick={() => setShowComments((v) => !v)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
        >
          <MessageSquare className="w-4 h-4" /> {fb.comments.length}
        </button>
        {canModerate && (
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={onAccept}
              className="group relative overflow-hidden inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-emerald-400/30 text-emerald-300 bg-emerald-500/15 hover:scale-[1.02] transition"
            >
              <span className="absolute inset-0 opacity-20 bg-shimmer-gradient bg-[length:200%_100%] group-hover:animate-shimmer" />
              <CheckCircle2 className="w-4 h-4 relative" /> Accept
            </button>
            <button
              onClick={onDeny}
              className="group relative overflow-hidden inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-red-400/30 text-red-300 bg-red-500/15 hover:scale-[1.02] transition"
            >
              <span className="absolute inset-0 opacity-20 bg-shimmer-gradient bg-[length:200%_100%] group-hover:animate-shimmer" />
              <ShieldX className="w-4 h-4 relative" /> Deny
            </button>
          </div>
        )}
      </div>

      {showComments && (
        <div className="pt-2 space-y-3">
          <div className="space-y-2">
            {fb.comments.map((c) => (
              <div key={c.id} className="flex items-start gap-2">
                <div className="h-7 w-7 rounded-full bg-white/10" />
                <div>
                  <p className="text-xs text-white/70">{c.authorName}</p>
                  <p className="text-sm text-white/90">{c.text}</p>
                </div>
              </div>
            ))}
            {fb.comments.length === 0 && (
              <p className="text-sm text-white/60">No comments yet.</p>
            )}
          </div>
          {onComment && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!text.trim()) return;
                onComment(text.trim());
                setText("");
              }}
              className="flex items-center gap-2"
            >
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/60"
              />
              <button className="btn-primary">
                <MessageSquare className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

function StudentDashboard({
  user,
  onLogout,
}: {
  user: UserType;
  onLogout: () => void;
}) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(loadFeedbacks());
  const [active, setActive] = useState<"feed" | "new" | "profile">("feed");
  const [selCat, setSelCat] = useState<string>("faculty");
  const [customCat, setCustomCat] = useState<string>("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    saveFeedbacks(feedbacks);
  }, [feedbacks]);

  const myPosts = useMemo(
    () => feedbacks.filter((f) => f.authorId === user.id),
    [feedbacks, user.id],
  );
  const notifications = myPosts.map((p) => ({
    id: p.id,
    text: p.content.slice(0, 80),
    status: p.status,
  }));

  function submitFeedback(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const content = (fd.get("content") as string).trim();
    if (!content) return;
    const item: Feedback = {
      id: genId("fb"),
      authorId: user.id,
      authorName: user.name,
      authorAvatar: user.avatar,
      category: selCat,
      customCategory: selCat === "others" && customCat ? customCat : undefined,
      content,
      status: "pending",
      votes: [],
      comments: [],
      createdAt: Date.now(),
    };
    setFeedbacks((prev) => [item, ...prev]);
    setSelCat("faculty");
    setCustomCat("");
    (e.currentTarget as HTMLFormElement).reset();
    setActive("feed");
  }

  function toggleVote(id: string) {
    setFeedbacks((prev) =>
      prev.map((f) =>
        f.id === id
          ? {
              ...f,
              votes: f.votes.includes(user.id)
                ? f.votes.filter((v) => v !== user.id)
                : [...f.votes, user.id],
            }
          : f,
      ),
    );
  }

  function addComment(id: string, text: string) {
    const c: Comment = {
      id: genId("c"),
      authorId: user.id,
      authorName: user.name,
      text,
      createdAt: Date.now(),
    };
    setFeedbacks((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, comments: [...f.comments, c] } : f,
      ),
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <Header user={user} onLogout={onLogout} notifications={notifications} />

      <main className="container mx-auto px-4 grid lg:grid-cols-3 gap-6 mt-6">
        {/* Feed / New */}
        <section className="lg:col-span-2 space-y-4">
          {active === "new" && (
            <form
              onSubmit={submitFeedback}
              className="glass rounded-xl p-4 md:p-6 space-y-4"
            >
              <h2 className="text-lg font-semibold">Submit New Feedback</h2>
              <div className="space-y-3">
                <div className="relative">
                  <label className="block text-sm text-white/70 mb-1">
                    Category
                  </label>
                  <button
                    type="button"
                    onClick={() => setMenuOpen((v) => !v)}
                    className="w-full justify-between inline-flex items-center px-3 py-2 rounded-lg border bg-white/10 border-white/10 hover:bg-white/15"
                  >
                    <span className="text-white/90">
                      {CATEGORY_LABELS[selCat]}
                    </span>
                    <svg
                      className="w-4 h-4 opacity-70"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                  {menuOpen && (
                    <div className="absolute z-20 mt-2 w-full backdrop-blur-xl border border-white/10 shadow-lg bg-black rounded-lg p-1 max-h-56 overflow-auto">
                      {CATEGORIES.map((c) => {
                        const s = CATEGORY_STYLES[c];
                        return (
                          <button
                            type="button"
                            key={c}
                            onClick={() => {
                              setSelCat(c);
                              setMenuOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-md border ${s.bg} ${s.border} ${s.text} hover:bg-white/10`}
                          >
                            {CATEGORY_LABELS[c]}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                {selCat === "others" && (
                  <div>
                    <label className="block text-sm text-white/70 mb-1">
                      Other topic
                    </label>
                    <input
                      value={customCat}
                      onChange={(e) => setCustomCat(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/60"
                      placeholder="Write your own topic"
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1">
                  Your feedback
                </label>
                <textarea
                  name="content"
                  className="w-full min-h-[120px] px-3 py-2 rounded-lg bg-white/10 border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/60"
                  placeholder="Share details..."
                />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-white/60">Posted as {user.name}</p>
                <button className="btn-primary">
                  <PlusCircle className="w-4 h-4" /> Submit
                </button>
              </div>
            </form>
          )}

          {active === "feed" && (
            <div className="space-y-4">
              {feedbacks.length === 0 && (
                <div className="glass rounded-xl p-6 text-white/70">
                  No feedback yet. Be the first to post!
                </div>
              )}
              {feedbacks.map((fb) => (
                <FeedbackCard
                  key={fb.id}
                  fb={fb}
                  currentUserId={user.id}
                  onUpvote={() => toggleVote(fb.id)}
                  onComment={(text) => addComment(fb.id, text)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Profile Sidebar */}
        <aside className="lg:col-span-1 space-y-4">
          <div className="glass rounded-xl p-5">
            <div className="flex items-center gap-3">
              <AvatarBubble emoji={user.avatar} size={48} />
              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-xs text-white/70">Anonymous profile</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-semibold mb-2">Pick avatar</p>
              <div className="grid grid-cols-6 gap-2">
                {AVATARS.map((a) => (
                  <button
                    key={a}
                    className={`grid place-items-center h-10 rounded-xl border transition ${
                      user.avatar === a
                        ? "bg-white/20 border-white/30"
                        : "bg-white/10 border-white/10 hover:bg-white/15"
                    }`}
                    onClick={() => {
                      const updated = { ...user, avatar: a };
                      localStorage.setItem(
                        LS_KEYS.currentUser,
                        JSON.stringify(updated),
                      );
                      window.dispatchEvent(new StorageEvent("storage"));
                    }}
                  >
                    <span className="text-lg leading-none select-none">
                      {a}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-semibold mb-2">Your feedback</p>
              <div className="space-y-2 max-h-64 overflow-auto">
                {myPosts.length === 0 && (
                  <p className="text-sm text-white/60">
                    You haven't shared anything yet.
                  </p>
                )}
                {myPosts.map((p) => (
                  <div key={p.id} className="flex items-start gap-2">
                    <span
                      className={`mt-1 h-2.5 w-2.5 rounded-full ${
                        p.status === "accepted"
                          ? "bg-emerald-400"
                          : p.status === "denied"
                            ? "bg-red-400"
                            : "bg-white/30"
                      }`}
                    />
                    <p
                      className="text-sm text-white/80 truncate"
                      title={p.content}
                    >
                      {p.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="glass rounded-xl p-5">
            <p className="text-sm text-white/70">
              Hover the bottom icons to see labels. Your name stays hidden as
              you participate in community posts.
            </p>
          </div>
        </aside>
      </main>

      {/* Bottom taskbar */}
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 glass rounded-2xl px-4 py-2 flex items-center gap-4">
        <button
          onClick={() => setActive("feed")}
          className={`tooltip-blur ${active === "feed" ? "text-white" : "text-white/70"}`}
          data-title="Community"
        >
          <Home className="w-6 h-6" />
        </button>
        <button
          onClick={() => setActive("new")}
          className={`tooltip-blur ${active === "new" ? "text-white" : "text-white/70"}`}
          data-title="Submit"
        >
          <PlusCircle className="w-6 h-6" />
        </button>
        <button
          onClick={() => setActive("profile")}
          className={`tooltip-blur ${active === "profile" ? "text-white" : "text-white/70"}`}
          data-title="My Profile"
        >
          <User className="w-6 h-6" />
        </button>
      </nav>
    </div>
  );
}

function AdminDashboard({
  user,
  onLogout,
}: {
  user: UserType;
  onLogout: () => void;
}) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(loadFeedbacks());
  const [filter, setFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<'feedback' | 'statistics'>('feedback');

  useEffect(() => {
    saveFeedbacks(feedbacks);
  }, [feedbacks]);

  const categories = useMemo(() => {
    const base = new Set<string>([...CATEGORIES]);
    feedbacks.forEach((f) => {
      if (f.customCategory) base.add(f.customCategory);
      if (f.category === "custom") base.add("others");
    });
    return ["all", ...Array.from(base)];
  }, [feedbacks]);

  const visible = feedbacks.filter((f) =>
    filter === "all"
      ? true
      : f.category === filter || f.customCategory === filter,
  );

  function setStatus(id: string, status: Feedback["status"]) {
    setFeedbacks((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status } : f)),
    );
  }

  const analytics = useMemo(() => {
    const byCat: Record<
      string,
      {
        category: string;
        pending: number;
        accepted: number;
        denied: number;
        total: number;
      }
    > = {};
    feedbacks.forEach((f) => {
      const key = f.customCategory || f.category;
      if (!byCat[key])
        byCat[key] = {
          category: key,
          pending: 0,
          accepted: 0,
          denied: 0,
          total: 0,
        };
      byCat[key][f.status] += 1 as any;
      byCat[key].total += 1;
    });
    return Object.values(byCat).sort((a, b) => b.total - a.total);
  }, [feedbacks]);

  return (
    <div className="min-h-screen">
      <Header user={user} onLogout={onLogout} />

      <div className="container mx-auto px-4 mt-6">
        {/* Tab Navigation */}
        <div className="glass rounded-xl p-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('feedback')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                activeTab === 'feedback'
                  ? 'bg-white/15 text-white'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Feedback Review
            </button>
            <button
              onClick={() => setActiveTab('statistics')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                activeTab === 'statistics'
                  ? 'bg-white/15 text-white'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Statistics
            </button>
          </div>
        </div>

        {activeTab === 'feedback' && (
          <div className="grid lg:grid-cols-[260px_1fr] gap-6">
            {/* Taskbar / Sidebar */}
            <aside className="glass rounded-xl p-4 h-fit sticky top-20">
              <p className="font-semibold mb-3 flex items-center gap-2">
                <Filter className="w-4 h-4" /> Categories
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-1 gap-2">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setFilter(c)}
                    className={`px-3 py-2 rounded-lg text-left border transition ${
                      filter === c
                        ? "bg-white/15 border-white/15"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    {c === "all" ? "All" : CATEGORY_LABELS[c] || c}
                  </button>
                ))}
              </div>
            </aside>

            {/* Main content */}
            <main className="space-y-4">
              <div className="glass rounded-xl p-4">
                <p className="text-sm text-white/80">
                  Review student feedback. Accept or deny below each post. Buttons
                  animate on hover.
                </p>
              </div>

              {visible.length === 0 && (
                <div className="glass rounded-xl p-6 text-white/70">
                  No feedback to review.
                </div>
              )}
              {visible.map((fb) => (
                <FeedbackCard
                  key={fb.id}
                  fb={fb}
                  canModerate
                  onAccept={() => setStatus(fb.id, "accepted")}
                  onDeny={() => setStatus(fb.id, "denied")}
                />
              ))}
            </main>
          </div>
        )}

        {activeTab === 'statistics' && (
          <div className="space-y-6">
            <div className="glass rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Feedback Analytics
              </h2>
              <p className="text-sm text-white/80 mb-6">
                Overview of feedback submissions by category and status.
              </p>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.08)"
                    />
                    <XAxis
                      dataKey="category"
                      stroke="rgba(255,255,255,0.7)"
                      tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }}
                    />
                    <YAxis
                      stroke="rgba(255,255,255,0.7)"
                      tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(0,0,0,0.8)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 10,
                        color: "white",
                      }}
                    />
                    <Legend wrapperStyle={{ color: "white" }} />
                    <Bar dataKey="accepted" stackId="a" fill="#34d399" name="Accepted" />
                    <Bar dataKey="denied" stackId="a" fill="#f87171" name="Denied" />
                    <Bar dataKey="pending" stackId="a" fill="#a78bfa" name="Pending" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="glass rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-sm font-semibold">Accepted</span>
                </div>
                <p className="text-2xl font-bold text-emerald-400">
                  {feedbacks.filter(f => f.status === 'accepted').length}
                </p>
              </div>

              <div className="glass rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-red-500/20 border border-red-400/30 flex items-center justify-center">
                    <XCircle className="w-4 h-4 text-red-400" />
                  </div>
                  <span className="text-sm font-semibold">Denied</span>
                </div>
                <p className="text-2xl font-bold text-red-400">
                  {feedbacks.filter(f => f.status === 'denied').length}
                </p>
              </div>

              <div className="glass rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-violet-500/20 border border-violet-400/30 flex items-center justify-center">
                    <Filter className="w-4 h-4 text-violet-400" />
                  </div>
                  <span className="text-sm font-semibold">Pending</span>
                </div>
                <p className="text-2xl font-bold text-violet-400">
                  {feedbacks.filter(f => f.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Index() {
  const [user, setUser] = useState<UserType | null>(() => {
    try {
      const raw = localStorage.getItem(LS_KEYS.currentUser);
      return raw ? (JSON.parse(raw) as UserType) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const onStorage = () => {
      try {
        const raw = localStorage.getItem(LS_KEYS.currentUser);
        setUser(raw ? (JSON.parse(raw) as UserType) : null);
      } catch {}
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  if (!user) {
    return <LoginView onLogin={setUser} />;
  }

  function logout() {
    localStorage.removeItem(LS_KEYS.currentUser);
    setUser(null);
  }

  if (user.role === "student") {
    return <StudentDashboard user={user} onLogout={logout} />;
  }
  return <AdminDashboard user={user} onLogout={logout} />;
}
