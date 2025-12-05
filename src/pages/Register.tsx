import RegisterForm from "../components/Auth/registerAuth";

export default function Register() {
    return (
        <>
            <main className="flex justify-center items-center h-full">
                <section>
                    <h1 className="text-center">REGISTER</h1>
                    <RegisterForm />
                </section>
            </main>
        </>
    )
}