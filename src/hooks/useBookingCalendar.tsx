import { useState, useMemo, useCallback } from "react";
import { DateTime } from "luxon";
import type {
  DateSelectArg,
  EventClickArg,
} from "@fullcalendar/core";
import { useBookings } from "./useBooking";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "./useAuth";
import { useIsAdmin } from "./useIsAdmin.tsx";

type SelectedRange = { startStr: string; endStr: string } | null;

type EditingEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  profileId?: string | null;
  isOwner?: boolean;
} | null;

export function useBookingCalendar(resource: string) {
  const { bookings, loading, error, refetch } = useBookings(resource);
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();

  const [selectInfo, setSelectInfo] = useState<SelectedRange>(null);
  const [editingEvent, setEditingEvent] = useState<EditingEvent>(null);

  const events = useMemo(
    () =>
      bookings.map((b) => {
        const isOwner = !!user?.id && b.user_id === user.id;

        return {
          id: b.id,
          title: b.title || "Reserve",
          start: b.start_time,
          end: b.end_time,
          editable: isAdmin || isOwner,
          extendedProps: {
            profileId: b.profile_id ?? null,
            userId: b.user_id ?? null,
            isOwner,
          },
        };
      }),
    [bookings, user?.id, isAdmin]
  );

  const handleSelect = useCallback((info: DateSelectArg) => {
    const startISO = DateTime.fromJSDate(info.start).toISO() ?? "";
    const endISO = DateTime.fromJSDate(info.end).toISO() ?? "";
    setSelectInfo({ startStr: startISO, endStr: endISO });
  }, []);

  const handleEventClick = useCallback((clickInfo: EventClickArg) => {
    const { event } = clickInfo;
    const ep = event.extendedProps as any;

    setEditingEvent({
      id: event.id,
      title: event.title,
      start: event.start ? DateTime.fromJSDate(event.start).toISO() ?? "" : "",
      end: event.end ? DateTime.fromJSDate(event.end).toISO() ?? "" : "",
      profileId: ep?.profileId ?? null,
      isOwner: ep?.isOwner ?? false,
    });
  }, []);

  const handleEventChange = useCallback(
    async (arg: any) => {
      const event = arg.event;
      const ep = event.extendedProps as any;
      const canEdit = isAdmin || ep?.isOwner;

      if (!canEdit) {
        arg.revert();
        return;
      }

      const startISO = event.start
        ? DateTime.fromJSDate(event.start).toUTC().toISO()
        : null;
      const endISO = event.end
        ? DateTime.fromJSDate(event.end).toUTC().toISO()
        : null;

      if (!startISO || !endISO) {
        arg.revert();
        return;
      }

      const { data: available, error: rpcErr } = await supabase.rpc(
        "is_available",
        {
          p_resource: resource,
          p_start: startISO,
          p_end: endISO,
          p_booking_id: event.id,
        }
      );

      if (rpcErr || !available) {
        arg.revert();
        return;
      }

      const { error: updateErr } = await supabase
        .from("bookings")
        .update({
          start_time: startISO,
          end_time: endISO,
        })
        .eq("id", event.id);

      if (updateErr) {
        arg.revert();
        return;
      }

      refetch();
    },
    [isAdmin, resource, refetch]
  );

  const handleSuccess = useCallback(() => {
    setSelectInfo(null);
    setEditingEvent(null);
    refetch();
  }, [refetch]);

  const closeCreateModal = () => setSelectInfo(null);
  const closeEditModal = () => setEditingEvent(null);

  const eventClassNames = useCallback((info: any) => {
    const ep = info.event.extendedProps as any;
    return ep?.isOwner ? ["fc-own-booking"] : [];
  }, []);

  const eventAllow = useCallback(
    (_dropInfo: any, draggedEvent: any) => {
      const ep = draggedEvent.extendedProps as any;
      return isAdmin || ep?.isOwner;
    },
    [isAdmin]
  );

  return {
    events,
    loading,
    error,
    selectInfo,
    editingEvent,
    handleSelect,
    handleEventClick,
    handleEventChange,
    handleSuccess,
    closeCreateModal,
    closeEditModal,
    eventClassNames,
    eventAllow,
  };
}