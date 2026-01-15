import { GoHome } from "../../utils/gohome";
import { useRegisterForm } from "../../hooks/useRegisterAuth";

export default function RegisterForm() {
  const path = "/";
  const home = GoHome(path);

  const { formData, message, loading, handleChange, handleRegister } =
    useRegisterForm(() => {
      setTimeout(home, 3000);
    });

  const { username, email, password, confirmPassword } = formData;

  return (
    <>
      <form className="p-5 bg-slate-900 text-white rounded-lg shadow-lg" onSubmit={handleRegister}>
        <div className="space-y-12">
          <div className="border-b border-white/10 pb-12">
            <h2 className="text-center text-xl font-bold mb-4">REGISTER</h2>
            <h2 className="text-base/7 font-semibold ">Profile</h2>
            <p className="mt-1 text-sm/6 text-gray-400">
              This information will be displayed publicly so be careful what you
              share.
            </p>

            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <label
                  htmlFor="username"
                  className="block text-sm/6 font-medium ">
                  Username
                </label>
                <div className="mt-2">
                  <div className="flex items-center rounded-md bg-white/5 pl-3 outline-1 -outline-offset-1 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-500">
                    <div className="shrink-0 text-base text-gray-400 select-none sm:text-sm/6">
                      shellpets.com/
                    </div>
                    <input
                      id="username"
                      type="text"
                      name="username"
                      value={username}
                      onChange={handleChange}
                      placeholder="Ranger"
                      className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base  outline-1 focus:outline-2 focus:outline-indigo-500 sm:text-sm/6"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-b border-white/10 pb-12">
            <h2 className="text-base/7 font-semibold ">
              Personal Information
            </h2>
            <p className="mt-1 text-sm/6 text-gray-400">
              Use a permanent address where you can receive mail.
            </p>

            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-7">
                <label
                  htmlFor="email"
                  className="block text-sm/6 font-medium ">
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={email}
                    onChange={handleChange}
                    className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base  outline-1 focus:outline-2 focus:outline-indigo-500 sm:text-sm/6"/>
                </div>
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="password"
                  className="block text-sm/6 font-medium ">
                  Password
                </label>
                <div className="mt-2">
                  <input
                    id="password"
                    type="password"
                    name="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={handleChange}
                    className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base  outline-1 focus:outline-2 focus:outline-indigo-500 sm:text-sm/6"/>
                </div>
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm/6 font-medium ">
                  Confirm password
                </label>
                <div className="mt-2">
                  <input
                    id="confirmPassword"
                    type="password"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={handleChange}
                    className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base  outline-1 focus:outline-2 focus:outline-indigo-500 sm:text-sm/6"/>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-x-6">
          <button
            type="button"
            onClick={home}
            className="text-sm/6 font-semibold  hover:text-gray-500 cursor-pointer">
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold  hover:bg-indigo-600 cursor-pointer disabled:opacity-50">
            {loading ? "Registering..." : "Register"}
          </button>
        </div>

        {message && (
          <p className="mt-5 text-center text-sm text-gray-300">{message}</p>
        )}
      </form>
    </>
  );
}