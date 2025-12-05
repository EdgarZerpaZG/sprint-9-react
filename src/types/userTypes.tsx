export interface UserAuth {
  id: string;
  email: string;
  username?: string;
  role?: "user" | "editor" | "admin";
}