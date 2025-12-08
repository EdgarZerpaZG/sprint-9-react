import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar/navbar";

export default function PublicLayout() {
  return (
    <>
      <Navbar />
      {/* Add top padding if your navbar is fixed */}
      <div className="pt-24">
        <Outlet />
      </div>
    </>
  );
}