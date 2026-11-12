import { Link, NavLink } from "react-router-dom";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-md transition ${
    isActive ? "bg-white/25 text-white" : "text-white/85 hover:bg-white/15"
  }`;

export default function Header() {
  return (
    <header className="sticky top-0 z-10 bg-red-800 shadow w-full">
      <div className="flex items-center justify-between px-4 py-4">
        <Link to="/" className="text-xl font-bold text-white">
          <div className="flex items-center">
            <img src="/src/assets/panneau-pere-noel-ancien.svg" alt="Panneau du Père Noël" className="w-8 h-8 mr-2" />
            Secret Santa
          </div>
        </Link>
        <nav className="flex gap-2">
          <NavLink to="/admin" className={linkClass}>Admin</NavLink>
        </nav>
      </div>
    </header>
  );
}