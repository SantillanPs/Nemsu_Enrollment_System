import {
  User,
  Profile,
  Program,
  Application,
  Document,
  Role,
  ApplicationStatus,
} from "@prisma/client";

export type SafeUser = Omit<User, "password"> & {
  profile?: Profile | null;
};

export interface UserWithProfile extends User {
  profile: Profile | null;
}

export interface ProgramWithApplications extends Program {
  applications: Application[];
}

export interface ApplicationWithDetails extends Application {
  program: Program;
  documents: Document[];
}

export type { Role, ApplicationStatus };

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}
