export type Booking = {
  id: string;
  user_id: string | null;
  resource: string;
  title: string | null;
  start_time: string; // ISO string
  end_time: string; // ISO string
};

export type BookingModalMode = "create" | "edit";

export type BookingModalProps = {
  open: boolean;
  onClose: () => void;
  start: string;
  end: string;
  resource: string;
  onSuccess?: () => void;
  mode?: BookingModalMode;
  bookingId?: string;
  initialTitle?: string;
};