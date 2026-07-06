"use client";

import { useEffect, useState } from "react";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export function useAuthUser() {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser({
      id: "seed-admin",
      name: "Administrador",
      email: "admin@alffaeducacao.com",
      role: "ADMIN"
    });
  }, []);

  return user;
}
