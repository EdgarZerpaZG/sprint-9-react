import { useBookingModal } from "../../hooks/useBookingModal";
import type { BookingModalProps } from "../../types/bookingTypes";

export default function BookingModal(props: BookingModalProps) {
  const {
    open,
    onClose,
    start,
    end,
    resource,
    onSuccess,
    mode = "create",
    bookingId,
    initialTitle = "",
  } = props;

  const {
    title,
    setTitle,
    loading,
    errorMsg,
    formattedRange,
    handleSubmit,
    handleDelete,
  } = useBookingModal({
    start,
    end,
    resource,
    mode,
    bookingId,
    initialTitle,
    onSuccess,
    onClose,
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <h3 className="text-xl font-semibold mb-1 text-gray-900">
          {mode === "create" ? "Confirm booking" : "Edit booking"}
        </h3>

        <p className="text-sm text-gray-500 mb-4">{formattedRange}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Booking title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. First consultation, Follow-up session..."
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required/>
          </div>

          {errorMsg && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
              {errorMsg}
            </p>
          )}

          <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {mode === "edit" && (
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center justify-center px-3 py-2 text-xs font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60"
                disabled={loading}>
                <span className="mr-1.5 text-sm">🗑️</span>
                Delete booking
              </button>
            )}

            <div className="flex flex-1 sm:justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex justify-center px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-60"
                disabled={loading}>
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-60">
                {loading
                  ? "Saving..."
                  : mode === "create"
                  ? "Book"
                  : "Save changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}