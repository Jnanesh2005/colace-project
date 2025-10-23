'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaHome, FaSearch, FaUsers, FaPlusSquare } from 'react-icons/fa';

const NavLink = ({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href} className={`flex flex-col items-center justify-center space-y-1 w-full ${isActive ? 'text-blue-400' : 'text-gray-400'}`}>
      <Icon size={24} />
      <span className="text-xs">{label}</span>
    </Link>
  );
};

export default function FloatingNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-gray-800 border-t border-gray-700 flex md:hidden z-50">
      <NavLink href="/home" icon={FaHome} label="Home" />
      <NavLink href="/search" icon={FaSearch} label="Search" />
      <NavLink href="/create" icon={FaPlusSquare} label="Post" />
      <NavLink href="/groups" icon={FaUsers} label="Groups" />
      {/* We'll add a profile link later */}
    </nav>
  );
}
