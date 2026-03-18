import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { auth, isAllowedAdminUser, waitForAuthReady } from "@/lib/firebase";
import { ADMIN_LOGIN_PATH } from "@/lib/adminRoute";

type Props = {
  children: React.ReactNode;
};

const RequireAdminAuth = ({ children }: Props) => {
  const [loading, setLoading] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    let mounted = true;
    void waitForAuthReady().then((user) => {
      if (!mounted) return;
      setIsAllowed(isAllowedAdminUser(user));
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground font-mono">
        Checking admin access...
      </div>
    );
  }

  if (!auth.currentUser || !isAllowed || !isAllowedAdminUser(auth.currentUser)) {
    return <Navigate to={ADMIN_LOGIN_PATH} replace />;
  }

  return <>{children}</>;
};

export default RequireAdminAuth;
