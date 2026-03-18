import type { VisitorAnalytics } from "@/types/blog";

const VISITOR_KEY = "portfolio.analytics.visitor-id";
const ANALYTICS_KEY = "portfolio.analytics.stats";

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
};

const initialAnalytics = (): VisitorAnalytics => ({
  totalVisits: 0,
  uniqueVisitors: 0,
  pageViews: {},
  dailyVisits: {},
  lastVisitAt: new Date(0).toISOString(),
});

const todayKey = () => new Date().toISOString().slice(0, 10);

const readAnalytics = (): VisitorAnalytics => {
  const raw = localStorage.getItem(ANALYTICS_KEY);
  if (!raw) return initialAnalytics();
  try {
    const parsed = JSON.parse(raw) as VisitorAnalytics;
    return {
      ...initialAnalytics(),
      ...parsed,
      pageViews: parsed.pageViews || {},
      dailyVisits: parsed.dailyVisits || {},
    };
  } catch {
    return initialAnalytics();
  }
};

const writeAnalytics = (value: VisitorAnalytics) => {
  localStorage.setItem(ANALYTICS_KEY, JSON.stringify(value));
};

const ensureVisitorId = (): { id: string; isNew: boolean } => {
  const existing = localStorage.getItem(VISITOR_KEY);
  if (existing) return { id: existing, isNew: false };
  const id = `visitor-${createId()}`;
  localStorage.setItem(VISITOR_KEY, id);
  return { id, isNew: true };
};

export const trackPageVisit = (path: string) => {
  if (typeof window === "undefined") return;

  const { isNew } = ensureVisitorId();
  const analytics = readAnalytics();

  analytics.totalVisits += 1;
  if (isNew) analytics.uniqueVisitors += 1;

  analytics.pageViews[path] = (analytics.pageViews[path] || 0) + 1;

  const day = todayKey();
  analytics.dailyVisits[day] = (analytics.dailyVisits[day] || 0) + 1;
  analytics.lastVisitAt = new Date().toISOString();

  writeAnalytics(analytics);
};

export const getVisitorAnalytics = (): VisitorAnalytics => {
  if (typeof window === "undefined") return initialAnalytics();
  return readAnalytics();
};
