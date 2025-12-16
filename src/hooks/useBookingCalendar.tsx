import { useState, useMemo, useCallback } from "react";
import { DateTime } from "luxon";
import type { DateSelectArg, EventClickArg } from "@fullcalendar/core";
import { useBookings } from "./useBooking";

type SelectedRange = { startStr: string; endStr: string } | null;

type EditingEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
} | null;

export function useBookingCalendar(resource: string) {
  const { bookings, loading, error, refetch } = useBookings(resource);

  const [selectInfo, setSelectInfo] = useState<SelectedRange>(null);
  const [editingEvent, setEditingEvent] = useState<EditingEvent>(null);

  const events = useMemo(
    () =>
      bookings.map((b) => ({
        id: b.id,
        title: b.title || "Reserve",
        start: b.start_time,
        end: b.end_time,
      })),
    [bookings]
  );

  const handleSelect = useCallback((info: DateSelectArg) => {
    const startISO = DateTime.fromJSDate(info.start).toISO() ?? "";
    const endISO = DateTime.fromJSDate(info.end).toISO() ?? "";
    setSelectInfo({ startStr: startISO, endStr: endISO });
  }, []);

  const handleEventClick = useCallback((clickInfo: EventClickArg) => {
    const { event } = clickInfo;

    setEditingEvent({
      id: event.id,
      title: event.title,
      start: event.start ? DateTime.fromJSDate(event.start).toISO() ?? "" : "",
      end: event.end ? DateTime.fromJSDate(event.end).toISO() ?? "" : "",
    });
  }, []);

  const handleSuccess = useCallback(() => {
    setSelectInfo(null);
    setEditingEvent(null);
    refetch();
  }, [refetch]);

  const closeCreateModal = () => setSelectInfo(null);
  const closeEditModal = () => setEditingEvent(null);

  return {
    events,
    loading,
    error,
    selectInfo,
    editingEvent,
    handleSelect,
    handleEventClick,
    handleSuccess,
    closeCreateModal,
    closeEditModal,
  };
}