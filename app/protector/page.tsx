"use client";
import React, { useEffect } from "react";
import { useUser } from "../components/userContext";
import { useRouter } from "next/navigation";

interface ProtectedRouteProps {
  allowedRoles: ("admin" | "vendedor" | "usuario")[];
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { user, isAuthenticated } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (user && !allowedRoles.includes(user.rol)) {
      router.push("/");
    }
  }, [user, isAuthenticated, router, allowedRoles]);

  if (!user || !allowedRoles.includes(user.rol)) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
