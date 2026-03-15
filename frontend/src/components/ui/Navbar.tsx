'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckSquare, LogOut, User, Menu, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth';
import { Button } from './Button';

export function Navbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-brand-700 text-lg">
            <CheckSquare className="w-6 h-6" />
            TaskFlow
          </Link>

          {/* Desktop */}
          <div className="hidden sm:flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center">
                <User className="w-4 h-4 text-brand-700" />
              </div>
              <span className="font-medium">{user?.name}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1.5">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>

          {/* Mobile menu toggle */}
          <button className="sm:hidden p-2 rounded-lg hover:bg-slate-100" onClick={() => setMenuOpen(v => !v)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden border-t border-slate-100 px-4 pb-4 pt-2 space-y-2 bg-white">
          <p className="text-sm text-slate-500">Signed in as <span className="font-medium text-slate-800">{user?.email}</span></p>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full justify-start gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      )}
    </nav>
  );
}
