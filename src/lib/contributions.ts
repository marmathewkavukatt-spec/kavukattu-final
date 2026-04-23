export const CONTRIBUTION_TYPES = [
  "Testimonials",
  "Prayer Requests",
  "Intentions",
] as const;

export type ContributionType = (typeof CONTRIBUTION_TYPES)[number];

export const CONTRIBUTION_STATUSES = ["pending", "approved", "rejected"] as const;
export type ContributionStatus = (typeof CONTRIBUTION_STATUSES)[number];

export function isContributionType(value: string | null): value is ContributionType {
  return typeof value === "string" && (CONTRIBUTION_TYPES as readonly string[]).includes(value);
}

export function isContributionStatus(value: string | null): value is ContributionStatus {
  return typeof value === "string" && (CONTRIBUTION_STATUSES as readonly string[]).includes(value);
}
