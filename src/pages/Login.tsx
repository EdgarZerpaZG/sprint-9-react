import LoginForm from "../components/Auth/loginAuth";

export default function Login() {
    return (
        <>
            <main className="flex justify-center items-center h-full">
                <section>
                    <h1 className="text-center">LOG IN</h1>
                    <LoginForm />
                </section>
            </main>
        </>
    )
}