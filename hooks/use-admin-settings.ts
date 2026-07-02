"use client";

import { useMutation, useQuery, useQueryClient } from "react-query";
import {
  cancelAdminEmailChange,
  changeAdminPassword,
  getAdminProfile,
  requestAdminEmailChange,
  updateAdminName,
  updateAdminRole,
  verifyAdminEmailChange,
} from "@/data/admin-settings";
import type {
  ChangeAdminPasswordValues,
  RequestAdminEmailChangeValues,
  UpdateAdminNameValues,
  UpdateAdminRoleValues,
  VerifyAdminEmailChangeValues,
} from "@/validators/schemas/admin-settings";
import { ADMIN_SESSION_KEY } from "@/hooks/use-admin-session";

export const ADMIN_SETTINGS_KEYS = {
  all: ["admin-settings"] as const,
  profile: ["admin-settings", "profile"] as const,
};

function invalidateAdminQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries(ADMIN_SETTINGS_KEYS.all);
  queryClient.invalidateQueries(ADMIN_SESSION_KEY);
}

export function useAdminProfile() {
  return useQuery(ADMIN_SETTINGS_KEYS.profile, getAdminProfile);
}

export function useUpdateAdminName() {
  const queryClient = useQueryClient();
  return useMutation((data: UpdateAdminNameValues) => updateAdminName(data), {
    onSuccess: (result) => {
      if (result.success) invalidateAdminQueries(queryClient);
    },
  });
}

export function useRequestAdminEmailChange() {
  const queryClient = useQueryClient();
  return useMutation((data: RequestAdminEmailChangeValues) => requestAdminEmailChange(data), {
    onSuccess: (result) => {
      if (result.success) invalidateAdminQueries(queryClient);
    },
  });
}

export function useVerifyAdminEmailChange() {
  const queryClient = useQueryClient();
  return useMutation((data: VerifyAdminEmailChangeValues) => verifyAdminEmailChange(data), {
    onSuccess: (result) => {
      if (result.success) invalidateAdminQueries(queryClient);
    },
  });
}

export function useCancelAdminEmailChange() {
  const queryClient = useQueryClient();
  return useMutation(() => cancelAdminEmailChange(), {
    onSuccess: (result) => {
      if (result.success) invalidateAdminQueries(queryClient);
    },
  });
}

export function useChangeAdminPassword() {
  return useMutation((data: ChangeAdminPasswordValues) => changeAdminPassword(data));
}

export function useUpdateAdminRole() {
  const queryClient = useQueryClient();
  return useMutation((data: UpdateAdminRoleValues) => updateAdminRole(data), {
    onSuccess: (result) => {
      if (result.success) invalidateAdminQueries(queryClient);
    },
  });
}
