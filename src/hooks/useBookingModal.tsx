import { useState, useMemo, useEffect } from "react";
import { DateTime } from "luxon";
import { supabase } from "../lib/supabaseClient";

type UseBookingModalParams = {
  start: string;
  end: string;
  resource: string;
  mode?: "create" | "edit";
  bookingId?: string;
  initialTitle?: string;
  onSuccess?: () => void;
  onClose?: () => void;
  profileId?: string | null;
};

export function useBookingModal({
  start,
  end,
  resource,
  mode = "create",
  bookingId,
  initialTitle = "",
  onSuccess,
  onClose,
  profileId
}: UseBookingModalParams) {
  const [title, setTitle] = useState(initialTitle);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setTitle(initialTitle);
  }, [initialTitle]);

  const formattedRange = useMemo(() => {
    const startLabel = DateTime.fromISO(start).toLocaleString(
      DateTime.DATETIME_FULL
    );
    const endLabel = DateTime.fromISO(end).toLocaleString(
      DateTime.DATETIME_FULL
    );
    return `${startLabel} → ${endLabel}`;
  }, [start, end]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const startISO = DateTime.fromISO(start).toUTC().toISO();
      const endISO = DateTime.fromISO(end).toUTC().toISO();

      console.log("SUBMIT booking", {
        mode,
        bookingId,
        resource,
        start,
        end,
        startISO,
        endISO,
        title,
      });

      if (!startISO || !endISO) {
        throw new Error("Invalid dates.");
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session || !session.user) {
        throw new Error("You must be logged in to manage bookings.");
      }

      const userId = session.user.id;

      const { data: available, error: rpcErr } = await supabase.rpc(
        "is_available",
        {
          p_resource: resource,
          p_start: startISO,
          p_end: endISO,
          p_booking_id: mode === "edit" ? bookingId : null,
        }
      );

      console.log("RPC is_available =>", { available, rpcErr });

      if (rpcErr) throw rpcErr;

      if (!available) {
        setErrorMsg(
          "The selected time slot is already taken. Please choose another one."
        );
        setLoading(false);
        return;
      }

      if (mode === "create") {
        const { data: insertedRows, error: insertErr } = await supabase
          .from("bookings")
          .insert([
            {
              user_id: userId,
              profile_id: profileId ?? null,
              resource,
              title,
              start_time: startISO,
              end_time: endISO,
            },
          ])
          .select();

        console.log("INSERT result =>", { insertedRows, insertErr });

        if (insertErr) throw insertErr;
      } else {
        if (!bookingId) {
          throw new Error("Missing booking ID to edit.");
        }

        const { data: updatedRows, error: updateErr } = await supabase
          .from("bookings")
          .update({
            title,
            start_time: startISO,
            end_time: endISO,
            profile_id: profileId ?? null,
          })
          .eq("id", bookingId)
          .select();

        console.log("UPDATE result =>", { updatedRows, updateErr });

        if (updateErr) throw updateErr;

        if (!updatedRows || updatedRows.length === 0) {
          console.warn(
            "⚠ UPDATE did not affect any rows. Check booking id/resource."
          );
        }
      }

      onSuccess?.();
      onClose?.();
    } catch (err: any) {
      console.error("Error saving booking:", err);
      setErrorMsg(err.message ?? "Error saving booking.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!bookingId) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this booking?"
    );
    if (!confirmDelete) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const { error: deleteErr } = await supabase
        .from("bookings")
        .delete()
        .eq("id", bookingId)
        .eq("resource", resource);

      if (deleteErr) throw deleteErr;

      onSuccess?.();
      onClose?.();
    } catch (err: any) {
      console.error("Error deleting booking:", err);
      setErrorMsg(err.message ?? "Error deleting booking.");
    } finally {
      setLoading(false);
    }
  };

  return {
    title,
    setTitle,
    loading,
    errorMsg,
    formattedRange,
    handleSubmit,
    handleDelete,
  };
}