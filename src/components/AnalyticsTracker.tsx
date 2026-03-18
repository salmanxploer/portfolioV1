import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageVisit } from "@/lib/visitorAnalytics";
import { trackFirebaseEvent } from "@/lib/firebase";

const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    const pagePath = `${location.pathname}${location.search}`;
    trackPageVisit(pagePath);
    void trackFirebaseEvent("page_view", {
      page_path: pagePath,
      page_title: typeof document !== "undefined" ? document.title : "",
    });
  }, [location.pathname, location.search]);

  return null;
};

export default AnalyticsTracker;
