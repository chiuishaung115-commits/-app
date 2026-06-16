import React from 'react';
import { Music, Sparkles, Bell, Users, BookmarkCheck, LayoutDashboard } from 'lucide-react';

interface HeaderProps {
  currentRole: 'reception' | 'admin' | 'selfCheckIn';
  setRole: (role: 'reception' | 'admin' | 'selfCheckIn') => void;
  unreadCount: number;
  onOpenAlerts: () => void;
}

export default function Header({ currentRole, setRole, unreadCount, onOpenAlerts }: HeaderProps) {
  return (
    <header className="relative w-full max-w-7xl mx-auto px-4 pt-6 pb-2 text-brand-brown">
      {/* Decorative Floating Elements */}
      <div className="absolute -top-1 left-12 music-note-float opacity-30 pointer-events-none hidden md:block">
        <span className="text-4xl text-brand-pink">♫</span>
      </div>
      <div className="absolute top-10 right-16 music-note-float-reverse opacity-40 pointer-events-none hidden md:block">
        <span className="text-3xl text-brand-blue">♬</span>
      </div>
      <div className="absolute top-2 right-1/4 music-note-float opacity-20 pointer-events-none hidden md:block">
        <span className="text-2xl text-brand-yellow">♩</span>
      </div>

      <div className="sketchy-card bg-brand-yellow p-6 flex flex-col md:flex-row items-center justify-between gap-4 mb-6 relative overflow-hidden">
        {/* Background scribbles/patterns as overlay */}
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-radial from-brand-pink/20 to-transparent pointer-events-none rounded-r-2xl" />
        
        {/* Logo and Title */}
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 bg-white border-2 border-brand-brown rounded-full flex items-center justify-center shadow-[2px_2px_0px_#4A3728] relative">
            <Music className="w-8 h-8 text-rose-500 animate-bounce" />
            <span className="absolute -top-1 -right-1 text-sm">✨</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-extrabold tracking-tight font-sans text-brand-brown drop-shadow-sm flex items-center gap-1">
                高明音樂教室 
              </h1>
              <span className="text-xs bg-white border border-brand-brown text-brand-brown px-2 py-0.5 rounded-full font-bold shadow-[1px_1px_0px_#4A3728]">
                Gaoming School 🎵
              </span>
            </div>
            <p className="text-xs font-medium text-brand-brown/75 mt-1 flex items-center gap-1">
              <span>可愛手繪風管理工坊 🎈 陪孩子彈奏快樂的音符</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-600 inline" />
            </p>
          </div>
        </div>

        {/* Big Navigation Tabs */}
        <div className="flex flex-wrap justify-center items-center gap-3 relative z-10">
          {/* Reception Dashboard */}
          <button
            id="nav-reception-btn"
            onClick={() => setRole('reception')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-brand-brown shadow-[2px_2px_0px_#4A3728] transition-all font-bold ${
              currentRole === 'reception'
                ? 'bg-brand-blue -translate-x-0.5 -translate-y-0.5 shadow-[4px_4px_0px_#4A3728]'
                : 'bg-white hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-sky-600" />
            <span>櫃台每日看板</span>
          </button>

          {/* Admin Tools */}
          <button
            id="nav-admin-btn"
            onClick={() => setRole('admin')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-brand-brown shadow-[2px_2px_0px_#4A3728] transition-all font-bold ${
              currentRole === 'admin'
                ? 'bg-brand-pink -translate-x-0.5 -translate-y-0.5 shadow-[4px_4px_0px_#4A3728]'
                : 'bg-white hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4 text-rose-500" />
            <span>管理者後台</span>
          </button>

          {/* Self Service Sign-in */}
          <button
            id="nav-self-check-btn"
            onClick={() => setRole('selfCheckIn')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-brand-brown shadow-[2px_2px_0px_#4A3728] transition-all font-bold ${
              currentRole === 'selfCheckIn'
                ? 'bg-brand-green -translate-x-0.5 -translate-y-0.5 shadow-[4px_4px_0px_#4A3728]'
                : 'bg-white hover:bg-slate-50'
            }`}
          >
            <BookmarkCheck className="w-4 h-4 text-emerald-600" />
            <span>師生線上簽到</span>
          </button>

          {/* Alert Center Button */}
          <div className="relative">
            <button
              id="alert-center-btn"
              onClick={onOpenAlerts}
              className="relative p-2.5 rounded-xl border-2 border-brand-brown bg-white shadow-[2px_2px_0px_#4A3728] hover:bg-gray-50 flex items-center justify-center transition-transform active:translate-y-0.5"
              title="即時簽到通知 alerts"
            >
              <Bell className="w-5 h-5 text-amber-500" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-extrabold text-white border-2 border-brand-brown animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
