import { User } from "firebase/auth";
import { FieldValue, Timestamp } from "firebase/firestore";

export type ServerTimestamp = FieldValue | Timestamp;

export type UserRole = "admin" | "manager" | "user" | "dev";

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
}

export interface AuthUser extends User {
  role: UserRole;
  displayName: string | null;
  uid: string;
  email: string | null;
  photoURL: string | null;
  providerIds: string[];
  isActive: boolean;
  createdAt?: FieldValue | Timestamp;
  updatedAt?: FieldValue | Timestamp;
  lastLogin?: FieldValue | Timestamp;
}
