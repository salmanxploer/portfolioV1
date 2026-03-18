import type { Handler } from "@netlify/functions";
import { getApp, getApps, initializeApp } from "firebase/app";
import { collection, getDocs, getFirestore } from "firebase/firestore";

type SitemapPost = {
  slug?: string;
  published?: boolean;
  publishedAt?: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
};

const SITE_URL = (process.env.SITE_URL || "https://salmanhafiz.me").replace(/\/$/, "");
const BLOG_COLLECTION = process.env.FIREBASE_BLOG_COLLECTION || "blogPosts";

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyDzWAex1ulipCrIIbMIoMALcOj4pNvcNXg",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "potfulio.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "potfulio",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "potfulio.firebasestorage.app",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "469816338057",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:469816338057:web:86d220fe1a6462eb218858",
};

const xmlEscape = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const normalizeDate = (value?: string | null) => {
  if (!value) return new Date().toISOString().slice(0, 10);
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return new Date().toISOString().slice(0, 10);
  return parsed.toISOString().slice(0, 10);
};

const isLivePost = (post: SitemapPost, now = Date.now()) => {
  if (!post.published) return false;
  if (!post.publishedAt) return true;
  const publishTime = Date.parse(post.publishedAt);
  if (Number.isNaN(publishTime)) return true;
  return publishTime <= now;
};

const cleanSlug = (slug: string) => slug.trim().replace(/^\/+/, "").replace(/\/+$/, "");

const toUrlNode = (loc: string, lastmod: string, changefreq: "daily" | "weekly" | "monthly", priority: string) => {
  return [
    "  <url>",
    `    <loc>${xmlEscape(loc)}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    "  </url>",
  ].join("\n");
};

const buildSitemapXml = (postUrls: Array<{ loc: string; lastmod: string }>) => {
  const staticUrls = [
    { loc: `${SITE_URL}/`, lastmod: new Date().toISOString().slice(0, 10), changefreq: "weekly" as const, priority: "1.0" },
    { loc: `${SITE_URL}/blog`, lastmod: new Date().toISOString().slice(0, 10), changefreq: "daily" as const, priority: "0.9" },
  ];

  const nodes = [
    ...staticUrls.map((entry) => toUrlNode(entry.loc, entry.lastmod, entry.changefreq, entry.priority)),
    ...postUrls.map((entry) => toUrlNode(entry.loc, entry.lastmod, "weekly", "0.8")),
  ];

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...nodes,
    "</urlset>",
  ].join("\n");
};

const getPostUrls = async () => {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const snapshot = await getDocs(collection(db, BLOG_COLLECTION));
  const now = Date.now();

  const posts = snapshot.docs
    .map((docSnap) => docSnap.data() as SitemapPost)
    .filter((post) => !!post.slug)
    .filter((post) => isLivePost(post, now));

  const unique = new Map<string, { loc: string; lastmod: string }>();

  for (const post of posts) {
    const slug = cleanSlug(String(post.slug));
    if (!slug) continue;
    const loc = `${SITE_URL}/blog/${slug}`;
    const lastmod = normalizeDate(post.updatedAt || post.publishedAt || post.createdAt);
    unique.set(loc, { loc, lastmod });
  }

  return Array.from(unique.values()).sort((a, b) => (a.loc > b.loc ? 1 : -1));
};

export const handler: Handler = async () => {
  try {
    const postUrls = await getPostUrls();
    const xml = buildSitemapXml(postUrls);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=300, s-maxage=900",
      },
      body: xml,
    };
  } catch (error) {
    console.error("[sitemap] Failed to build dynamic sitemap", error);

    const fallbackXml = buildSitemapXml([]);
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=120, s-maxage=300",
      },
      body: fallbackXml,
    };
  }
};
