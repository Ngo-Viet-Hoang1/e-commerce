import { ACTIONS, Action } from "./actions.constant";
import { RESOURCES, Resource } from "./resources.constant";

export const createPermission = (resource: Resource, action: Action) =>
  `${resource}:${action}` as const;

export const PERMISSIONS = {
  // User permissions
  USER_READ: createPermission(RESOURCES.USER, ACTIONS.READ),
  USER_CREATE: createPermission(RESOURCES.USER, ACTIONS.CREATE),
  USER_UPDATE: createPermission(RESOURCES.USER, ACTIONS.UPDATE),
  USER_DELETE: createPermission(RESOURCES.USER, ACTIONS.DELETE),
  USER_MANAGE: createPermission(RESOURCES.USER, ACTIONS.MANAGE),

  // Role permissions
  ROLE_READ: createPermission(RESOURCES.ROLE, ACTIONS.READ),
  ROLE_CREATE: createPermission(RESOURCES.ROLE, ACTIONS.CREATE),
  ROLE_UPDATE: createPermission(RESOURCES.ROLE, ACTIONS.UPDATE),
  ROLE_DELETE: createPermission(RESOURCES.ROLE, ACTIONS.DELETE),
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const PERMISSION_DEFINITIONS = [
  {
    key: "USER_READ",
    resource: RESOURCES.USER,
    action: ACTIONS.READ,
    description: "View user information",
  },
  {
    key: "USER_CREATE",
    resource: RESOURCES.USER,
    action: ACTIONS.CREATE,
    description: "Create new users",
  },
  {
    key: "USER_UPDATE",
    resource: RESOURCES.USER,
    action: ACTIONS.UPDATE,
    description: "Update user information",
  },
  {
    key: "USER_DELETE",
    resource: RESOURCES.USER,
    action: ACTIONS.DELETE,
    description: "Delete users",
  },
  {
    key: "USER_MANAGE",
    resource: RESOURCES.USER,
    action: ACTIONS.MANAGE,
    description: "Full user management",
  },

  {
    key: "ROLE_READ",
    resource: RESOURCES.ROLE,
    action: ACTIONS.READ,
    description: "View roles",
  },
  {
    key: "ROLE_CREATE",
    resource: RESOURCES.ROLE,
    action: ACTIONS.CREATE,
    description: "Create new roles",
  },
  {
    key: "ROLE_UPDATE",
    resource: RESOURCES.ROLE,
    action: ACTIONS.UPDATE,
    description: "Update roles",
  },
  {
    key: "ROLE_DELETE",
    resource: RESOURCES.ROLE,
    action: ACTIONS.DELETE,
    description: "Delete roles",
  },
] as const;
