import BookingCalendar from "../components/Calendar/BookingCalendar"

export default function Calendar() {
    return (
        <>
             <main className="flex justify-center items-center h-full">
                <section>
                    <h2 className="text-center uppercase">Appointment schedule</h2>
                    <BookingCalendar resource="consultorio-A" />
                </section>
            </main>
        </>
    )
}