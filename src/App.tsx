import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import AlertsContainer from './components/AlertsContainer';
import AdminView from './components/AdminView';
import ReceptionView from './components/ReceptionView';
import CheckInView from './components/CheckInView';

import { Student, Teacher, Room, Lesson, RoomRental, SignNotification, Attendance, RecurringLesson } from './types';
import { 
  initialStudents, 
  initialTeachers, 
  initialRooms, 
  initialLessons, 
  initialRoomRentals, 
  initialNotifications,
  initialRecurringLessons
} from './initialData';

import { Bell, Sparkles, X, Heart } from 'lucide-react';

const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function App() {
  // --- Persistent LocalStorage state management ---
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('doremi_students');
    const parsed = saved ? JSON.parse(saved) : initialStudents;
    const cleaned = parsed.filter((s: Student) => s.name !== '小熊奇奇');
    const hasWang = cleaned.some((s: Student) => s.name === '王伯軒');
    if (!hasWang) {
      const isS1TakenByOther = cleaned.some((s: Student) => s.id === 's1');
      if (isS1TakenByOther) {
        cleaned.forEach((s: Student) => {
          if (s.id === 's1') {
            s.id = `s_gen_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          }
        });
      }
      cleaned.unshift({
        id: 's1',
        name: '王伯軒',
        avatar: '👦',
        phone: '0912-888-999',
        parentName: '王媽媽',
        parentPhone: '0912-888-999',
        joinDate: '2026-06-01',
        active: true,
        notes: '愛唱歌，琴鍵指力練習中'
      });
    }
    const seenIds = new Set<string>();
    const deduped: Student[] = [];
    cleaned.forEach((s: Student) => {
      let uniqueId = s.id;
      if (!uniqueId || seenIds.has(uniqueId)) {
        uniqueId = `s_dedup_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      }
      seenIds.add(uniqueId);
      deduped.push({ ...s, id: uniqueId });
    });
    return deduped;
  });

  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem('doremi_teachers');
    const parsed = saved ? JSON.parse(saved) : initialTeachers;
    const seenIds = new Set<string>();
    const deduped: Teacher[] = [];
    parsed.forEach((t: Teacher) => {
      let uniqueId = t.id;
      if (!uniqueId || seenIds.has(uniqueId)) {
        uniqueId = `t_dedup_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      }
      seenIds.add(uniqueId);
      deduped.push({ ...t, id: uniqueId });
    });
    return deduped;
  });

  const [rooms, setRooms] = useState<Room[]>(() => {
    const saved = localStorage.getItem('doremi_rooms');
    const parsed: Room[] = saved ? JSON.parse(saved) : initialRooms;
    const cleaned = parsed.map(r => {
      if (r.currentRenter === '小熊奇奇') {
        return {
          ...r,
          currentRenter: '林曼珍',
          currentRenterPhone: '0933-222-111',
          timeSlot: '14:00 - 15:00',
          status: 'Rented' as const
        };
      }
      return r;
    });
    const seenIds = new Set<string>();
    const deduped: Room[] = [];
    cleaned.forEach((r: Room) => {
      let uniqueId = r.id;
      if (!uniqueId || seenIds.has(uniqueId)) {
        uniqueId = `r_dedup_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      }
      seenIds.add(uniqueId);
      deduped.push({ ...r, id: uniqueId });
    });
    return deduped;
  });

  const [lessons, setLessons] = useState<Lesson[]>(() => {
    const todayDateStr = getTodayDateString();
    const saved = localStorage.getItem('doremi_lessons');
    let parsed = saved ? JSON.parse(saved) : initialLessons;
    parsed = parsed.filter((l: Lesson) => l.studentName !== '小熊奇奇');
    const nonToday = parsed.filter((l: Lesson) => l.date !== todayDateStr && l.date !== '2026-06-12');
    const todayLessons = [
      {
        id: 'l1',
        studentId: 's1',
        studentName: '王伯軒',
        teacherId: 't1',
        teacherName: '長頸鹿老師',
        instrument: '鋼琴',
        roomName: '愛麗絲鋼琴房',
        date: todayDateStr,
        timeSlot: '13:00 - 14:00',
        price: 1200,
        feePaid: false,
        attendance: Attendance.Absent
      }
    ];
    const combined = [...nonToday, ...todayLessons];
    const seenIds = new Set<string>();
    const deduped: Lesson[] = [];
    combined.forEach((l: Lesson) => {
      let uniqueId = l.id;
      if (!uniqueId || seenIds.has(uniqueId)) {
        uniqueId = `l_dedup_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      }
      seenIds.add(uniqueId);
      deduped.push({ ...l, id: uniqueId });
    });
    return deduped;
  });

  const [roomRentals, setRoomRentals] = useState<RoomRental[]>(() => {
    const todayDateStr = getTodayDateString();
    const saved = localStorage.getItem('doremi_room_rentals');
    let parsed = saved ? JSON.parse(saved) : initialRoomRentals;
    parsed = parsed.filter((r: RoomRental) => r.renterName !== '小熊奇奇' && !r.renterName.includes('小猴') && !r.renterName.includes('強強'));
    const todayRentals = parsed.filter((r: RoomRental) => r.date === todayDateStr);
    if (todayRentals.length === 0) {
      parsed.push({
        id: 'rr1',
        roomId: 'r1',
        roomName: '愛麗絲鋼琴房',
        renterName: '林曼珍',
        renterPhone: '0933-222-111',
        timeSlot: '14:00 - 15:00',
        price: 300,
        paid: false,
        date: todayDateStr
      });
    }
    const seenIds = new Set<string>();
    const deduped: RoomRental[] = [];
    parsed.forEach((rr: RoomRental) => {
      let uniqueId = rr.id;
      if (!uniqueId || seenIds.has(uniqueId)) {
        uniqueId = `rr_dedup_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      }
      seenIds.add(uniqueId);
      deduped.push({ ...rr, id: uniqueId });
    });
    return deduped;
  });

  const [notifications, setNotifications] = useState<SignNotification[]>(() => {
    const saved = localStorage.getItem('doremi_notifications');
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  const [recurringLessons, setRecurringLessons] = useState<RecurringLesson[]>(() => {
    const saved = localStorage.getItem('doremi_recurring_lessons');
    let parsed = saved ? JSON.parse(saved) : initialRecurringLessons;
    const cleaned = parsed.filter((r: RecurringLesson) => r.studentName !== '小熊奇奇');
    const seenIds = new Set<string>();
    const deduped: RecurringLesson[] = [];
    cleaned.forEach((rl: RecurringLesson) => {
      let uniqueId = rl.id;
      if (!uniqueId || seenIds.has(uniqueId)) {
        uniqueId = `rl_dedup_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      }
      seenIds.add(uniqueId);
      deduped.push({ ...rl, id: uniqueId });
    });
    return deduped;
  });

  const [selectedDate, setSelectedDate] = useState(getTodayDateString());

  const [generatedDates, setGeneratedDates] = useState<string[]>(() => {
    const saved = localStorage.getItem('doremi_generated_dates');
    return saved ? JSON.parse(saved) : [getTodayDateString()];
  });

  // UI States
  const [currentRole, setRole] = useState<'reception' | 'admin' | 'selfCheckIn'>('reception');
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);

  // Password Authentication States
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('doremi_is_admin_auth') === 'true';
  });
  const [isReceptionAuthenticated, setIsReceptionAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('doremi_is_reception_auth') === 'true';
  });

  const [passwordModal, setPasswordModal] = useState<{
    isOpen: boolean;
    targetRole: 'reception' | 'admin';
    inputValue: string;
    errorMsg: string;
  }>({
    isOpen: false,
    targetRole: 'reception',
    inputValue: '',
    errorMsg: '',
  });
  
  // Real-time Visual Toast message for active alerts
  const [activeToast, setActiveToast] = useState<{ id: string; message: string; type: string } | null>(null);

  // Synchronize values to localStorage
  useEffect(() => {
    localStorage.setItem('doremi_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('doremi_teachers', JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    localStorage.setItem('doremi_rooms', JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem('doremi_lessons', JSON.stringify(lessons));
  }, [lessons]);

  useEffect(() => {
    localStorage.setItem('doremi_room_rentals', JSON.stringify(roomRentals));
  }, [roomRentals]);

  useEffect(() => {
    localStorage.setItem('doremi_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('doremi_recurring_lessons', JSON.stringify(recurringLessons));
  }, [recurringLessons]);

  useEffect(() => {
    localStorage.setItem('doremi_generated_dates', JSON.stringify(generatedDates));
  }, [generatedDates]);

  // Auto-generate lessons based on selectedDate and recurringLessons templates
  useEffect(() => {
    if (!selectedDate) return;
    
    // Check if we already generated for this date
    if (generatedDates.includes(selectedDate)) return;

    // Calculate weekday (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const parts = selectedDate.split('-');
    if (parts.length !== 3) return;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const d = new Date(year, month, day);
    const weekday = d.getDay();

    // Find templates for this weekday
    const templates = recurringLessons.filter(template => template.dayOfWeek === weekday);
    
    if (templates.length > 0) {
      const newLessonsToAppend: Lesson[] = [];
      
      templates.forEach(rl => {
        // Double check a lesson for this student/teacher/time on this day isn't already present
        const exists = lessons.some(l => 
          l.date === selectedDate && 
          l.studentId === rl.studentId && 
          l.timeSlot === rl.timeSlot
        );
        
        if (!exists) {
          newLessonsToAppend.push({
            id: `l_gen_${rl.id}_${selectedDate}`,
            studentId: rl.studentId,
            studentName: rl.studentName,
            teacherId: rl.teacherId,
            teacherName: rl.teacherName,
            instrument: rl.instrument,
            roomName: rl.roomName,
            date: selectedDate,
            timeSlot: rl.timeSlot,
            price: rl.price,
            feePaid: false,
            attendance: Attendance.Unchecked
          });
        }
      });

      if (newLessonsToAppend.length > 0) {
        setLessons(prev => {
          const generatedIds = new Set(newLessonsToAppend.map(item => item.id));
          const cleanPrev = prev.filter(item => !generatedIds.has(item.id));
          return [...cleanPrev, ...newLessonsToAppend];
        });
      }
    }

    // Mark as generated
    setGeneratedDates(prev => prev.includes(selectedDate) ? prev : [...prev, selectedDate]);

  }, [selectedDate, recurringLessons, lessons, generatedDates]);

  // Dual-tone high fidelity "叮咚!" Bell synthesizer for check-ins!
  const playBellSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      // Tone 1 (Ding)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      gain1.gain.setValueAtTime(0.12, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      
      // Tone 2 (Dong)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15); // E5
      gain2.gain.setValueAtTime(0.09, ctx.currentTime + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      
      osc1.start();
      osc1.stop(ctx.currentTime + 1.3);
      osc2.start(ctx.currentTime + 0.15);
      osc2.stop(ctx.currentTime + 1.6);
    } catch (e) {
      console.log('AudioContext not allowed or supported yet', e);
    }
  };

  // Helper broadcast register
  const emitNotification = (
    message: string, 
    type: 'StudentCheckIn' | 'TeacherCheckIn' | 'TuitionAlert', 
    senderName: string
  ) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const newNotif: SignNotification = {
      id: 'n_' + Date.now(),
      type,
      message,
      time: timeStr,
      read: false,
      senderName,
      role: type === 'StudentCheckIn' ? 'Student' : type === 'TeacherCheckIn' ? 'Teacher' : 'Admin'
    };

    setNotifications(prev => [newNotif, ...prev]);

    // Active visual overlay toast
    setActiveToast({
      id: newNotif.id,
      message,
      type
    });

    // Play physical "叮咚" sound ring!
    playBellSound();
  };

  // Clear Active Toast after 6 seconds
  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => {
        setActiveToast(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [activeToast]);

  // Bell counters
  const unreadCount = notifications.filter(n => !n.read).length;

  // Mark specific read
  const handleMarkRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  // Clear all
  const handleClearAll = () => {
    setNotifications([]);
  };

  // Sandbox simulation tool triggers
  const handleTriggerMockAlert = (type: 'student' | 'teacher' | 'tuition') => {
    if (type === 'student') {
      const luckyStud = students[Math.floor(Math.random() * students.length)] || { name: '小熊寶寶', avatar: '🧸' };
      const instrument = ['小提琴', '三角鋼琴', '爵士鼓', '古典吉他'][Math.floor(Math.random() * 4)];
      emitNotification(
        `🧸 【模擬學員】家長「${luckyStud.name}」已使用手機自主線上登記到班，希望今天能加強練習《小星星連奏》！`,
        'StudentCheckIn',
        luckyStud.name
      );
    } else if (type === 'teacher') {
      const luckyTeach = teachers[Math.floor(Math.random() * teachers.length)] || { name: '樹懶老師', avatar: '🦥' };
      emitNotification(
        `🦒 【模擬老師】「${luckyTeach.name}」已完成線上報到，即將前往指導接下來的樂理課程。`,
        'TeacherCheckIn',
        luckyTeach.name
      );
    } else if (type === 'tuition') {
      const luckyStud = students[Math.floor(Math.random() * students.length)] || { name: '小熊寶寶', avatar: '🧸' };
      const price = [1000, 1200, 1500][Math.floor(Math.random() * 3)];
      emitNotification(
        `💰 【模擬摧收】學員「${luckyStud.name}」的上期音樂講義代辦材料費與學費共 $${price} 有未繳紅標，提醒櫃台收取。`,
        'TuitionAlert',
        luckyStud.name
      );
    }
  };

  const handleSetRoleSafe = (target: 'reception' | 'admin' | 'selfCheckIn') => {
    if (target === 'selfCheckIn') {
      setIsAdminAuthenticated(false);
      setIsReceptionAuthenticated(false);
      sessionStorage.removeItem('doremi_is_admin_auth');
      sessionStorage.removeItem('doremi_is_reception_auth');
      setRole('selfCheckIn');
      return;
    }

    if (target === 'admin') {
      if (isAdminAuthenticated) {
        setRole('admin');
      } else {
        setPasswordModal({
          isOpen: true,
          targetRole: 'admin',
          inputValue: '',
          errorMsg: ''
        });
      }
      return;
    }

    if (target === 'reception') {
      if (isReceptionAuthenticated) {
        setRole('reception');
      } else {
        setPasswordModal({
          isOpen: true,
          targetRole: 'reception',
          inputValue: '',
          errorMsg: ''
        });
      }
      return;
    }
  };

  const handleVerifyPassword = (e: React.FormEvent) => {
    e.preventDefault();
    const isTargetAdmin = passwordModal.targetRole === 'admin';
    const savedPwd = isTargetAdmin 
      ? (localStorage.getItem('doremi_admin_pwd') || 'admin')
      : (localStorage.getItem('doremi_reception_pwd') || 'staff');

    if (passwordModal.inputValue === savedPwd) {
      if (isTargetAdmin) {
        setIsAdminAuthenticated(true);
        sessionStorage.setItem('doremi_is_admin_auth', 'true');
        setRole('admin');
      } else {
        setIsReceptionAuthenticated(true);
        sessionStorage.setItem('doremi_is_reception_auth', 'true');
        setRole('reception');
      }
      setPasswordModal(prev => ({ ...prev, isOpen: false, inputValue: '', errorMsg: '' }));
    } else {
      setPasswordModal(prev => ({ 
        ...prev, 
        errorMsg: '❌ 密碼輸入不正確唷！請再試一次。' 
      }));
    }
  };

  return (
    <div className="min-h-screen pb-16 flex flex-col justify-between">
      
      {/* Upper Brand Navigator & logo */}
      <div>
        <Header 
          currentRole={currentRole} 
          setRole={handleSetRoleSafe} 
          unreadCount={unreadCount}
          onOpenAlerts={() => setIsAlertsOpen(true)}
        />

        {/* Dynamic Role Switcher Screens */}
        <main className="mt-4">
          {currentRole === 'reception' && (
            <ReceptionView 
              students={students}
              teachers={teachers}
              rooms={rooms}
              lessons={lessons}
              roomRentals={roomRentals}
              setLessons={setLessons}
              setRooms={setRooms}
              setRoomRentals={setRoomRentals}
              onEmitNotification={emitNotification}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
            />
          )}

          {currentRole === 'admin' && (
            <AdminView 
              students={students}
              teachers={teachers}
              rooms={rooms}
              lessons={lessons}
              setStudents={setStudents}
              setTeachers={setTeachers}
              setRooms={setRooms}
              setLessons={setLessons}
              recurringLessons={recurringLessons}
              setRecurringLessons={setRecurringLessons}
              roomRentals={roomRentals}
              setRoomRentals={setRoomRentals}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              notifications={notifications}
              setNotifications={setNotifications}
              onEmitNotification={emitNotification}
            />
          )}

          {currentRole === 'selfCheckIn' && (
            <CheckInView 
              students={students}
              teachers={teachers}
              lessons={lessons}
              setLessons={setLessons}
              onEmitNotification={emitNotification}
              selectedDate={selectedDate}
            />
          )}
        </main>
      </div>

      {/* Decorative page margin credit */}
      <footer className="text-center text-xs font-bold text-brand-brown/40 pt-10">
        <p className="flex items-center justify-center gap-1">
          <span>高明手繪音樂坊 © 2026</span>
          <Heart className="w-3 h-3 fill-rose-300 stroke-none" />
          <span>純手繪水彩畫風格 UI 工坊</span>
        </p>
      </footer>

      {/* Slide drawer for sign notifications alerts */}
      <AlertsContainer 
        notifications={notifications}
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        onMarkRead={handleMarkRead}
        onClearAll={handleClearAll}
        onTriggerMockAlert={handleTriggerMockAlert}
      />

      {/* FLOATING BOUNCY AUDIO-VISUAL TOAST (叮咚即時推播) */}
      {activeToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-brand-cream border-3 border-brand-brown rounded-2xl shadow-[6px_6px_0px_#4A3728] p-4 animate-in slide-in-from-bottom-10 duration-300 overflow-hidden">
          
          {/* subtle status header ribbon */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-brand-yellow" />

          <div className="flex gap-2.5 items-start mt-1">
            <div className="h-9 w-9 bg-brand-yellow border-2 border-brand-brown rounded-full flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4 text-amber-500 animate-bounce" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black tracking-wider text-amber-900 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>新廣播提醒 🛎（叮咚聲！）</span>
                </span>
                <button 
                  onClick={() => setActiveToast(null)}
                  className="p-0.5 text-brand-brown/70 hover:text-red-500 hover:bg-slate-100 rounded"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-brand-brown font-bold mt-1 leading-relaxed">
                {activeToast.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PASSWORD VERIFICATION MODAL OVERLAY */}
      {passwordModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <form 
            onSubmit={handleVerifyPassword}
            className="w-full max-w-sm bg-brand-cream border-4 border-brand-brown rounded-[24px] shadow-[8px_8px_0px_#4A3728] p-6 relative overflow-hidden animate-in zoom-in-95 duration-150 text-brand-brown"
          >
            <div className="absolute top-0 inset-x-0 h-4 bg-brand-pink" />
            
            <div className="text-center pt-2">
              <span className="text-5xl block mb-2">
                {passwordModal.targetRole === 'admin' ? '👑' : '🙋'}
              </span>
              <h3 className="font-black text-xl mb-1">守護安全驗證</h3>
              <p className="text-xs text-brand-brown/70 mb-4 font-semibold">
                正在進入「{passwordModal.targetRole === 'admin' ? '管理者後台' : '櫃台每日看板'}」，請輸入解鎖密碼：
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <input
                  id="auth-password-input"
                  type="password"
                  required
                  placeholder="請輸入密碼以解鎖..."
                  value={passwordModal.inputValue}
                  onChange={(e) => setPasswordModal(prev => ({ ...prev, inputValue: e.target.value }))}
                  className="sketchy-input w-full font-bold text-center tracking-widest text-[#4A3728] border-2 focus:border-brand-pink focus:ring-0"
                  autoFocus
                />
              </div>

              {passwordModal.errorMsg && (
                <p className="text-xs text-rose-600 font-extrabold text-center bg-rose-50 border border-rose-300 p-2 rounded-xl animate-bounce">
                  {passwordModal.errorMsg}
                </p>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  id="auth-cancel-btn"
                  onClick={() => setPasswordModal(prev => ({ ...prev, isOpen: false, inputValue: '', errorMsg: '' }))}
                  className="flex-1 py-2 px-4 rounded-xl border-2 border-brand-brown bg-slate-50 hover:bg-slate-250 font-bold text-xs md:text-sm active:translate-y-0.5 transition-transform cursor-pointer"
                >
                  取消返回
                </button>
                <button
                  type="submit"
                  id="auth-submit-btn"
                  className="flex-1 py-2 px-4 rounded-xl border-2 border-brand-brown bg-brand-pink hover:bg-rose-250 font-bold text-xs md:text-sm active:translate-y-0.5 transition-transform shadow-[2px_2px_0px_#4A3728] cursor-pointer"
                >
                  輸入並進入
                </button>
              </div>

              <div className="text-[10px] text-brand-brown/55 text-center mt-2">
                <p>提示：預設管理者密碼為 <strong className="font-extrabold text-brand-brown">admin</strong>，櫃台人員密碼為 <strong className="font-extrabold text-brand-brown">staff</strong>。</p>
              </div>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
