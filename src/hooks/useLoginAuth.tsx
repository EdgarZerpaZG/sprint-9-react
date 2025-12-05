import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

type LoginFormState = {
  email: string;
  password: string;
};

export function useLoginForm(onSuccess?: () => void) {
  const [formData, setFormData] = useState<LoginFormState>({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("[login] submit START", formData);
    setMessage("");
    setLoading(true);

    const { email, password } = formData;

    if (!email || !password) {
      console.log("[login] missing fields");
      setMessage("Please fill in all fields.");
      setLoading(false);
      return;
    }

    const safetyTimeout = setTimeout(() => {
      console.warn("[login] safety timeout -> setLoading(false)");
      setLoading(false);
    }, 3000);

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("[login] onAuthStateChange FROM hook:", event, session);

        if (event === "SIGNED_IN" && session?.user) {
          clearTimeout(safetyTimeout);

          const user = session.user;

          if (!user.email_confirmed_at) {
            console.warn("[login] Email not confirmed -> signing out");
            supabase.auth
              .signOut()
              .catch((err) =>
                console.error("[login] error on signOut after unconfirmed:", err)
              );
            setMessage("Please confirm your email before logging in.");
            setLoading(false);
            listener.subscription.unsubscribe();
            return;
          }

          setMessage("Login successful!");
          setLoading(false);

          if (onSuccess) {
            console.log("[login] calling onSuccess callback");
            onSuccess();
          }

          listener.subscription.unsubscribe();
        }

        if (event === "SIGNED_OUT") {
          clearTimeout(safetyTimeout);
          console.warn("[login] SIGNED_OUT event during login");
          setLoading(false);
          listener.subscription.unsubscribe();
        }
      }
    );

    console.log("[login] calling signInWithPassword (fire-and-forget)...");
    supabase.auth
      .signInWithPassword({ email, password })
      .then(({ data, error }) => {
        console.log("[login] signInWithPassword THEN:", { data, error });

        if (error) {
          console.error("[login] Login error:", error);
          clearTimeout(safetyTimeout);
          setMessage("Invalid email or password.");
          setLoading(false);
          listener.subscription.unsubscribe();
        }

      })
      .catch((err) => {
        console.error("[login] CATCH error:", err);
        clearTimeout(safetyTimeout);
        setMessage("Error logging in. Please try again.");
        setLoading(false);
        listener.subscription.unsubscribe();
      });
  };

  return {
    formData,
    message,
    loading,
    handleChange,
    handleSubmit,
    setMessage,
  };
}