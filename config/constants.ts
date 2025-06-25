export const APP_NAME = "Prestige University";

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  DASHBOARD: "/dashboard",
  PROGRAMS: "/programs",
  APPLICATIONS: "/applications",
  PROFILE: "/profile",
} as const;

export const API_ROUTES = {
  AUTH: {
    LOGIN: "/api/auth/login",
    SIGNUP: "/api/auth/signup",
    LOGOUT: "/api/auth/logout",
  },
  USERS: "/api/users",
  PROGRAMS: "/api/programs",
  APPLICATIONS: "/api/applications",
} as const;

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/jpg",
];

export const DEFAULT_PAGINATION_LIMIT = 10;
