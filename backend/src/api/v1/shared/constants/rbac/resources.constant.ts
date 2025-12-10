export const RESOURCES = {
  USER: "user",
  ROLE: "role",
  PERMISSION: "permission",
} as const;

export type Resource = (typeof RESOURCES)[keyof typeof RESOURCES];
