import { PERMISSIONS } from "./permissions.constant";

export const ROLES = {
  ADMIN: "admin",
  MODERATOR: "moderator",
  USER: "user",
  GUEST: "guest",
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_DEFINITIONS = [
  {
    name: ROLES.ADMIN,
    description: "Administrator with full access",
    permissions: [
      PERMISSIONS.USER_MANAGE,
      PERMISSIONS.ROLE_READ,
      PERMISSIONS.ROLE_CREATE,
      PERMISSIONS.ROLE_UPDATE,
      PERMISSIONS.ROLE_DELETE,
    ],
  },
  {
    name: ROLES.MODERATOR,
    description: "Moderator with limited access",
    permissions: [PERMISSIONS.USER_READ, PERMISSIONS.USER_UPDATE],
  },
  {
    name: ROLES.USER,
    description: "Regular user",
    permissions: [],
  },
  {
    name: ROLES.GUEST,
    description: "Guest user with read-only access",
    permissions: [],
  },
] as const;
