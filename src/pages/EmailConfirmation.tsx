import { useEffect, useState } from "react";
import { supabase } from "./../lib/supabaseClient";

export default function EmailConfirmation() {
  const [status, setStatus] = useState("Verifying your email...");

  useEffect(() => {
    let isMounted = true;

    async function handleEmailConfirmation() {
      try {
        try {
          await supabase.auth.exchangeCodeForSession(window.location.href);
        } catch (e) {
          console.log("[EmailConfirmation] exchangeCodeForSession skipped/failed:", e);
        }

        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("[EmailConfirmation] getSession error:", error);
          if (!isMounted) return;
          setStatus("There was an error verifying your email. Please try again.");
          return;
        }

        if (data.session) {
          if (!isMounted) return;
          setStatus("Your email was successfully verified. Redirecting to login...");
          setTimeout(() => {
            window.location.href = "/login";
          }, 3000);
        } else {
          if (!isMounted) return;
          setStatus("Verifying your email...");
        }
      } catch (e) {
        console.error("[EmailConfirmation] unexpected error:", e);
        if (!isMounted) return;
        setStatus("There was an error verifying your email. Please try again.");
      }
    }

    handleEmailConfirmation();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("[EmailConfirmation] onAuthStateChange:", event, session);

        if (!isMounted) return;

        if (event === "SIGNED_IN" && session) {
          setStatus("Your email was successfully verified. Redirecting to login...");
          setTimeout(() => {
            window.location.href = "/login";
          }, 3000);
        } else if (event === "USER_UPDATED") {
          setStatus("Your account was successfully confirmed. Redirecting...");
          setTimeout(() => {
            window.location.href = "/login";
          }, 3000);
        } else if (event === "SIGNED_OUT") {
          setStatus(
            "Your email address could not be verified. Please try logging in again."
          );
        }
      }
    );

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <main className="flex items-center justify-center min-h-screen flex-col">
      <h1 className="text-2xl font-bold mb-3">Email verification</h1>
      <p>{status}</p>
    </main>
  );
}