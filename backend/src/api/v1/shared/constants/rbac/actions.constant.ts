export const ACTIONS = {
  READ: "read",
  CREATE: "create",
  UPDATE: "update",
  DELETE: "delete",
  ASSIGN: "assign",
  MANAGE: "manage",
} as const;

export type Action = (typeof ACTIONS)[keyof typeof ACTIONS];
