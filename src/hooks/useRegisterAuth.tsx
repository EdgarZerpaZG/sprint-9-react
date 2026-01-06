import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

type RegisterFormState = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export function useRegisterForm(onSuccess?: () => void) {
  const [formData, setFormData] = useState<RegisterFormState>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
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

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    const { username, email, password, confirmPassword } = formData;

    if (!username || !email || !password || !confirmPassword) {
      setMessage("All fields are required");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setMessage("The passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { username },
            emailRedirectTo: `${window.location.origin}/emailconfirmation`,
        },
        });

      if (error) throw error;

      setMessage(
        "Account created successfully. Please check your email to confirm your account before logging in."
      );

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error("Registration error: ", err);
      setMessage("Error creating account: " + (err.message ?? ""));
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    message,
    loading,
    handleChange,
    handleRegister,
    setMessage,
  };
}