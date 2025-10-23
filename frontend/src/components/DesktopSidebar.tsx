'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaHome, FaSearch, FaUsers, FaPlusSquare, FaUserCircle } from 'react-icons/fa';

const NavLink = ({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href} className={`flex items-center space-x-3 rounded-md px-3 py-2 text-lg ${isActive ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}>
      <Icon size={24} />
      <span>{label}</span>
    </Link>
  );
};

export default function DesktopSidebar() {
  return (
    // This is the key: `hidden md:flex` means it's hidden on small screens but a flex container on medium screens and up.
    <aside className="hidden md:flex flex-col w-64 h-screen fixed top-0 left-0 bg-gray-800 border-r border-gray-700 p-4 z-50">
      <div className="text-white text-2xl font-bold mb-10">
        Colace
      </div>
      <nav className="flex flex-col space-y-2">
        <NavLink href="/home" icon={FaHome} label="Home" />
        <NavLink href="/search" icon={FaSearch} label="Search" />
        <NavLink href="/create" icon={FaPlusSquare} label="Create" />
        <NavLink href="/groups" icon={FaUsers} label="Groups" />
      </nav>
      <div className="mt-auto"> {/* This pushes the profile link to the bottom */}
        <NavLink href="/profile/me" icon={FaUserCircle} label="Profile" />
      </div>
    </aside>
  );
}