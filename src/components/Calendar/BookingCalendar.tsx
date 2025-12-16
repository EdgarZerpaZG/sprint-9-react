import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import dayGridPlugin from "@fullcalendar/daygrid";
import luxonPlugin from "@fullcalendar/luxon";
import BookingModal from "./BookingModal";
import { useBookingCalendar } from "../../hooks/useBookingCalendar";

type Props = {
  resource?: string;
};

export default function BookingCalendar({
  resource = "default-resource",
}: Props) {
  const {
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
  } = useBookingCalendar(resource);

  if (loading) {
    return (
      <div className="w-full flex justify-center py-8">
        <p className="text-gray-500">Loading bookings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex justify-center py-8">
        <p className="text-red-600">
          Error loading bookings: {error.message}
        </p>
      </div>
    );
  }

  return (
    <>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, luxonPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        selectable={true}
        selectMirror={true}
        select={handleSelect}
        events={events}
        slotMinTime="07:00:00"
        slotMaxTime="20:00:00"
        allDaySlot={false}
        timeZone="local"
        height="auto"
        editable={false}
        eventClick={handleEventClick}
      />

      {selectInfo && (
        <BookingModal
          mode="create"
          open={true}
          onClose={closeCreateModal}
          start={selectInfo.startStr}
          end={selectInfo.endStr}
          resource={resource}
          onSuccess={handleSuccess}
        />
      )}

      {editingEvent && (
        <BookingModal
          mode="edit"
          open={true}
          onClose={closeEditModal}
          start={editingEvent.start}
          end={editingEvent.end}
          resource={resource}
          onSuccess={handleSuccess}
          bookingId={editingEvent.id}
          initialTitle={editingEvent.title}
        />
      )}
    </>
  );
}