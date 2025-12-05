import type { UserAuth } from "./userTypes";

export interface AuthContextType {
  user: UserAuth | null;
  loading: boolean;
  logout: () => Promise<void>;
}