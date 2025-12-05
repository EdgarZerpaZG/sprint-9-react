import { useAuth } from "../hooks/useAuth";
import User from './../assets/user.svg';

export default function Profile() {
  const { user, loading } = useAuth();
  console.log("PROFILE user:", user, "loading:", loading);

  if (!user) {
    return (
      <main className="flex justify-center items-center h-full">
        <section>
          <p className="text-center">You must log in first.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="flex justify-center items-center h-full">
      <section>
        <div className="flex justify-center">
          <img src={User} alt="SWAPI User" />
        </div>
        <h1 className="text-2xl font-bold mb-4 text-center">User profile</h1>
        <div className="bg-black text-white p-6 rounded-lg shadow-md text-left">
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>ID:</strong> {user.id}</p>
        </div>
      </section>
    </main>
  );
}