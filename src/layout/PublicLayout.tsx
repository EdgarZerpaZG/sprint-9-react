import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar/navbar";
import FooterContent from "../components/content/FooterContent";

export default function PublicLayout() {
  return (
    <>
      <Navbar />
      <div className="pt-24">
        <Outlet />
        <FooterContent />
      </div>
    </>
  );
}