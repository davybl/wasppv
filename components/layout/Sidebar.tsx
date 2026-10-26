'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Box, LayoutDashboard, Users, Package, PenTool, Film, Terminal, User, Menu, X } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/characters', icon: Users, label: 'Character Vault' },
  { href: '/models', icon: Package, label: '3D Model Library' },
  { href: '/chapters', icon: PenTool, label: 'Chapter & Script Editor' },
  { href: '/shots', icon: Film, label: 'Shot List & Scenes' },
  { href: '/blender', icon: Terminal, label: 'Blender Script Exporter' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-zinc-900 border border-zinc-800 p-2 rounded cursor-pointer"
      >
        <Menu className="w-6 h-6 text-zinc-300" />
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 z-40 cursor-pointer"
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col flex-shrink-0 transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <h1 className="text-xl font-bold text-cyan-400 flex items-center gap-2">
            <Box className="w-6 h-6" />
            WA & SPV
          </h1>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden text-zinc-400 hover:text-zinc-300 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="px-4 pb-4 text-xs text-zinc-500 border-b border-zinc-800">Web Asset & Story Production Vault</p>

        <nav className="flex-1 p-2 overflow-y-auto">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`sidebar-item flex items-center gap-3 px-3 py-2 rounded text-sm transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-zinc-800 border-l-3 border-cyan-500 text-cyan-400'
                      : 'hover:bg-zinc-800 text-zinc-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-zinc-400" />
            </div>
            <div>
              <p className="text-sm font-medium">Production Team</p>
              <p className="text-xs text-zinc-500">Local Mode</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
