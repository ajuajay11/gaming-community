import type { AccountStatus, KycStatus } from "@/services/types";

/**
 * Backend mirrors `gaming backend/src/constants/userStatus.js`:
 *   KYC_STATUS   = { NOT_SUBMITTED: 0, PENDING: 1, APPROVED: 2, REJECTED: 3 }
 *   ACCOUNT_STATUS = { PENDING: 0, ACTIVE: 1, SUSPENDED: 2, DEACTIVATED: 3 }
 */
export const KYC = {
  NOT_SUBMITTED: 0,
  PENDING: 1,
  APPROVED: 2,
  REJECTED: 3,
} as const;

export const ACCOUNT = {
  PENDING: 0,
  ACTIVE: 1,
  SUSPENDED: 2,
  DEACTIVATED: 3,
} as const;

const KYC_LABELS: Record<number, string> = {
  [KYC.NOT_SUBMITTED]: "Not submitted",
  [KYC.PENDING]: "Under review",
  [KYC.APPROVED]: "Verified",
  [KYC.REJECTED]: "Rejected",
};

const ACCOUNT_LABELS: Record<number, string> = {
  [ACCOUNT.PENDING]: "Pending",
  [ACCOUNT.ACTIVE]: "Active",
  [ACCOUNT.SUSPENDED]: "Suspended",
  [ACCOUNT.DEACTIVATED]: "Deactivated",
};

export function kycLabel(status?: KycStatus | number | null): string {
  if (status == null) return KYC_LABELS[KYC.NOT_SUBMITTED];
  return KYC_LABELS[Number(status)] ?? "Unknown";
}

export function accountLabel(status?: AccountStatus | number | null): string {
  if (status == null) return ACCOUNT_LABELS[ACCOUNT.PENDING];
  return ACCOUNT_LABELS[Number(status)] ?? "Unknown";
}
