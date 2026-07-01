"use client";

import { useQuery } from "react-query";
import { getAdminSession } from "@/data/admin-auth";

export const ADMIN_SESSION_KEY = ["admin-session"] as const;

export function useAdminSession() {
  return useQuery(ADMIN_SESSION_KEY, () => getAdminSession());
}
