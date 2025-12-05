import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { supabase } from "./../lib/supabaseClient";
import type { UserAuth } from './../types/userTypes';
import type { AuthContextType } from './../types/authTypes';

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserAuth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getSession() {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        const { id, email } = data.session.user;
        const username = data.session.user.user_metadata?.username;
        setUser({ id, email: email ?? "", username: username ?? "" });
      }
      setLoading(false);
    }
    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const { id, email } = session.user;
        const username = session.user.user_metadata?.username;
        setUser({ id, email: email ?? "", username: username ?? "" });
      } else {
        setUser(null);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}