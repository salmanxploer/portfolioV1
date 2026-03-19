import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from "firebase/auth";
import { Bell, BookOpen, Brain, CalendarClock, Check, Cloud, Home, LockKeyhole, Plus, Send, ShieldCheck, Sparkles, Trash2 } from "lucide-react";

type Reminder = {
  id: string;
  subject: string;
  title: string;
  details: string;
  date: string;
  time: string;
  done: boolean;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

type ChatResponse = {
  reply?: string;
  error?: string;
};

type CloudStudyDoc = {
  updatedAt: string;
  selectedSubject: string;
  subjects: string[];
  reminderEmail: string;
  notesByKey: Record<string, string>;
  reminders: Reminder[];
  chatBySubject: Record<string, ChatMessage[]>;
};

const STORAGE_PREFIX = "study-hub-v2";
const PROFILE_ID_KEY = `${STORAGE_PREFIX}-profile-id`;
const SUBJECTS_KEY = `${STORAGE_PREFIX}-subjects`;
const SELECTED_SUBJECT_KEY = `${STORAGE_PREFIX}-selected-subject`;
const NOTES_KEY = `${STORAGE_PREFIX}-notes-by-key`;
const REMINDERS_KEY = `${STORAGE_PREFIX}-reminders`;
const CHAT_KEY = `${STORAGE_PREFIX}-chat-by-subject`;
const REMINDER_EMAIL_KEY = `${STORAGE_PREFIX}-reminder-email`;
const BROWSER_NOTIFY_MAP_KEY = `${STORAGE_PREFIX}-browser-notify-map`;
const EMAIL_NOTIFY_MAP_KEY = `${STORAGE_PREFIX}-email-notify-map`;

const DEFAULT_SUBJECTS = ["General", "Math", "Programming"];

const toDateKey = (value: Date) => value.toISOString().slice(0, 10);

const formatDateLabel = (dateKey: string) => {
  const date = new Date(`${dateKey}T00:00:00`);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};

const safeReadJson = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const safeWriteJson = (key: string, value: unknown) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
};

const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const makeChatMessage = (role: ChatMessage["role"], text: string): ChatMessage => ({
  id: `${role}-${makeId()}`,
  role,
  text,
});

const buildWelcomeForSubject = (subject: string) =>
  makeChatMessage(
    "assistant",
    `Study assistant ready for ${subject}. Ask for explanations, revision plans, quizzes, or memory techniques.`
  );

const getOrCreateProfileId = () => {
  if (typeof window === "undefined") return "";
  const existing = localStorage.getItem(PROFILE_ID_KEY);
  if (existing) return existing;
  const next = `study-${makeId()}`;
  localStorage.setItem(PROFILE_ID_KEY, next);
  return next;
};

const postAssistantMessage = async (payload: Record<string, unknown>) => {
  const tryEndpoint = async (url: string) => {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const raw = await response.text();
    const data = (() => {
      try {
        return raw ? (JSON.parse(raw) as ChatResponse) : {};
      } catch {
        return { error: raw || "Non-JSON response" } as ChatResponse;
      }
    })();

    if (!response.ok) {
      throw new Error(data.error || `Chat request failed at ${url} (${response.status}).`);
    }

    return String(data.reply || "").trim();
  };

  try {
    return await tryEndpoint("/.netlify/functions/chat-assistant");
  } catch (firstError) {
    try {
      return await tryEndpoint("/api/chat-assistant");
    } catch (secondError) {
      try {
        if (typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname)) {
          return await tryEndpoint("http://localhost:3001/api/chat-assistant");
        }
      } catch (thirdError) {
        try {
          return await tryEndpoint("https://salmanhafiz.me/.netlify/functions/chat-assistant");
        } catch (fourthError) {
          const firstMessage = firstError instanceof Error ? firstError.message : "Unknown function error";
          const secondMessage = secondError instanceof Error ? secondError.message : "Unknown api error";
          const thirdMessage = thirdError instanceof Error ? thirdError.message : "Unknown local error";
          const fourthMessage = fourthError instanceof Error ? fourthError.message : "Unknown production fallback error";
          throw new Error(`${firstMessage} | ${secondMessage} | ${thirdMessage} | ${fourthMessage}`);
        }
      }

      const firstMessage = firstError instanceof Error ? firstError.message : "Unknown function error";
      const secondMessage = secondError instanceof Error ? secondError.message : "Unknown api error";
      throw new Error(`${firstMessage} | ${secondMessage}`);
    }
  }
};

const postReminderEmail = async (payload: {
  email: string;
  subjectName: string;
  title: string;
  details: string;
  date: string;
  time: string;
}) => {
  const url = import.meta.env.DEV ? "http://localhost:3001/api/send-email" : "/.netlify/functions/send-email";
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "study-reminder", ...payload }),
  });

  if (!response.ok) {
    const raw = await response.text();
    throw new Error(raw || "Reminder email request failed.");
  }
};

const buildStudyFallbackReply = (input: string, subject: string, noteSnippet: string) => {
  const value = input.toLowerCase();

  if (value.includes("plan") || value.includes("schedule") || value.includes("routine")) {
    return [
      `Offline study coach mode for ${subject}.`,
      "1. 25 min concept review",
      "2. 20 min active recall",
      "3. 20 min practice questions",
      "4. 10 min error log update",
      "Do this for 2 to 3 cycles today and finish with a 5-question self-quiz.",
    ].join("\n");
  }

  if (value.includes("quiz") || value.includes("test") || value.includes("mcq")) {
    return [
      `Quick ${subject} quiz starter:`,
      "1. Explain the topic in 3 lines from memory.",
      "2. Solve one easy, one medium, one hard problem.",
      "3. Mark weak points and revise only those for 20 minutes.",
      "Reply with your topic name and I will generate custom questions.",
    ].join("\n");
  }

  if (value.includes("summar") || value.includes("revise")) {
    const compact = noteSnippet.trim();
    if (compact) {
      return `Offline summary from your notes: ${compact.slice(0, 420)}${compact.length > 420 ? "..." : ""}`;
    }
    return `No saved notes found for ${subject} today. Add key points and ask again for a concise summary.`;
  }

  return [
    `AI endpoint is temporarily unavailable, but offline coach mode is active for ${subject}.`,
    "Tell me one of these: study plan, quiz me, summarize notes, or exam strategy.",
  ].join(" ");
};

const StudyHub = () => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [studyUser, setStudyUser] = useState<User | null>(null);
  const [studyEmail, setStudyEmail] = useState("");
  const [studyPassword, setStudyPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [profileId, setProfileId] = useState("");
  const [cloudStatus, setCloudStatus] = useState("Cloud sync idle");
  const [cloudLoaded, setCloudLoaded] = useState(false);

  const [subjects, setSubjects] = useState<string[]>(() => safeReadJson(SUBJECTS_KEY, DEFAULT_SUBJECTS));
  const [newSubject, setNewSubject] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>(() => safeReadJson(SELECTED_SUBJECT_KEY, "General"));

  const [notesByKey, setNotesByKey] = useState<Record<string, string>>(() => safeReadJson(NOTES_KEY, {}));
  const [reminders, setReminders] = useState<Reminder[]>(() => safeReadJson(REMINDERS_KEY, []));
  const [chatBySubject, setChatBySubject] = useState<Record<string, ChatMessage[]>>(() => safeReadJson(CHAT_KEY, {}));
  const [reminderEmail, setReminderEmail] = useState<string>(() => safeReadJson(REMINDER_EMAIL_KEY, ""));

  const [browserNotifyMap, setBrowserNotifyMap] = useState<Record<string, boolean>>(() =>
    safeReadJson(BROWSER_NOTIFY_MAP_KEY, {})
  );
  const [emailNotifyMap, setEmailNotifyMap] = useState<Record<string, boolean>>(() => safeReadJson(EMAIL_NOTIFY_MAP_KEY, {}));

  const [reminderTitle, setReminderTitle] = useState("");
  const [reminderTime, setReminderTime] = useState("");
  const [reminderDetails, setReminderDetails] = useState("");

  const [chatInput, setChatInput] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setStudyUser(user);
      setIsUnlocked(Boolean(user));
      setIsAuthLoading(false);

      if (user) {
        const safeUid = String(user.uid || "").replace(/[^A-Za-z0-9-]/g, "");
        setProfileId(`study-${safeUid}`);
      } else {
        setProfileId("");
      }
    });

    return () => unsubscribe();
  }, []);

  const loginToStudy = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = studyEmail.trim();
    const password = studyPassword.trim();

    if (!email || !password) {
      setAuthError("Enter email and password.");
      return;
    }

    try {
      setAuthError("");
      await signInWithEmailAndPassword(auth, email, password);
      setStudyPassword("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sign in failed";
      setAuthError(message);
    }
  };

  const lockStudyHub = async () => {
    await signOut(auth).catch(() => undefined);
    setStudyPassword("");
  };

  useEffect(() => {
    if (isUnlocked) return;
    const id = getOrCreateProfileId();
    if (!studyUser) {
      setProfileId(id);
    }
  }, [isUnlocked, studyUser]);

  useEffect(() => {
    if (!subjects.length) {
      setSubjects(["General"]);
      setSelectedSubject("General");
      return;
    }

    if (!subjects.includes(selectedSubject)) {
      setSelectedSubject(subjects[0]);
    }
  }, [selectedSubject, subjects]);

  useEffect(() => {
    if (!selectedSubject) return;
    setChatBySubject((prev) => {
      if (prev[selectedSubject]?.length) return prev;
      return { ...prev, [selectedSubject]: [buildWelcomeForSubject(selectedSubject)] };
    });
  }, [selectedSubject]);

  useEffect(() => safeWriteJson(SUBJECTS_KEY, subjects), [subjects]);
  useEffect(() => safeWriteJson(SELECTED_SUBJECT_KEY, selectedSubject), [selectedSubject]);
  useEffect(() => safeWriteJson(NOTES_KEY, notesByKey), [notesByKey]);
  useEffect(() => safeWriteJson(REMINDERS_KEY, reminders), [reminders]);
  useEffect(() => safeWriteJson(CHAT_KEY, chatBySubject), [chatBySubject]);
  useEffect(() => safeWriteJson(REMINDER_EMAIL_KEY, reminderEmail), [reminderEmail]);
  useEffect(() => safeWriteJson(BROWSER_NOTIFY_MAP_KEY, browserNotifyMap), [browserNotifyMap]);
  useEffect(() => safeWriteJson(EMAIL_NOTIFY_MAP_KEY, emailNotifyMap), [emailNotifyMap]);

  useEffect(() => {
    if (!isUnlocked) return;
    if (!profileId || cloudLoaded) return;

    const loadCloudState = async () => {
        setCloudStatus("Loading cloud data...");
        let loaded = false;
      try {
        const docRef = doc(db, "studyHub", profileId);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          const cloud = snapshot.data() as Partial<CloudStudyDoc>;
          if (Array.isArray(cloud.subjects) && cloud.subjects.length) {
            setSubjects(Array.from(new Set(cloud.subjects.map((item) => String(item || "").trim()).filter(Boolean))));
          }
          if (typeof cloud.selectedSubject === "string" && cloud.selectedSubject.trim()) {
            setSelectedSubject(cloud.selectedSubject.trim());
          }
          if (typeof cloud.reminderEmail === "string") {
            setReminderEmail(cloud.reminderEmail);
          }
          if (cloud.notesByKey && typeof cloud.notesByKey === "object") {
            setNotesByKey((prev) => ({ ...prev, ...cloud.notesByKey }));
          }
          if (Array.isArray(cloud.reminders)) {
            const normalizedReminders = cloud.reminders
              .map((item) => ({
                id: String(item.id || makeId()),
                subject: String(item.subject || "General"),
                title: String(item.title || "").trim(),
                details: String(item.details || ""),
                date: String(item.date || ""),
                time: String(item.time || ""),
                done: Boolean(item.done),
              }))
              .filter((item) => item.title && item.date);
            setReminders(normalizedReminders);
          }
          if (cloud.chatBySubject && typeof cloud.chatBySubject === "object") {
            setChatBySubject((prev) => ({ ...prev, ...cloud.chatBySubject }));
          }
          setCloudStatus("Cloud sync active");
          loaded = true;
        } else {
          setCloudStatus("Cloud profile ready");
          loaded = true;
        }
      } catch {
        setCloudStatus("Cloud sync unavailable");
      } finally {
        setCloudLoaded(loaded);
      }
    };

    void loadCloudState();
  }, [cloudLoaded, isUnlocked, profileId]);

  useEffect(() => {
    if (!isUnlocked) return;
    if (!profileId || !cloudLoaded) return;

    const timer = window.setTimeout(async () => {
      try {
        const payload: CloudStudyDoc = {
          updatedAt: new Date().toISOString(),
          selectedSubject,
          subjects,
          reminderEmail,
          notesByKey,
          reminders,
          chatBySubject,
        };
        await setDoc(doc(db, "studyHub", profileId), payload, { merge: true });
        setCloudStatus("Cloud sync active");
      } catch {
        setCloudStatus("Cloud sync unavailable");
      }
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [chatBySubject, cloudLoaded, isUnlocked, notesByKey, profileId, reminderEmail, reminders, selectedSubject, subjects]);

  const selectedDateKey = useMemo(() => toDateKey(selectedDate), [selectedDate]);
  const selectedNoteKey = useMemo(() => `${selectedSubject}::${selectedDateKey}`, [selectedDateKey, selectedSubject]);

  const selectedDayReminders = useMemo(() => {
    return reminders
      .filter((item) => item.subject === selectedSubject && item.date === selectedDateKey)
      .sort((a, b) => `${a.time || "99:99"}`.localeCompare(`${b.time || "99:99"}`));
  }, [reminders, selectedDateKey, selectedSubject]);

  const upcomingReminders = useMemo(() => {
    const todayKey = toDateKey(new Date());
    return reminders
      .filter((item) => !item.done && item.date >= todayKey)
      .sort((a, b) => `${a.date} ${a.time || "99:99"}`.localeCompare(`${b.date} ${b.time || "99:99"}`))
      .slice(0, 8);
  }, [reminders]);

  const completedCount = useMemo(() => reminders.filter((item) => item.done).length, [reminders]);
  const chatMessages = chatBySubject[selectedSubject] || [buildWelcomeForSubject(selectedSubject)];

  useEffect(() => {
    if (!isUnlocked) return;
    if (typeof window === "undefined") return;

    const interval = window.setInterval(() => {
      const now = Date.now();

      reminders.forEach((item) => {
        if (item.done || !item.time) return;

        const dueAt = new Date(`${item.date}T${item.time}:00`).getTime();
        if (Number.isNaN(dueAt)) return;

        const isDueNow = now >= dueAt && now - dueAt < 5 * 60 * 1000;
        if (!isDueNow) return;

        if (
          typeof Notification !== "undefined" &&
          Notification.permission === "granted" &&
          !browserNotifyMap[item.id]
        ) {
          new Notification(`Study reminder: ${item.title}`, {
            body: `${item.subject}${item.details ? ` - ${item.details}` : ""}`,
          });
          setBrowserNotifyMap((prev) => ({ ...prev, [item.id]: true }));
        }

        if (reminderEmail && !emailNotifyMap[item.id]) {
          setEmailNotifyMap((prev) => ({ ...prev, [item.id]: true }));
          void postReminderEmail({
            email: reminderEmail,
            subjectName: item.subject,
            title: item.title,
            details: item.details,
            date: item.date,
            time: item.time,
          }).catch(() => undefined);
        }
      });
    }, 30_000);

    return () => window.clearInterval(interval);
  }, [browserNotifyMap, emailNotifyMap, isUnlocked, reminderEmail, reminders]);

  const addSubject = () => {
    const normalized = newSubject.trim();
    if (!normalized) return;
    if (subjects.includes(normalized)) {
      setSelectedSubject(normalized);
      setNewSubject("");
      return;
    }

    const next = [...subjects, normalized];
    setSubjects(next);
    setSelectedSubject(normalized);
    setNewSubject("");
  };

  const addReminder = () => {
    const title = reminderTitle.trim();
    if (!title) return;

    const nextReminder: Reminder = {
      id: `reminder-${makeId()}`,
      subject: selectedSubject,
      title,
      details: reminderDetails.trim(),
      date: selectedDateKey,
      time: reminderTime,
      done: false,
    };

    setReminders((prev) => [nextReminder, ...prev]);
    setReminderTitle("");
    setReminderDetails("");
    setReminderTime("");
  };

  const toggleReminderDone = (id: string) => {
    setReminders((prev) => prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item)));
  };

  const deleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((item) => item.id !== id));
  };

  const requestNotifications = async () => {
    if (typeof Notification === "undefined") return;
    await Notification.requestPermission();
  };

  const sendChat = async () => {
    const message = chatInput.trim();
    if (!message || isReplying) return;

    const nextUserMessage = makeChatMessage("user", message);
    setChatBySubject((prev) => ({
      ...prev,
      [selectedSubject]: [...(prev[selectedSubject] || [buildWelcomeForSubject(selectedSubject)]), nextUserMessage],
    }));

    setChatInput("");
    setIsReplying(true);

    try {
      const history = chatMessages.slice(-8).map((entry) => ({ role: entry.role, text: entry.text }));
      const noteSnippet = String(notesByKey[selectedNoteKey] || "").slice(0, 1200);
      const subjectUpcoming = reminders
        .filter((item) => item.subject === selectedSubject && !item.done)
        .slice(0, 5)
        .map((item) => `${item.date}${item.time ? ` ${item.time}` : ""} - ${item.title}`);

      const reply = await postAssistantMessage({
        message,
        history,
        mode: "study",
        subject: selectedSubject,
        studyContext: {
          selectedDate: selectedDateKey,
          noteSnippet,
          upcoming: subjectUpcoming,
        },
      });

      setChatBySubject((prev) => ({
        ...prev,
        [selectedSubject]: [
          ...(prev[selectedSubject] || [buildWelcomeForSubject(selectedSubject)]),
          makeChatMessage("assistant", reply || "I can help with a study plan. Tell me your target exam and timeline."),
        ],
      }));
    } catch {
      const fallbackReply = buildStudyFallbackReply(message, selectedSubject, String(notesByKey[selectedNoteKey] || ""));
      setChatBySubject((prev) => ({
        ...prev,
        [selectedSubject]: [
          ...(prev[selectedSubject] || [buildWelcomeForSubject(selectedSubject)]),
          makeChatMessage("assistant", fallbackReply),
        ],
      }));
    } finally {
      setIsReplying(false);
    }
  };

  const notificationPermission =
    typeof Notification === "undefined" ? "unsupported" : Notification.permission || "default";

  if (isAuthLoading) {
    return (
      <main className="min-h-screen bg-background relative overflow-x-hidden px-4 py-10">
        <div className="relative z-10 max-w-lg mx-auto">
          <Card className="border-border/70 bg-gradient-to-b from-card/90 to-card/60 backdrop-blur-2xl shadow-[0_25px_70px_hsl(220_45%_3%/0.45)]">
            <CardContent className="py-10 text-center text-sm text-muted-foreground font-mono">Checking auth session...</CardContent>
          </Card>
        </div>
      </main>
    );
  }

  if (!isUnlocked) {
    return (
      <main className="min-h-screen bg-background relative overflow-x-hidden px-4 py-10">
        <div
          className="pointer-events-none absolute inset-0 opacity-45"
          style={{
            backgroundImage:
              "radial-gradient(circle at 10% 15%, hsl(192 92% 66% / 0.2), transparent 35%), radial-gradient(circle at 90% 85%, hsl(266 85% 73% / 0.2), transparent 30%)",
          }}
        />

        <div className="relative z-10 max-w-lg mx-auto">
          <Card className="border-border/70 bg-gradient-to-b from-card/90 to-card/60 backdrop-blur-2xl shadow-[0_25px_70px_hsl(220_45%_3%/0.45)]">
            <CardHeader className="space-y-2">
              <Badge variant="outline" className="w-fit text-xs font-mono">// STUDY ACCESS</Badge>
              <CardTitle className="text-2xl flex items-center gap-2">
                <LockKeyhole className="w-5 h-5 text-primary" />
                Enter Study Hub
              </CardTitle>
              <CardDescription>
                Private study workspace. Sign in with your Firebase email/password account to continue.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={loginToStudy} className="space-y-3">
                <Input
                  type="email"
                  value={studyEmail}
                  onChange={(event) => {
                    setStudyEmail(event.target.value);
                    if (authError) setAuthError("");
                  }}
                  placeholder="Email"
                />
                <Input
                  type="password"
                  value={studyPassword}
                  onChange={(event) => {
                    setStudyPassword(event.target.value);
                    if (authError) setAuthError("");
                  }}
                  placeholder="Password"
                />
                {authError ? <p className="text-sm text-destructive">{authError}</p> : null}
                <div className="flex items-center gap-2">
                  <Button type="submit" className="flex-1 gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    Unlock Study
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/">
                      <Home className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Enable Email/Password in Firebase Auth and create your study user account.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background relative overflow-x-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-45"
        style={{
          backgroundImage:
            "radial-gradient(circle at 8% 8%, hsl(192 92% 66% / 0.2), transparent 36%), radial-gradient(circle at 88% 82%, hsl(266 85% 73% / 0.18), transparent 32%), linear-gradient(120deg, hsl(220 45% 7% / 0.5), transparent)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 md:py-10">
        <header className="flex flex-wrap items-center justify-between gap-3 mb-6 md:mb-8">
          <div>
            <p className="text-xs md:text-sm font-mono tracking-wider text-primary/80">// STUDY URL</p>
            <h1 className="text-3xl md:text-4xl font-bold mt-1">Study Hub</h1>
            <p className="text-sm md:text-base text-muted-foreground mt-2 max-w-2xl">
              Calendar planning, subject folders, cloud sync, reminders, notes, and an always-on AI study sidebar.
            </p>
            <p className="text-xs text-muted-foreground mt-1">Signed in as {studyUser?.email || "study user"}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1 text-xs bg-background/50">
              <Cloud className="w-3.5 h-3.5" />
              {cloudStatus}
            </Badge>
            <Button asChild variant="outline" className="gap-2">
              <Link to="/">
                <Home className="w-4 h-4" />
                Back to Portfolio
              </Link>
            </Button>
            <Button variant="outline" className="gap-2" onClick={lockStudyHub}>
              <LockKeyhole className="w-4 h-4" />
              Lock
            </Button>
          </div>
        </header>

        <section className="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)_360px] gap-5 lg:gap-6">
          <div className="space-y-5">
            <Card className="border-border/70 bg-gradient-to-b from-card/85 to-card/55 backdrop-blur-2xl shadow-[0_20px_60px_hsl(220_45%_3%/0.35)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Subject Folders
                </CardTitle>
                <CardDescription>Switch context across courses and topics.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Input
                    value={newSubject}
                    onChange={(event) => setNewSubject(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addSubject();
                      }
                    }}
                    placeholder="Add subject (e.g. Physics)"
                  />
                  <Button size="icon" onClick={addSubject} aria-label="Add subject">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {subjects.map((subject) => (
                    <button
                      key={subject}
                      type="button"
                      onClick={() => setSelectedSubject(subject)}
                      className={`px-3 py-1.5 rounded-full text-xs border transition ${
                        selectedSubject === subject
                          ? "border-primary/60 bg-primary/15 text-primary"
                          : "border-border bg-background/40 text-muted-foreground"
                      }`}
                    >
                      {subject}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-gradient-to-b from-card/85 to-card/55 backdrop-blur-2xl shadow-[0_20px_60px_hsl(220_45%_3%/0.35)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarClock className="w-5 h-5 text-primary" />
                  Calendar
                </CardTitle>
                <CardDescription>Subject: {selectedSubject}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-border/70 bg-background/40">
                  <Calendar mode="single" selected={selectedDate} onSelect={(date) => date && setSelectedDate(date)} className="mx-auto" />
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg border border-border/70 bg-background/40 p-2.5">
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="text-lg font-semibold">{reminders.length}</p>
                  </div>
                  <div className="rounded-lg border border-border/70 bg-background/40 p-2.5">
                    <p className="text-xs text-muted-foreground">Done</p>
                    <p className="text-lg font-semibold text-emerald-400">{completedCount}</p>
                  </div>
                  <div className="rounded-lg border border-border/70 bg-background/40 p-2.5">
                    <p className="text-xs text-muted-foreground">Today</p>
                    <p className="text-lg font-semibold text-cyan-400">{selectedDayReminders.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-gradient-to-b from-card/85 to-card/55 backdrop-blur-2xl shadow-[0_20px_60px_hsl(220_45%_3%/0.35)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Bell className="w-4.5 h-4.5 text-primary" />
                  Reminder Delivery
                </CardTitle>
                <CardDescription>Browser notifications and optional email reminders.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  type="email"
                  value={reminderEmail}
                  onChange={(event) => setReminderEmail(event.target.value.trim())}
                  placeholder="Your reminder email"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => void requestNotifications()}>
                    Enable Browser Alerts
                  </Button>
                  <Badge variant="outline">Permission: {notificationPermission}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-5 lg:space-y-6">
            <Card className="border-border/70 bg-gradient-to-b from-card/85 to-card/55 backdrop-blur-2xl shadow-[0_20px_60px_hsl(220_45%_3%/0.35)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Daily Notes
                </CardTitle>
                <CardDescription>
                  {selectedSubject} - {formatDateLabel(selectedDateKey)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  value={notesByKey[selectedNoteKey] || ""}
                  onChange={(event) =>
                    setNotesByKey((prev) => ({
                      ...prev,
                      [selectedNoteKey]: event.target.value,
                    }))
                  }
                  placeholder="Write class notes, formulas, key concepts, or revision checkpoints..."
                  className="min-h-[180px] md:min-h-[220px]"
                />
                <p className="text-xs text-muted-foreground">
                  Notes are auto-saved locally and synced to Firestore using profile id {profileId || "..."}.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-gradient-to-b from-card/85 to-card/55 backdrop-blur-2xl shadow-[0_20px_60px_hsl(220_45%_3%/0.35)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Reminders</CardTitle>
                <CardDescription>Create tasks for {selectedSubject} on {selectedDateKey}.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    value={reminderTitle}
                    onChange={(event) => setReminderTitle(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addReminder();
                      }
                    }}
                    placeholder="Reminder title"
                  />
                  <Input type="time" value={reminderTime} onChange={(event) => setReminderTime(event.target.value)} />
                </div>
                <Textarea
                  value={reminderDetails}
                  onChange={(event) => setReminderDetails(event.target.value)}
                  placeholder="Optional details..."
                  className="min-h-[84px]"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <Button onClick={addReminder}>Add Reminder</Button>
                  <Badge variant="outline">Subject: {selectedSubject}</Badge>
                </div>

                <div className="space-y-2">
                  {selectedDayReminders.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No reminders for this subject/date yet.</p>
                  ) : (
                    selectedDayReminders.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-lg border border-border/70 bg-background/40 p-3 flex items-start gap-3"
                      >
                        <button
                          type="button"
                          onClick={() => toggleReminderDone(item.id)}
                          className={`mt-1 h-5 w-5 rounded-full border inline-flex items-center justify-center ${
                            item.done ? "bg-emerald-500/20 border-emerald-400 text-emerald-300" : "border-border text-muted-foreground"
                          }`}
                          aria-label={item.done ? "Mark as pending" : "Mark as done"}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${item.done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                            {item.title}
                          </p>
                          <p className="text-[11px] text-primary/80 mt-0.5">{item.subject}</p>
                          {item.time ? <p className="text-xs text-cyan-400 mt-0.5">{item.time}</p> : null}
                          {item.details ? <p className="text-xs text-muted-foreground mt-1">{item.details}</p> : null}
                        </div>
                        <button
                          type="button"
                          onClick={() => deleteReminder(item.id)}
                          className="h-8 w-8 rounded-md border border-border text-muted-foreground hover:text-destructive hover:border-destructive/40 inline-flex items-center justify-center"
                          aria-label="Delete reminder"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/70 bg-gradient-to-b from-card/90 to-card/65 backdrop-blur-2xl xl:sticky xl:top-6 h-[520px] md:h-[640px] xl:h-[calc(100vh-3rem)] shadow-[0_25px_70px_hsl(220_45%_3%/0.45)]">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                AI Study Sidebar
              </CardTitle>
              <CardDescription>Subject-aware tutoring with notes and reminder context.</CardDescription>
              <div className="flex items-center gap-2 pt-1">
                <Badge variant="outline" className="text-[10px] font-mono bg-background/50">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Smart Context On
                </Badge>
                <Badge variant="outline" className="text-[10px] font-mono bg-background/50">
                  Subject: {selectedSubject}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0 h-[calc(100%-84px)] flex flex-col">
              <ScrollArea className="flex-1 px-4 py-3">
                <div className="space-y-2.5">
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`max-w-[92%] px-3 py-2 rounded-lg text-sm leading-relaxed ${
                        message.role === "user"
                          ? "ml-auto bg-primary/15 border border-primary/30"
                          : "mr-auto bg-background/70 border border-border/70 text-muted-foreground"
                      }`}
                    >
                      {message.text}
                    </div>
                  ))}
                  {isReplying ? <p className="text-xs text-muted-foreground font-mono">Thinking...</p> : null}
                </div>
              </ScrollArea>

              <div className="p-3 border-t border-border/60 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setChatInput(`Create a 7-day revision plan for ${selectedSubject}.`)}
                    disabled={isReplying}
                  >
                    7-day Plan
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setChatInput(`Quiz me on today's ${selectedSubject} notes.`)}
                    disabled={isReplying}
                  >
                    Teach + Quiz
                  </Button>
                </div>
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    void sendChat();
                  }}
                  className="flex items-center gap-2"
                >
                  <Input
                    value={chatInput}
                    onChange={(event) => setChatInput(event.target.value)}
                    placeholder="Ask for strategy, explanation, summary..."
                    disabled={isReplying}
                  />
                  <Button type="submit" size="icon" disabled={isReplying}>
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mt-5 md:mt-6">
          <Card className="border-border/70 bg-gradient-to-b from-card/85 to-card/55 backdrop-blur-2xl shadow-[0_20px_60px_hsl(220_45%_3%/0.35)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Upcoming Queue</CardTitle>
              <CardDescription>Pending reminders across all subjects.</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingReminders.length === 0 ? (
                <p className="text-sm text-muted-foreground">No pending reminders. Add one from the reminders panel.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {upcomingReminders.map((item) => (
                    <div key={item.id} className="rounded-lg border border-border/70 bg-background/40 p-3">
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-primary/80 mt-1">{item.subject}</p>
                      <p className="text-xs text-cyan-400 mt-1">
                        {item.date}
                        {item.time ? ` at ${item.time}` : ""}
                      </p>
                      {item.details ? <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{item.details}</p> : null}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
};

export default StudyHub;
