import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import type { PostgrestError } from "@supabase/supabase-js";
import type { Booking } from "../types/bookingTypes";

export function useBookings(resource?: string) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<PostgrestError | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase.from("bookings").select("*");

      if (resource) {
        query = query.eq("resource", resource);
      }

      const { data, error } = await query.order("start_time", {
        ascending: true,
      });

      if (error) throw error;

      setBookings(data ?? []);
    } catch (err: any) {
      setError(err as PostgrestError);
    } finally {
      setLoading(false);
    }
  }, [resource]);

  useEffect(() => {
    fetchBookings();
    
    const channel = supabase
      .channel(`public:bookings:${resource ?? "all"}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
        },
        (payload) => {
          const ev = payload.eventType;
          const newRow = payload.new as Booking | null;
          const oldRow = payload.old as Booking | null;

          const matchesResource = (row: Booking | null) =>
            !resource || (row && row.resource === resource);

          setBookings((prev) => {
            const sortByStart = (list: Booking[]) =>
              [...list].sort((a, b) =>
                a.start_time.localeCompare(b.start_time)
              );

            if (ev === "INSERT" && newRow && matchesResource(newRow)) {
              return sortByStart([...prev, newRow]);
            }

            if (ev === "UPDATE" && newRow && matchesResource(newRow)) {
              return sortByStart(
                prev.map((b) => (b.id === newRow.id ? newRow : b))
              );
            }

            if (ev === "DELETE" && oldRow && matchesResource(oldRow)) {
              return prev.filter((b) => b.id !== oldRow.id);
            }

            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [fetchBookings, resource]);

  return {
    bookings,
    loading,
    error,
    refetch: fetchBookings,
  };
}