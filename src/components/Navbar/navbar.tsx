import { Link } from "react-router-dom";
import Top from './top';
import '../../App.css';
import Vite from "../../assets/vite.svg";

export default function Navbar() {
  return (
    <>
      <nav className="navbar fixed w-full z-10 bg-emerald-300">
        <Top />
        <div>
          <Link className="px-4 py-2 flex justify-center text-black font-bold text-xl" to="/">
            <img src={Vite} alt="Logo" className="h-auto w-16 inline-block ml-4" />
          </Link>
        </div>
        <div className="flex justify-center items-center uppercase">
          <Link className="px-4 py-2 mx-2 text-black hover:text-gray-500" to="/">Home</Link>
          <Link className="px-4 py-2 mx-2 text-black hover:text-gray-500" to="/calendar">Calendar</Link>
          <Link className="px-4 py-2 mx-2 text-black hover:text-gray-500" to="/pages">Content</Link>
          <Link className="px-4 py-2 mx-2 text-black hover:text-gray-500" to="/posts">News</Link>
        </div>
      </nav>
    </>
  );
}