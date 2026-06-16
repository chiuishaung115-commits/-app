import React, { useState } from 'react';
import { Student, Teacher, Room, Lesson, Attendance, RecurringLesson, RoomRental, SignNotification } from '../types';
import { 
  Users, Trash2, Edit2, Plus, X, Search, FileText, Check, 
  Sparkles, ShieldCheck, DoorOpen, CalendarCheck, RefreshCw,
  Link, QrCode, ClipboardCopy, BellRing, History, UserCheck, Smile
} from 'lucide-react';
import GoogleDriveView from './GoogleDriveView';

interface AdminViewProps {
  students: Student[];
  teachers: Teacher[];
  rooms: Room[];
  lessons: Lesson[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  setTeachers: React.Dispatch<React.SetStateAction<Teacher[]>>;
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
  setLessons: React.Dispatch<React.SetStateAction<Lesson[]>>;
  recurringLessons: RecurringLesson[];
  setRecurringLessons: React.Dispatch<React.SetStateAction<RecurringLesson[]>>;
  roomRentals: RoomRental[];
  setRoomRentals: React.Dispatch<React.SetStateAction<RoomRental[]>>;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  notifications: SignNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<SignNotification[]>>;
  onEmitNotification: (message: string, type: 'StudentCheckIn' | 'TeacherCheckIn' | 'TuitionAlert', senderName: string) => void;
}

export default function AdminView({
  students,
  teachers,
  rooms,
  lessons,
  setStudents,
  setTeachers,
  setRooms,
  setLessons,
  recurringLessons,
  setRecurringLessons,
  roomRentals,
  setRoomRentals,
  selectedDate,
  setSelectedDate,
  notifications,
  setNotifications,
  onEmitNotification
}: AdminViewProps) {
  // Sub-tabs in Admin View
  const [activeSubTab, setActiveSubTab] = useState<'students' | 'teachers' | 'rooms' | 'lessons' | 'recurring-lessons' | 'settings' | 'checkin-links' | 'google-drive'>('students');

  // Search keyword search
  const [searchTerm, setSearchTerm] = useState('');

  // Password settings state
  const [adminPwdSetting, setAdminPwdSetting] = useState(() => localStorage.getItem('doremi_admin_pwd') || 'admin');
  const [receptionPwdSetting, setReceptionPwdSetting] = useState(() => localStorage.getItem('doremi_reception_pwd') || 'staff');
  const [isPwdSaved, setIsPwdSaved] = useState(false);

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Custom styled dialogs/modals (instead of window.confirm or window.alert which are blocked in standard iframe)
  const [customConfirm, setCustomConfirm] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const [customAlert, setCustomAlert] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: '',
    message: ''
  });

  // Simulation Check-in states for Admin View
  const [simulationModal, setSimulationModal] = useState<{
    isOpen: boolean;
    type: 'student' | 'teacher';
    targetId: string;
    targetName: string;
    avatar: string;
  }>({
    isOpen: false,
    type: 'student',
    targetId: '',
    targetName: '',
    avatar: '🧸'
  });
  const [simulationNote, setSimulationNote] = useState('');
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [checkinFilterType, setCheckinFilterType] = useState<'all' | 'student' | 'teacher'>('all');

  // Form Fields - Student
  const [studentForm, setStudentForm] = useState<Partial<Student>>({
    name: '',
    avatar: '🧸',
    phone: '',
    parentName: '',
    parentPhone: '',
    joinDate: new Date().toISOString().substring(0, 10),
    active: true,
    notes: ''
  });

  // Form Fields - Teacher
  const [teacherForm, setTeacherForm] = useState<Partial<Teacher>>({
    name: '',
    avatar: '🦒',
    instrument: '',
    phone: '',
    color: '#FCD34D'
  });

  // Form Fields - Room
  const [roomForm, setRoomForm] = useState<Partial<Room>>({
    name: '',
    emoji: '🎹',
    equipment: '',
    status: 'Available',
    timeSlot: '13:00 - 14:00',
    currentPrice: 300
  });

  // Form Fields - Lesson
  const [lessonForm, setLessonForm] = useState<Partial<Lesson>>({
    studentId: '',
    teacherId: '',
    instrument: '',
    roomName: '',
    date: new Date().toISOString().substring(0, 10),
    timeSlot: '14:00 - 15:00',
    price: 1200,
    feePaid: false,
    attendance: Attendance.Unchecked
  });

  // Form Fields - Recurring Lesson
  const [recurringLessonForm, setRecurringLessonForm] = useState<Partial<RecurringLesson>>({
    studentId: '',
    teacherId: '',
    instrument: '',
    roomName: '',
    dayOfWeek: 1, // Default Monday
    timeSlot: '14:00 - 15:00',
    price: 1200
  });

  // Reset forms helper
  const handleOpenNew = () => {
    setEditId(null);
    setIsFormOpen(true);
    if (activeSubTab === 'students') {
      setStudentForm({
        name: '',
        avatar: ['🧸', '🐰', '🐱', '🐷', '🦊', '🐼', '🐹', '🦁', '🦉'][Math.floor(Math.random() * 9)],
        phone: '',
        parentName: '',
        parentPhone: '',
        joinDate: new Date().toISOString().substring(0, 10),
        active: true,
        notes: ''
      });
    } else if (activeSubTab === 'teachers') {
      setTeacherForm({
        name: '',
        avatar: ['🦒', '🐘', '🐨', '🦁', '🦉', '🦊', '🐼'][Math.floor(Math.random() * 7)],
        instrument: '',
        phone: '',
        color: ['#FCD34D', '#81E6D9', '#C084FC', '#F87171', '#93C5FD', '#A7F3D0'][Math.floor(Math.random() * 6)]
      });
    } else if (activeSubTab === 'rooms') {
      setRoomForm({
        name: '',
        emoji: ['🎹', '🎻', '🥁', '🎸', '🎺', '🎷', '🎤'][Math.floor(Math.random() * 7)],
        equipment: '',
        status: 'Available',
        timeSlot: '13:00 - 14:00',
        currentPrice: 300,
        currentRenter: '',
        currentRenterPhone: ''
      });
    } else if (activeSubTab === 'lessons') {
      setLessonForm({
        studentId: students[0]?.id || '',
        teacherId: teachers[0]?.id || '',
        instrument: teachers[0]?.instrument?.split(' ')[0] || '鋼琴',
        roomName: rooms[0]?.name || '愛麗絲鋼琴房',
        date: selectedDate,
        timeSlot: '14:00 - 15:00',
        price: 1200,
        feePaid: false,
        attendance: Attendance.Unchecked
      });
    } else if (activeSubTab === 'recurring-lessons') {
      setRecurringLessonForm({
        studentId: students[0]?.id || '',
        teacherId: teachers[0]?.id || '',
        instrument: teachers[0]?.instrument?.split(' ')[0] || '鋼琴',
        roomName: rooms[0]?.name || '愛麗絲鋼琴房',
        dayOfWeek: 1,
        timeSlot: '14:00 - 15:00',
        price: 1200
      });
    }
  };

  const handleEdit = (id: string) => {
    setEditId(id);
    setIsFormOpen(true);
    if (activeSubTab === 'students') {
      const student = students.find(s => s.id === id);
      if (student) setStudentForm({ ...student });
    } else if (activeSubTab === 'teachers') {
      const teacher = teachers.find(t => t.id === id);
      if (teacher) setTeacherForm({ ...teacher });
    } else if (activeSubTab === 'rooms') {
      const room = rooms.find(r => r.id === id);
      if (room) {
        const targetRental = roomRentals.find(r => r.roomId === id && r.date === selectedDate);
        setRoomForm({
          ...room,
          status: targetRental ? 'Rented' : room.status,
          currentRenter: targetRental ? targetRental.renterName : room.currentRenter,
          currentRenterPhone: targetRental ? targetRental.renterPhone : room.currentRenterPhone,
          timeSlot: targetRental ? targetRental.timeSlot : (room.timeSlot || '13:00 - 14:00'),
          currentPrice: targetRental ? targetRental.price : (room.currentPrice ?? 300),
        });
      }
    } else if (activeSubTab === 'lessons') {
      const lesson = lessons.find(l => l.id === id);
      if (lesson) setLessonForm({ ...lesson });
    } else if (activeSubTab === 'recurring-lessons') {
      const rl = recurringLessons.find(item => item.id === id);
      if (rl) setRecurringLessonForm({ ...rl });
    }
  };

  const handleDelete = (id: string) => {
    let typeLabel = '';
    if (activeSubTab === 'students') typeLabel = '學員卡';
    if (activeSubTab === 'teachers') typeLabel = '老師卡';
    if (activeSubTab === 'rooms') typeLabel = '琴房教室';
    if (activeSubTab === 'lessons') typeLabel = '預約排課';
    if (activeSubTab === 'recurring-lessons') typeLabel = '常規固定排課';

    setCustomConfirm({
      isOpen: true,
      title: '🗑️ 確定要刪除嗎？',
      message: `您確定要永久刪除此筆【${typeLabel}】資料嗎？此操作將同步影響到其他排課及租借的資料連動喔！`,
      onConfirm: () => {
        if (activeSubTab === 'students') {
          setStudents(prev => prev.filter(s => s.id !== id));
          setLessons(prev => prev.filter(l => l.studentId !== id)); // Cascade remove schedule
        } else if (activeSubTab === 'teachers') {
          setTeachers(prev => prev.filter(t => t.id !== id));
          setLessons(prev => prev.filter(l => l.teacherId !== id)); // Cascade
        } else if (activeSubTab === 'rooms') {
          setRooms(prev => prev.filter(r => r.id !== id));
        } else if (activeSubTab === 'lessons') {
          setLessons(prev => prev.filter(l => l.id !== id));
        } else if (activeSubTab === 'recurring-lessons') {
          setRecurringLessons(prev => prev.filter(rl => rl.id !== id));
        }
        setCustomConfirm(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeSubTab === 'students') {
      if (!studentForm.name) {
        setCustomAlert({ isOpen: true, title: '⚠️ 輸入錯誤', message: '請輸入名字喔！' });
        return;
      }
      if (editId) {
        setStudents(prev => prev.map(s => s.id === editId ? { ...s, ...studentForm as Student } : s));
      } else {
        const newStud: Student = {
          id: 's_' + Date.now(),
          name: studentForm.name || '',
          avatar: studentForm.avatar || '🧸',
          phone: studentForm.phone || '',
          parentName: studentForm.parentName || '',
          parentPhone: studentForm.parentPhone || '',
          joinDate: studentForm.joinDate || new Date().toISOString().substring(0, 10),
          active: studentForm.active !== undefined ? studentForm.active : true,
          notes: studentForm.notes || ''
        };
        setStudents(prev => [...prev, newStud]);
      }
    } else if (activeSubTab === 'teachers') {
      if (!teacherForm.name) {
        setCustomAlert({ isOpen: true, title: '⚠️ 輸入錯誤', message: '請輸入名字喔！' });
        return;
      }
      if (editId) {
        setTeachers(prev => prev.map(t => t.id === editId ? { ...t, ...teacherForm as Teacher } : t));
      } else {
        const newTeach: Teacher = {
          id: 't_' + Date.now(),
          name: teacherForm.name || '',
          avatar: teacherForm.avatar || '🦒',
          instrument: teacherForm.instrument || '鋼琴',
          phone: teacherForm.phone || '',
          color: teacherForm.color || '#FCD34D'
        };
        setTeachers(prev => [...prev, newTeach]);
      }
    } else if (activeSubTab === 'rooms') {
      if (!roomForm.name) {
        setCustomAlert({ isOpen: true, title: '⚠️ 輸入錯誤', message: '請輸入房名喔！' });
        return;
      }
      if (editId) {
        setRooms(prev => prev.map(r => r.id === editId ? { 
          ...r, 
          ...roomForm as Room,
          currentRenter: roomForm.status === 'Rented' ? (roomForm.currentRenter || '') : undefined,
          currentRenterPhone: roomForm.status === 'Rented' ? (roomForm.currentRenterPhone || '') : undefined,
          currentPrice: roomForm.currentPrice !== undefined ? Number(roomForm.currentPrice) : undefined
        } : r));

        // Sync with reception roomRentals daily board list
        if (roomForm.status === 'Rented') {
          const renterName = roomForm.currentRenter || '現場客戶';
          const renterPhone = roomForm.currentRenterPhone || '';
          const timeSlot = roomForm.timeSlot || '13:00 - 14:00';
          const price = Number(roomForm.currentPrice) || 300;

          setRoomRentals(prev => {
            const existingIndex = prev.findIndex(r => r.roomId === editId && r.date === selectedDate);
            if (existingIndex >= 0) {
              return prev.map((item, idx) => idx === existingIndex ? {
                ...item,
                renterName,
                renterPhone,
                timeSlot,
                price,
                roomName: roomForm.name || item.roomName
              } : item);
            } else {
              const newRental: RoomRental = {
                id: 'rr_' + Date.now(),
                roomId: editId,
                roomName: roomForm.name || '',
                renterName,
                renterPhone,
                timeSlot,
                price,
                paid: false,
                date: selectedDate
              };
              return [...prev, newRental];
            }
          });
        } else {
          // If state is not Rented (e.g. Available or Maintenance), sync by removing or clearing its rental for today
          setRoomRentals(prev => prev.filter(r => !(r.roomId === editId && r.date === selectedDate)));
        }
      } else {
        const generatedRoomId = 'r_' + Date.now();
        const newRoom: Room = {
          id: generatedRoomId,
          name: roomForm.name || '',
          emoji: roomForm.emoji || '🎹',
          equipment: roomForm.equipment || '',
          status: roomForm.status as any || 'Available',
          timeSlot: roomForm.timeSlot || '13:00 - 14:00',
          currentPrice: roomForm.currentPrice !== undefined ? Number(roomForm.currentPrice) : 300,
          currentRenter: roomForm.status === 'Rented' ? (roomForm.currentRenter || '') : undefined,
          currentRenterPhone: roomForm.status === 'Rented' ? (roomForm.currentRenterPhone || '') : undefined
        };
        setRooms(prev => [...prev, newRoom]);

        if (newRoom.status === 'Rented') {
          const newRental: RoomRental = {
            id: 'rr_' + Date.now(),
            roomId: generatedRoomId,
            roomName: newRoom.name,
            renterName: newRoom.currentRenter || '現場客戶',
            renterPhone: newRoom.currentRenterPhone || '',
            timeSlot: newRoom.timeSlot || '13:00 - 14:00',
            price: newRoom.currentPrice || 300,
            paid: false,
            date: selectedDate
          };
          setRoomRentals(prev => [...prev, newRental]);
        }
      }
    } else if (activeSubTab === 'lessons') {
      const selectedStud = students.find(s => s.id === lessonForm.studentId);
      const selectedTeach = teachers.find(t => t.id === lessonForm.teacherId);
      if (!selectedStud || !selectedTeach) {
        setCustomAlert({ isOpen: true, title: '⚠️ 輸入錯誤', message: '請確實選擇學生和老師！' });
        return;
      }

      if (editId) {
        setLessons(prev => prev.map(l => l.id === editId ? {
          ...l,
          ...lessonForm,
          studentName: selectedStud.name,
          teacherName: selectedTeach.name
        } as Lesson : l));
      } else {
        const newLesson: Lesson = {
          id: 'l_' + Date.now(),
          studentId: lessonForm.studentId || '',
          studentName: selectedStud.name,
          teacherId: lessonForm.teacherId || '',
          teacherName: selectedTeach.name,
          instrument: lessonForm.instrument || '鋼琴',
          roomName: lessonForm.roomName || '愛麗絲鋼琴房',
          date: lessonForm.date || new Date().toISOString().substring(0, 10),
          timeSlot: lessonForm.timeSlot || '14:00 - 15:00',
          price: Number(lessonForm.price) || 1200,
          feePaid: lessonForm.feePaid || false,
          attendance: lessonForm.attendance || Attendance.Unchecked
        };
        setLessons(prev => [...prev, newLesson]);
      }
    } else if (activeSubTab === 'recurring-lessons') {
      const selectedStud = students.find(s => s.id === recurringLessonForm.studentId);
      const selectedTeach = teachers.find(t => t.id === recurringLessonForm.teacherId);
      if (!selectedStud || !selectedTeach) {
        setCustomAlert({ isOpen: true, title: '⚠️ 輸入錯誤', message: '請確實選擇學生和老師！' });
        return;
      }

      if (editId) {
        setRecurringLessons(prev => prev.map(rl => rl.id === editId ? {
          ...rl,
          studentId: recurringLessonForm.studentId || '',
          studentName: selectedStud.name,
          teacherId: recurringLessonForm.teacherId || '',
          teacherName: selectedTeach.name,
          instrument: recurringLessonForm.instrument || '鋼琴',
          roomName: recurringLessonForm.roomName || '愛麗絲鋼琴房',
          dayOfWeek: Number(recurringLessonForm.dayOfWeek) ?? 1,
          timeSlot: recurringLessonForm.timeSlot || '14:00 - 15:00',
          price: Number(recurringLessonForm.price) || 1200
        } : rl));
      } else {
        const newRL: RecurringLesson = {
          id: 'rl_' + Date.now(),
          studentId: recurringLessonForm.studentId || '',
          studentName: selectedStud.name,
          teacherId: recurringLessonForm.teacherId || '',
          teacherName: selectedTeach.name,
          instrument: recurringLessonForm.instrument || '鋼琴',
          roomName: recurringLessonForm.roomName || '愛麗絲鋼琴房',
          dayOfWeek: Number(recurringLessonForm.dayOfWeek) ?? 1,
          timeSlot: recurringLessonForm.timeSlot || '14:00 - 15:00',
          price: Number(recurringLessonForm.price) || 1200
        };
        setRecurringLessons(prev => [...prev, newRL]);
      }
    }
    setIsFormOpen(false);
  };

  // Filters for lists based on search bar
  const getFilteredItems = () => {
    const k = searchTerm.toLowerCase();
    if (activeSubTab === 'students') {
      return students.filter(s => s.name.toLowerCase().includes(k) || s.phone.includes(k) || (s.notes && s.notes.includes(k)));
    } else if (activeSubTab === 'teachers') {
      return teachers.filter(t => t.name.toLowerCase().includes(k) || t.instrument.toLowerCase().includes(k));
    } else if (activeSubTab === 'rooms') {
      return rooms.filter(r => r.name.toLowerCase().includes(k) || (r.equipment && r.equipment.toLowerCase().includes(k)));
    } else if (activeSubTab === 'lessons') {
      return lessons.filter(l => l.studentName.toLowerCase().includes(k) || l.teacherName.toLowerCase().includes(k) || l.instrument.toLowerCase().includes(k));
    } else if (activeSubTab === 'recurring-lessons') {
      return recurringLessons.filter(rl => 
        rl.studentName.toLowerCase().includes(k) || 
        rl.teacherName.toLowerCase().includes(k) || 
        rl.instrument.toLowerCase().includes(k) ||
        ['每週日', '每週一', '每週二', '每週三', '每週四', '每週五', '每週六'][rl.dayOfWeek].includes(k)
      );
    }
    return [];
  };

  const handleSimulateCheckInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { type, targetId, targetName, avatar } = simulationModal;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    if (type === 'student') {
      // 1. Mark attendance for today's lesson, if any
      const activeLessonsToday = lessons.filter(l => l.studentId === targetId && l.date === selectedDate);
      if (activeLessonsToday.length > 0) {
        setLessons(prev => prev.map(l => {
          if (l.studentId === targetId && l.date === selectedDate) {
            return {
              ...l,
              attendance: Attendance.CheckedIn,
              checkInTime: timeStr
            };
          }
          return l;
        }));
      }

      // 2. Draft message & notifying
      const lessonInfoText = activeLessonsToday.length > 0 
        ? `本日課程是 ${activeLessonsToday[0].timeSlot} 的「${activeLessonsToday[0].instrument}」`
        : '今日暫無正規排課 (自主教室自主練琴)';
      const noteText = simulationNote.trim() ? ` 📝 本日心情備忘：『${simulationNote}』` : '';
      const message = `🌸 【線上通知範例】學員「${targetName} ${avatar}」完成線上到班登入！(${timeStr})。${lessonInfoText}。${noteText}`;
      
      onEmitNotification(message, 'StudentCheckIn', targetName);
    } else {
      // Teacher
      const statusText = simulationNote.trim() ? ` 💬 教學小指南：『${simulationNote}』` : '';
      const message = `🦒 【線上通知範例】優質導師「${targetName} ${avatar}」已經順利抵達校區打卡簽到！教室整備狀況良好。${statusText}`;
      onEmitNotification(message, 'TeacherCheckIn', targetName);
    }

    // Reset and close
    setSimulationModal(prev => ({ ...prev, isOpen: false }));
    setSimulationNote('');
    setCustomAlert({
      isOpen: true,
      title: '✅ 簽到模擬成功！',
      message: `已成功模擬學員/教師「${targetName}」點擊線上簽到連結之行為！系統已即時廣播「叮咚」音效，並同步更新後台與大廳看板紀錄！`
    });
  };

  const handleCopyLink = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyFeedback(id);
      setTimeout(() => setCopyFeedback(null), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  const handleClearCheckinLogs = () => {
    setCustomConfirm({
      isOpen: true,
      title: '🧹 確定要清空簽到日誌嗎？',
      message: '這個動作將會清空系統所有的老師與學生線上簽到通知與歷史紀錄，但不影響今天目前的課堂簽到出席狀態喔！是否確定清空？',
      onConfirm: () => {
        setNotifications(prev => prev.filter(n => n.type !== 'StudentCheckIn' && n.type !== 'TeacherCheckIn'));
        setCustomConfirm(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const filteredItems = getFilteredItems();

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pb-12 text-brand-brown">
      
      {/* Role Notice & SubTabs */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 bg-brand-pink/20 px-4 py-2 border-2 border-brand-brown rounded-2xl shadow-[2px_2px_0px_#4A3728]">
          <ShieldCheck className="w-5 h-5 text-rose-500" />
          <span className="font-extrabold text-sm md:text-md">🌸 管理者後台 (資料維護配置與日常排課)</span>
        </div>
        
        {/* Sub Navigator */}
        <div className="flex bg-white border-2 border-brand-brown rounded-2xl p-1 gap-1 shadow-[2px_2px_0px_#4A3728] flex-wrap justify-center">
          {[
            { key: 'students', label: '🧸 學員管理' },
            { key: 'teachers', label: '🦒 師資名冊' },
            { key: 'rooms', label: '🎹 教室清單' },
            { key: 'lessons', label: '📅 臨時排課' },
            { key: 'recurring-lessons', label: '🔄 固定常規排課' },
            { key: 'checkin-links', label: '🔗 線上簽到' },
            { key: 'google-drive', label: '☁️ 雲端與備份' },
            { key: 'settings', label: '⚙️ 密碼設定' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveSubTab(tab.key as any);
                setSearchTerm('');
              }}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs md:text-sm transition-all cursor-pointer ${
                activeSubTab === tab.key
                  ? 'bg-brand-pink text-brand-brown shadow-[1px_1px_0px_#4A3728]'
                  : 'hover:bg-slate-100 text-brand-brown/70 bg-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Filter and Add Bar */}
      {activeSubTab !== 'settings' && activeSubTab !== 'checkin-links' && activeSubTab !== 'google-drive' && (
        <div className="sketchy-card bg-white p-4 flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto flex-1">
            <div className="relative w-full sm:max-w-xs">
              <Search className="w-4 h-4 text-brand-brown/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="admin-search-input"
                type="text"
                placeholder={`搜尋${activeSubTab === 'students' ? '學員' : activeSubTab === 'teachers' ? '教師' : activeSubTab === 'rooms' ? '琴房' : activeSubTab === 'lessons' ? '臨時課程' : '固定常規課程'}資訊...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs md:text-sm pl-9 pr-4 py-2 border-2 border-brand-brown rounded-xl bg-brand-cream/30 focus:outline-none focus:bg-white transition-all font-semibold"
              />
            </div>

            {/* Sync Date Selector for Rooms Tab */}
            {activeSubTab === 'rooms' && (
              <div className="flex items-center gap-2 bg-brand-cream/40 border-2 border-brand-brown rounded-xl px-3 py-1.5 w-full sm:w-auto relative cursor-pointer shadow-[2px_2px_0px_#4A3728]">
                <CalendarCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="text-xs font-black text-[#4A3728] shrink-0">租借查詢日期:</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="font-extrabold text-amber-900 bg-transparent focus:outline-none text-xs cursor-pointer"
                />
              </div>
            )}
          </div>

          <button
            id="admin-add-new-btn"
            onClick={handleOpenNew}
            className="sketchy-button bg-brand-green hover:bg-emerald-250 text-brand-brown px-4 py-2 text-xs md:text-sm flex items-center gap-1 w-full sm:w-auto justify-center cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>
              新增
              {activeSubTab === 'students' ? '寶貝學員' : activeSubTab === 'teachers' ? '優質導師' : activeSubTab === 'rooms' ? '音樂琴房' : '預約課程'}
            </span>
          </button>
        </div>
      )}

      {/* Sub Views Table/Card Grids */}
      {activeSubTab === 'checkin-links' ? (
        <div className="space-y-6">
          <div className="sketchy-card bg-emerald-50 border-emerald-600 p-5">
            <h3 className="font-black text-xl flex items-center gap-2 text-emerald-800">
              <Link className="w-5 h-5 text-emerald-700 animate-pulse" />
              <span>🔗 師生家長線上簽到專屬系統</span>
            </h3>
            <p className="text-xs md:text-sm text-emerald-900/85 mt-2 font-bold leading-relaxed">
              此管理面板整合了每位學員及優質導師的專屬線上簽到連結。
              您可以點擊右側複製 LINE 專屬格式連結，發送至家長或老師的聯絡群組中。
              當學員點擊或您進行
              <strong className="text-emerald-950 font-black">「模擬線上簽到」</strong> 時，系統會即時發送廣播通知，
              播放「叮咚」到班音樂，並在櫃台看板、後台簽到歷史中同步紀錄！
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: List of copyable/clickable sign-in links */}
            <div className="lg:col-span-7 space-y-6">
              {/* Student Segment */}
              <div className="sketchy-card bg-white p-5">
                <div className="flex items-center justify-between border-b-2 border-brand-brown pb-2 mb-4">
                  <h4 className="font-black text-lg flex items-center gap-2">
                    <span>🧸 寶貝學員線上到班簽到連結</span>
                  </h4>
                  <span className="text-xs bg-brand-blue/20 border border-brand-brown/40 px-2.5 py-0.5 rounded-full font-bold">
                    共 {students.length} 位
                  </span>
                </div>

                <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                  {students.map((stud) => {
                    const checkinUrl = `${window.location.origin}/?role=selfCheckIn`;
                    const lineText = `【哆咪音樂坊】親愛的 ${stud.name} 寶貝家長您好，這是您專屬的線上簽到到班預約連結，請在到教室時點選完成簽到：${checkinUrl}`;
                    const isCopied = copyFeedback === `stud_${stud.id}`;

                    return (
                      <div key={stud.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border-2 border-brand-brown bg-brand-cream/10 rounded-xl gap-3">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl p-1 bg-white border border-brand-brown rounded-full w-10.5 h-10.5 flex items-center justify-center shadow-[1px_1px_0px_#4A3728]">
                            {stud.avatar}
                          </span>
                          <div>
                            <h5 className="font-black text-sm text-brand-brown">{stud.name}</h5>
                            <span className="text-[10px] bg-sky-100 border border-brand-brown/20 px-1.5 py-0.2 rounded font-bold text-sky-850">
                              手機: {stud.phone}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          <button
                            onClick={() => handleCopyLink(lineText, `stud_${stud.id}`)}
                            className="px-2.5 py-1 text-xs bg-brand-blue font-extrabold border border-brand-brown rounded-lg hover:bg-sky-200 transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <ClipboardCopy className="w-3 h-3" />
                            <span>{isCopied ? '已複製！' : '複製LINE連結'}</span>
                          </button>

                          <button
                            onClick={() => setSimulationModal({
                              isOpen: true,
                              type: 'student',
                              targetId: stud.id,
                              targetName: stud.name,
                              avatar: stud.avatar
                            })}
                            className="px-2.5 py-1 text-xs bg-brand-green font-extrabold border border-brand-brown rounded-lg hover:bg-emerald-200 transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <UserCheck className="w-3 animate-pulse" />
                            <span>模擬線上簽到</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Teacher Segment */}
              <div className="sketchy-card bg-white p-5">
                <div className="flex items-center justify-between border-b-2 border-brand-brown pb-2 mb-4">
                  <h4 className="font-black text-lg flex items-center gap-2">
                    <span>🦒 優質教師在校簽到連結</span>
                  </h4>
                  <span className="text-xs bg-brand-pink/20 border border-brand-brown/40 px-2.5 py-0.5 rounded-full font-bold">
                    共 {teachers.length} 位
                  </span>
                </div>

                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {teachers.map((teach) => {
                    const checkinUrl = `${window.location.origin}/?role=selfCheckIn`;
                    const lineText = `【哆咪音樂坊】親愛的 ${teach.name} 老師您好，這是您專屬的在校打卡簽到連結，抵達校區時記得點選簽到喔：${checkinUrl}`;
                    const isCopied = copyFeedback === `teach_${teach.id}`;

                    return (
                      <div key={teach.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border-2 border-brand-brown bg-brand-cream/10 rounded-xl gap-3">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl p-1 bg-white border border-brand-brown rounded-full w-10.5 h-10.5 flex items-center justify-center shadow-[1px_1px_0px_#4A3728]">
                            {teach.avatar}
                          </span>
                          <div>
                            <h5 className="font-black text-sm text-brand-brown">{teach.name}</h5>
                            <span className="text-[10px] bg-pink-100 border border-brand-brown/20 px-1.5 py-0.2 rounded font-bold text-pink-850">
                              專長: {teach.instrument}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          <button
                            onClick={() => handleCopyLink(lineText, `teach_${teach.id}`)}
                            className="px-2.5 py-1 text-xs bg-brand-pink font-extrabold border border-brand-brown rounded-lg hover:bg-rose-200 transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <ClipboardCopy className="w-3 h-3" />
                            <span>{isCopied ? '已複製！' : '複製LINE連結'}</span>
                          </button>

                          <button
                            onClick={() => setSimulationModal({
                              isOpen: true,
                              type: 'teacher',
                              targetId: teach.id,
                              targetName: teach.name,
                              avatar: teach.avatar
                            })}
                            className="px-2.5 py-1 text-xs bg-brand-green font-extrabold border border-brand-brown rounded-lg hover:bg-emerald-200 transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <UserCheck className="w-3 animate-pulse" />
                            <span>模擬老師簽到</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Sign Notification Logs */}
            <div className="lg:col-span-5 space-y-6">
              <div className="sketchy-card bg-brand-cream p-5 shadow-[4px_4px_0px_#4A3728]">
                <div className="flex justify-between items-center border-b-2 border-brand-brown pb-3 mb-4">
                  <h4 className="font-black text-md flex items-center gap-1.5">
                    <History className="w-4 h-4 text-brand-brown/75 animate-spin-slow" />
                    <span>🔔 線上簽到即時日誌紀錄</span>
                  </h4>
                  <button
                    onClick={handleClearCheckinLogs}
                    className="text-[10px] bg-red-100 font-extrabold px-2 py-0.5 border border-brand-brown/40 rounded transition-all cursor-pointer hover:bg-red-200"
                  >
                    清空日誌
                  </button>
                </div>

                {/* Filter tab for check-ins inside Ledger */}
                <div className="flex gap-1 mb-4 bg-white/60 p-1 border border-brand-brown/30 rounded-lg">
                  {(['all', 'student', 'teacher'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setCheckinFilterType(t)}
                      className={`flex-1 py-1 text-[10px] font-black rounded transition-all cursor-pointer ${
                        checkinFilterType === t
                          ? 'bg-brand-brown text-white shadow-xs'
                          : 'hover:bg-brand-brown/10 text-brand-brown/80'
                      }`}
                    >
                      {t === 'all' ? '全部顯示' : t === 'student' ? '僅看學員' : '僅看老師'}
                    </button>
                  ))}
                </div>

                {/* Filter notifications log */}
                {(() => {
                  const checkinLogs = notifications.filter(n => {
                    const isCheckin = n.type === 'StudentCheckIn' || n.type === 'TeacherCheckIn';
                    if (!isCheckin) return false;
                    if (checkinFilterType === 'student') return n.type === 'StudentCheckIn';
                    if (checkinFilterType === 'teacher') return n.type === 'TeacherCheckIn';
                    return true;
                  });

                  if (checkinLogs.length === 0) {
                    return (
                      <div className="text-center py-10 bg-white/70 border border-dashed border-brand-brown/30 rounded-xl">
                        <Smile className="w-8 h-8 text-brand-brown/40 mx-auto mb-2 animate-bounce flex items-center justify-center text-center leading-none" />
                        <p className="text-xs font-bold text-brand-brown/60">目前暫無任何線上簽到日誌</p>
                        <p className="text-[10px] text-brand-brown/40 mt-0.5">點擊左側「模擬線上簽到」或</p>
                        <p className="text-[10px] text-brand-brown/40">使用線上簽到頁即可觸發紀錄！</p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
                      {checkinLogs.map((log) => (
                        <div key={log.id} className="p-3 bg-white border border-brand-brown shadow-[1.5px_1.5px_0px_#4A3728] rounded-xl text-xs relative overflow-hidden">
                          {/* Accent band */}
                          <div className={`absolute left-0 inset-y-0 w-1 ${
                            log.type === 'StudentCheckIn' ? 'bg-brand-blue' : 'bg-brand-pink'
                          }`} />
                          
                          <div className="flex justify-between items-start mb-1.5 pl-1.5">
                            <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded border border-brand-brown/30 ${
                              log.type === 'StudentCheckIn' ? 'bg-indigo-100 text-indigo-800' : 'bg-pink-100 text-pink-800'
                            }`}>
                              {log.type === 'StudentCheckIn' ? '備聯🧸完成簽到' : '優師🦒完成打卡'}
                            </span>
                            <span className="text-[10px] text-brand-brown/60 font-black">{log.time}</span>
                          </div>

                          <p className="text-xs font-bold text-brand-brown/90 leading-relaxed pl-1.5 break-words">
                            {log.message.replace('🌸 【線上通知】', '').replace('🦒 【線上通知】', '').replace('🌸 【線上通知範例】', '').replace('🦒 【線上通知範例】', '')}
                          </p>
                        </div>
                      ))}
                    </div>
                  );
                })()}

              </div>
            </div>
          </div>
        </div>
      ) : activeSubTab === 'google-drive' ? (
        <GoogleDriveView
          students={students}
          teachers={teachers}
          rooms={rooms}
          lessons={lessons}
          roomRentals={roomRentals}
          recurringLessons={recurringLessons}
          notifications={notifications}
          setStudents={setStudents}
          setTeachers={setTeachers}
          setRooms={setRooms}
          setLessons={setLessons}
          setRoomRentals={setRoomRentals}
          setRecurringLessons={setRecurringLessons}
          setNotifications={setNotifications}
          onEmitNotification={onEmitNotification}
        />
      ) : activeSubTab === 'settings' ? (
        <div className="sketchy-card bg-white p-6 max-w-2xl mx-auto text-brand-brown">
          <div className="flex items-center gap-2 border-b-2 border-brand-brown pb-3 mb-6">
            <span className="text-2xl">🔐</span>
            <h3 className="text-xl font-black">後台與櫃台登入密碼設定</h3>
          </div>

          <div className="space-y-6">
            <div className="bg-brand-orange bg-opacity-20 p-4 border-2 border-brand-brown rounded-xl text-xs space-y-1">
              <p className="font-extrabold text-amber-800">💡 系統安全性提示：</p>
              <p>• 為防止學員或家長在自主簽到模式下任意切換至櫃台每日看板或管理者後台，請在此定期設定與更新密碼。</p>
              <p>• 預設管理者密碼為 <code className="bg-slate-100 px-1.5 py-0.5 border border-brand-brown/40 rounded text-amber-955 font-extrabold text-xs">admin</code>。</p>
              <p>• 預設櫃台登入密碼為 <code className="bg-slate-100 px-1.5 py-0.5 border border-brand-brown/40 rounded text-amber-955 font-extrabold text-xs">staff</code>。</p>
            </div>

            <div>
              <label className="block text-sm font-extrabold mb-1.5 flex items-center gap-1.5">
                <span>👑 管理者後台 (Admin) 登入密碼</span>
              </label>
              <input
                id="settings-admin-pwd-input"
                type="text"
                value={adminPwdSetting}
                onChange={(e) => setAdminPwdSetting(e.target.value)}
                className="sketchy-input w-full font-bold"
                placeholder="請輸入管理者密碼"
              />
            </div>

            <div>
              <label className="block text-sm font-extrabold mb-1.5 flex items-center gap-1.5">
                <span>🙋 櫃台收銀每日看板 (Reception) 登入密碼</span>
              </label>
              <input
                id="settings-reception-pwd-input"
                type="text"
                value={receptionPwdSetting}
                onChange={(e) => setReceptionPwdSetting(e.target.value)}
                className="sketchy-input w-full font-bold"
                placeholder="請輸入櫃台登入密碼"
              />
            </div>

            <div className="pt-2">
              <button
                id="settings-save-pwd-btn"
                onClick={() => {
                  localStorage.setItem('doremi_admin_pwd', adminPwdSetting);
                  localStorage.setItem('doremi_reception_pwd', receptionPwdSetting);
                  setIsPwdSaved(true);
                  setTimeout(() => setIsPwdSaved(false), 3000);
                }}
                className="sketchy-button w-full bg-brand-green py-3 px-4 font-black flex items-center justify-center gap-2"
              >
                {isPwdSaved ? "✨ 已成功儲存並同步新密碼！" : "💾 儲存並套用新密碼"}
              </button>
            </div>
          </div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="sketchy-card bg-white py-16 text-center text-brand-brown/50">
          <span className="text-5xl block mb-2">🎨</span>
          <p className="font-bold text-lg">目前尚無符合的資料檔案</p>
          <p className="text-xs text-brand-brown/50 mt-1">您可以點擊右上方『新增』按鈕來建立一筆！</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Student Map Cards */}
          {activeSubTab === 'students' && (filteredItems as Student[]).map((stud) => (
            <div id={`stud-card-${stud.id}`} key={stud.id} className="sketchy-card sketchy-card-interactive bg-white p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3 border-b border-brand-brown/25 pb-3">
                  <span className="text-3xl p-1 bg-white border border-brand-brown rounded-full w-12 h-12 flex items-center justify-center shadow-[1px_1px_0px_#4A3728]">
                    {stud.avatar}
                  </span>
                  <div>
                    <h4 className="font-extrabold text-lg text-brand-brown">{stud.name}</h4>
                    <span className="text-[10px] bg-sky-100 border border-brand-brown/60 px-2 py-0.5 rounded-full font-bold">
                      入學: {stud.joinDate}
                    </span>
                  </div>
                  <span className={`ml-auto text-xs px-2 py-0.5 rounded-full border border-brand-brown font-bold ${stud.active ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                    {stud.active ? '學習中' : '休息中'}
                  </span>
                </div>
                <div className="text-xs space-y-1.5 text-brand-brown/85 font-semibold">
                  <p>📞 聯絡電話: {stud.phone}</p>
                  <p>👪 家長代表: {stud.parentName} ({stud.parentPhone})</p>
                  {stud.notes && (
                    <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900 leading-relaxed italic">
                      📝 {stud.notes}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 justify-end mt-4 pt-3 border-t border-brand-brown/15">
                <button
                  onClick={() => handleEdit(stud.id)}
                  className="p-1.5 rounded-lg border border-brand-brown bg-slate-50 hover:bg-slate-200 text-brand-brown transition-transform active:translate-y-0.2"
                  title="修改"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(stud.id)}
                  className="p-1.5 rounded-lg border border-brand-brown bg-red-100 hover:bg-red-200 text-red-600 transition-transform active:translate-y-0.2"
                  title="刪除學員並連動取消排課"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {/* Teacher Map Cards */}
          {activeSubTab === 'teachers' && (filteredItems as Teacher[]).map((teach) => (
            <div id={`teach-card-${teach.id}`} key={teach.id} className="sketchy-card sketchy-card-interactive bg-white p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3 border-b border-brand-brown/25 pb-3">
                  <span className="text-3xl p-1 bg-white border border-brand-brown rounded-full w-12 h-12 flex items-center justify-center shadow-[1px_1px_0px_#4A3728]">
                    {teach.avatar}
                  </span>
                  <div>
                    <h4 className="font-extrabold text-lg text-brand-brown">{teach.name}</h4>
                    <span 
                      className="text-[10px] border border-brand-brown/60 px-2 py-0.5 rounded-full font-bold block mt-1" 
                      style={{ backgroundColor: teach.color + '40' }}
                    >
                      專長：{teach.instrument}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-brand-brown/85 font-semibold space-y-1">
                  <p>📞 聯絡電話: {teach.phone}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="w-4 h-4 rounded-full border border-brand-brown shadow-[1px_1px_0px_#4A3728]" style={{ backgroundColor: teach.color }} />
                    <span className="text-[11px] text-brand-brown/70">教室專屬色標</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end mt-4 pt-3 border-t border-brand-brown/15">
                <button
                  onClick={() => handleEdit(teach.id)}
                  className="p-1.5 rounded-lg border border-brand-brown bg-slate-50 hover:bg-slate-200 text-brand-brown"
                  title="修改"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(teach.id)}
                  className="p-1.5 rounded-lg border border-brand-brown bg-red-100 hover:bg-red-200 text-red-600"
                  title="解聘與刪除連動"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {/* Room Map Cards */}
          {activeSubTab === 'rooms' && (filteredItems as Room[]).map((room) => {
            // Check if there is an active rental on the selected date
            const targetRental = roomRentals.find(r => r.roomId === room.id && r.date === selectedDate);
            const isRentedOnDate = !!targetRental;
            
            // Effective status of room on this day
            const effectiveStatus = room.status === 'Maintenance' 
              ? 'Maintenance' 
              : (isRentedOnDate ? 'Rented' : 'Available');

            const renterName = targetRental ? targetRental.renterName : undefined;
            const renterPhone = targetRental ? targetRental.renterPhone : undefined;
            const timeSlot = targetRental ? targetRental.timeSlot : (room.timeSlot || '未設定');
            const price = targetRental ? targetRental.price : (room.currentPrice ?? 300);
            const isPaid = targetRental ? targetRental.paid : false;

            return (
              <div id={`room-card-${room.id}`} key={room.id} className="sketchy-card sketchy-card-interactive bg-white p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3 border-b border-brand-brown/25 pb-3">
                    <span className="text-3xl p-1 bg-white border border-brand-brown rounded-full w-12 h-12 flex items-center justify-center shadow-[1px_1px_0px_#4A3728]">
                      {room.emoji}
                    </span>
                    <div>
                      <h4 className="font-extrabold text-lg text-brand-brown">{room.name}</h4>
                      <span className={`text-[10px] border border-brand-brown px-2 py-0.2 rounded-full font-bold block mt-1 ${
                        effectiveStatus === 'Available' ? 'bg-emerald-100 text-emerald-800' : effectiveStatus === 'Rented' ? 'bg-rose-100 text-rose-805' : 'bg-amber-100 text-amber-800'
                      }`}>
                        狀態({selectedDate}): {effectiveStatus === 'Available' ? '閒置中' : effectiveStatus === 'Rented' ? '出租中' : '保養中'}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-brand-brown/85 font-semibold space-y-1">
                    <p>🎹 音樂配備: {room.equipment || '基本譜架與鋼琴'}</p>
                    {effectiveStatus === 'Rented' ? (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 text-[10px] space-y-1 mt-2">
                        <div className="flex justify-between items-center mb-1">
                          <p>👤 租用客戶: <strong className="font-extrabold text-red-950">{renterName}</strong></p>
                          <span className={`text-[9px] font-black px-1.5 py-0.2 rounded border ${
                            isPaid 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                              : 'bg-rose-50 text-rose-700 border-rose-300'
                          }`}>
                            {isPaid ? '已付款' : '待收款'}
                          </span>
                        </div>
                        {renterPhone && <p>📞 聯絡電話: <span className="font-mono text-slate-700">{renterPhone}</span></p>}
                        <p>🕒 租借時段: <span className="font-bold text-indigo-900">{timeSlot || '未設定'}</span></p>
                        <p>💰 租用金額: <span className="font-extrabold text-rose-600">$ {price} 元</span></p>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="flex gap-2 justify-end mt-4 pt-3 border-t border-brand-brown/15">
                  <button
                    onClick={() => handleEdit(room.id)}
                    className="p-1.5 rounded-lg border border-brand-brown bg-slate-50 hover:bg-slate-200 text-brand-brown cursor-pointer"
                    title="修改"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(room.id)}
                    className="p-1.5 rounded-lg border border-brand-brown bg-red-100 hover:bg-red-200 text-red-600 cursor-pointer"
                    title="刪除教室"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Lesson Schedule Map Cards */}
          {activeSubTab === 'lessons' && (filteredItems as Lesson[]).map((les) => (
            <div id={`les-card-${les.id}`} key={les.id} className="sketchy-card sketchy-card-interactive bg-white p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-brand-brown/25 pb-2.5 mb-3">
                  <span className="text-xs font-black bg-brand-yellow px-2 py-0.5 rounded-md border border-brand-brown shadow-[1px_1px_0px_#4A3728]">
                    {les.timeSlot}
                  </span>
                  <span className={`text-[10px] border border-brand-brown px-2 py-0.5 rounded-full font-bold ${
                    les.feePaid ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {les.feePaid ? '💰 已付費' : '💸 待收 $ ' + les.price}
                  </span>
                </div>

                <div className="space-y-2 text-xs font-semibold text-brand-brown">
                  <div className="flex gap-2 items-center">
                    <span className="text-xl">👩‍🎓</span>
                    <span>學員及課程: <strong className="text-brand-brown text-sm">{les.studentName}</strong> ({les.instrument})</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="text-xl">🦒</span>
                    <span>指導老師: <strong className="text-brand-brown">{les.teacherName}</strong></span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="text-xl">🚪</span>
                    <span>排課琴房: <span className="p-1 bg-brand-cream border border-brand-brown rounded text-[11px]">{les.roomName}</span></span>
                  </div>
                  <div className="flex gap-2 items-center mt-3 pt-2 border-t border-dashed border-brand-brown/30 text-brand-brown/80">
                    <span>簽到情形: </span>
                    <span className={`px-2 py-0.5 rounded border border-brand-brown/60 text-[10px] font-extrabold ${
                      les.attendance === Attendance.CheckedIn ? 'bg-emerald-200' :
                      les.attendance === Attendance.Absent ? 'bg-rose-200' :
                      les.attendance === Attendance.Excused ? 'bg-amber-200' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {les.attendance === Attendance.CheckedIn ? `🟢 已簽到 ${les.checkInTime || ''}` :
                       les.attendance === Attendance.Absent ? '🔴 缺席' :
                       les.attendance === Attendance.Excused ? '🟡 請假' : '⚪ 未簽到'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end mt-4 pt-3 border-t border-brand-brown/15">
                <button
                  onClick={() => handleEdit(les.id)}
                  className="p-1.5 rounded-lg border border-brand-brown bg-slate-50 hover:bg-slate-200 text-brand-brown"
                  title="修改排課"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(les.id)}
                  className="p-1.5 rounded-lg border border-brand-brown bg-red-100 hover:bg-red-200 text-red-600"
                  title="取消排課"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {/* Recurring Lesson Templates Map Cards */}
          {activeSubTab === 'recurring-lessons' && (filteredItems as RecurringLesson[]).map((rl) => (
            <div id={`rl-card-${rl.id}`} key={rl.id} className="sketchy-card sketchy-card-interactive bg-white p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-brand-brown/25 pb-2.5 mb-3">
                  <span className="text-xs font-black bg-brand-pink px-2.5 py-0.5 rounded-md border border-brand-brown shadow-[1px_1px_0px_#4A3728] flex items-center gap-1">
                    🔄 {['每週日', '每週一', '每週二', '每週三', '每週四', '每週五', '每週六'][rl.dayOfWeek]}
                  </span>
                  <span className="text-xs font-semibold bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full text-indigo-700">
                    ⏰ {rl.timeSlot}
                  </span>
                </div>

                <div className="space-y-2 text-xs font-semibold text-brand-brown">
                  <div className="flex gap-2 items-center">
                    <span className="text-xl">🧸</span>
                    <span>學員及課程: <strong className="text-brand-brown text-sm">{rl.studentName}</strong> ({rl.instrument})</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="text-xl">🦒</span>
                    <span>固定老師: <strong className="text-brand-brown">{rl.teacherName}</strong></span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="text-xl">🚪</span>
                    <span>固定琴房: <span className="p-1 bg-brand-cream border border-brand-brown rounded text-[11px]">{rl.roomName}</span></span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="text-xl">💰</span>
                    <span>常規學費: <strong className="text-emerald-700 text-sm">$ {rl.price}</strong> / 堂</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end mt-4 pt-3 border-t border-brand-brown/15">
                <button
                  onClick={() => handleEdit(rl.id)}
                  className="p-1.5 rounded-lg border border-brand-brown bg-slate-50 hover:bg-slate-200 text-brand-brown"
                  title="修改固定排課"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(rl.id)}
                  className="p-1.5 rounded-lg border border-brand-brown bg-red-100 hover:bg-red-200 text-red-600"
                  title="刪除固定排課"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

        </div>
      )}

      {/* CRUD Pop-up Overlay Modal Custom Styled */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <form 
            onSubmit={handleSubmit}
            className="w-full max-w-lg bg-brand-cream border-4 border-brand-brown rounded-[24px] shadow-[8px_8px_0px_#4A3728] p-6 relative overflow-hidden animate-in zoom-in-95 duration-150"
          >
            {/* Header */}
            <div className="flex justify-between items-center border-b-2 border-brand-brown pb-3 mb-4">
              <h3 className="font-black text-xl flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500 animate-spin-slow" />
                <span>
                  {editId ? '編輯' : '新增'}
                  {activeSubTab === 'students' ? '學員卡' : activeSubTab === 'teachers' ? '老師卡' : activeSubTab === 'rooms' ? '琴房' : activeSubTab === 'lessons' ? '臨時/單次排課' : '常規固定排課'}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-1 hover:bg-slate-100 border border-brand-brown rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Fields according to SubTab */}
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
              
              {/* STUDENT FORM */}
              {activeSubTab === 'students' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1">🐣 寶貝姓名</label>
                      <input
                        type="text"
                        required
                        className="w-full sketchy-input text-sm"
                        value={studentForm.name || ''}
                        onChange={(e) => setStudentForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="例如：小熊奇奇"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">🎨 可愛圖像表徵</label>
                      <select
                        className="w-full sketchy-input text-sm"
                        value={studentForm.avatar || '🧸'}
                        onChange={(e) => setStudentForm(prev => ({ ...prev, avatar: e.target.value }))}
                      >
                        <option value="🧸">🧸 小熊</option>
                        <option value="🐰">🐰 兔兔</option>
                        <option value="🐱">🐱 貓咪</option>
                        <option value="🐷">🐷 小豬</option>
                        <option value="🦊">🦊 狐狸</option>
                        <option value="🐼">🐼 熊貓</option>
                        <option value="🐹">🐹 倉鼠</option>
                        <option value="🦁">🦁 獅子</option>
                        <option value="🦉">🦉 貓頭鷹</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">📞 學員電話</label>
                    <input
                      type="text"
                      className="w-full sketchy-input text-sm"
                      value={studentForm.phone || ''}
                      onChange={(e) => setStudentForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="例如：0912-345-678"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1">👪 家長聯絡姓名</label>
                      <input
                        type="text"
                        className="w-full sketchy-input text-sm"
                        value={studentForm.parentName || ''}
                        onChange={(e) => setStudentForm(prev => ({ ...prev, parentName: e.target.value }))}
                        placeholder="例如：熊媽媽"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">📞 家長電話</label>
                      <input
                        type="text"
                        className="w-full sketchy-input text-sm"
                        value={studentForm.parentPhone || ''}
                        onChange={(e) => setStudentForm(prev => ({ ...prev, parentPhone: e.target.value }))}
                        placeholder="同上，或輸入其他"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1">📅 入學/創立日期</label>
                      <input
                        type="date"
                        className="w-full sketchy-input text-sm"
                        value={studentForm.joinDate || ''}
                        onChange={(e) => setStudentForm(prev => ({ ...prev, joinDate: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">🟢 學員啟用狀態</label>
                      <select
                        className="w-full sketchy-input text-sm"
                        value={studentForm.active ? 'true' : 'false'}
                        onChange={(e) => setStudentForm(prev => ({ ...prev, active: e.target.value === 'true' }))}
                      >
                        <option value="true">學習啟用中</option>
                        <option value="false">暫停班級</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">📝 教師交代備註</label>
                    <textarea
                      className="w-full sketchy-input text-sm min-h-[60px]"
                      value={studentForm.notes || ''}
                      onChange={(e) => setStudentForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="學習狀況提醒：例如『容易走音需要拍子提示碼』..."
                    />
                  </div>
                </>
              )}

              {/* TEACHER FORM */}
              {activeSubTab === 'teachers' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1">🦒 老師尊稱 (綽號)</label>
                      <input
                        type="text"
                        required
                        className="w-full sketchy-input text-sm"
                        value={teacherForm.name || ''}
                        onChange={(e) => setTeacherForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="例如：長頸鹿老師"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">🍎 手繪風動物頭像</label>
                      <select
                        className="w-full sketchy-input text-sm"
                        value={teacherForm.avatar || '🦒'}
                        onChange={(e) => setTeacherForm(prev => ({ ...prev, avatar: e.target.value }))}
                      >
                        <option value="🦒">🦒 長頸鹿</option>
                        <option value="🐘">🐘 大象</option>
                        <option value="🐨">🐨 無尾熊</option>
                        <option value="🦁">🦁 獅子王</option>
                        <option value="🦉">🦉 貓頭鷹</option>
                        <option value="🐰">🐰 兔兔姐姐</option>
                        <option value="🦥">🦥 樹懶</option>
                        <option value="🐸">🐸 青蛙少爺</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">🎻 指導樂器學科 (多個可用斜線隔開)</label>
                    <input
                      type="text"
                      required
                      className="w-full sketchy-input text-sm"
                      value={teacherForm.instrument || ''}
                      onChange={(e) => setTeacherForm(prev => ({ ...prev, instrument: e.target.value }))}
                      placeholder="例如：鋼琴 / 視唱樂理 / 幼兒律動"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">📞 教師連絡電話</label>
                    <input
                      type="text"
                      className="w-full sketchy-input text-sm"
                      value={teacherForm.phone || ''}
                      onChange={(e) => setTeacherForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="例如：0988-123-456"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">🎨 專屬手繪配色標籤 (給管理者視覺)</label>
                    <div className="flex items-center gap-3 mt-1.5">
                      {[
                        { hex: '#FCD34D', name: '溫馨黃' },
                        { hex: '#81E6D9', name: '湖水綠' },
                        { hex: '#C084FC', name: '夢幻紫' },
                        { hex: '#F87171', name: '蘋果紅' },
                        { hex: '#93C5FD', name: '晴空藍' },
                        { hex: '#FFAEC0', name: '蜜桃粉' }
                      ].map((col) => (
                        <button
                          type="button"
                          key={col.hex}
                          onClick={() => setTeacherForm(prev => ({ ...prev, color: col.hex }))}
                          className={`w-8 h-8 rounded-full border-2 border-brand-brown cursor-pointer transition-transform ${
                            teacherForm.color === col.hex ? 'scale-120 ring-2 ring-amber-500 ring-offset-2' : 'opacity-70 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: col.hex }}
                          title={col.name}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* ROOM FORM */}
              {activeSubTab === 'rooms' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1">🎹 琴房名稱</label>
                      <input
                        type="text"
                        required
                        className="w-full sketchy-input text-sm"
                        value={roomForm.name || ''}
                        onChange={(e) => setRoomForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="例如：蕭邦三角鋼琴房"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">🎹 代表圖標 (Emoji)</label>
                      <select
                        className="w-full sketchy-input text-sm"
                        value={roomForm.emoji || '🎹'}
                        onChange={(e) => setRoomForm(prev => ({ ...prev, emoji: e.target.value }))}
                      >
                        <option value="🎹">🎹 鋼琴世界</option>
                        <option value="🎻">🎻 古典弦樂</option>
                        <option value="🥁">🥁 狂野熱血鼓</option>
                        <option value="🎸">🎸 溫暖吉他</option>
                        <option value="🎺">🎺 小號管樂</option>
                        <option value="🎤">🎤 練唱高歌</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">🛠 琴房內部主要配備</label>
                    <input
                      type="text"
                      className="w-full sketchy-input text-sm"
                      value={roomForm.equipment || ''}
                      onChange={(e) => setRoomForm(prev => ({ ...prev, equipment: e.target.value }))}
                      placeholder="多個常用頓號隔開：經典立式鋼琴、隔音海綿、節拍器架、木質冷風扇"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">🚦 琴房維護狀態</label>
                    <select
                      className="w-full sketchy-input text-sm"
                      value={roomForm.status || 'Available'}
                      onChange={(e) => setRoomForm(prev => ({ ...prev, status: e.target.value as any }))}
                    >
                      <option value="Available">🟢 狀態閒置 (可供租借/預約課程)</option>
                      <option value="Rented">🔴 使用租借中 (櫃台手動調撥)</option>
                      <option value="Maintenance">🟡 調音保養中 (暫停外租/排課)</option>
                    </select>
                  </div>

                  <div className="bg-rose-50/50 border-2 border-dashed border-rose-300 p-3 rounded-xl mt-3 space-y-3">
                    <p className="text-xs font-black text-rose-700">👤 當前租客登記資訊 (若無人租借，請點選上方「準備閒置」狀態且不需填寫下表喔)：</p>
                    
                    {/* QUICK MEMBERS COMBINE OPTION */}
                    <div className="bg-white p-2 rounded-lg border border-brand-brown/15 shadow-inner">
                      <label className="block text-[10px] font-black text-brand-brown mb-1">👤 內建快速選擇成員 (點選即帶入下表並設為租用)：</label>
                      <select
                        className="w-full sketchy-input text-xs"
                        value=""
                        onChange={(e) => {
                          if (!e.target.value) return;
                          const [type, id] = e.target.value.split(':');
                          if (type === 'student') {
                            const s = students.find(item => item.id === id);
                            if (s) {
                              setRoomForm(prev => ({
                                ...prev,
                                currentRenter: s.name,
                                currentRenterPhone: s.phone || s.parentPhone || '0900-000-000',
                                status: 'Rented'
                              }));
                            }
                          } else if (type === 'teacher') {
                            const t = teachers.find(item => item.id === id);
                            if (t) {
                              setRoomForm(prev => ({
                                ...prev,
                                currentRenter: t.name,
                                currentRenterPhone: t.phone || '0900-000-000',
                                status: 'Rented'
                              }));
                            }
                          }
                        }}
                      >
                        <option value="">-- 點擊此下拉選單可自動帶入現有學員與老師 --</option>
                        <optgroup label="🧸 寶貝學生名冊">
                          {students.map(s => (
                            <option key={s.id} value={`student:${s.id}`}>學員: {s.name} ({s.phone || '無個人手機'})</option>
                          ))}
                        </optgroup>
                        <optgroup label="🦒 師資名冊">
                          {teachers.map(t => (
                            <option key={t.id} value={`teacher:${t.id}`}>教師: {t.name} ({t.phone || '無手機'})</option>
                          ))}
                        </optgroup>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold mb-1">👤 租借人姓名 (無人租用免填)</label>
                        <input
                          type="text"
                          placeholder="可自訂輸入或點上方帶入"
                          className="w-full sketchy-input text-sm"
                          value={roomForm.currentRenter || ''}
                          onChange={(e) => setRoomForm(prev => {
                            const val = e.target.value;
                            return {
                              ...prev,
                              currentRenter: val,
                              status: val ? 'Rented' : prev.status
                            };
                          })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">📞 租借人電話號碼 (無人租用免填)</label>
                        <input
                          type="text"
                          placeholder="例如：0900-123-456"
                          className="w-full sketchy-input text-sm"
                          value={roomForm.currentRenterPhone || ''}
                          onChange={(e) => setRoomForm(prev => ({ ...prev, currentRenterPhone: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1">🕒 預設租借時段</label>
                      <input
                        type="text"
                        required
                        placeholder="例如：13:00 - 14:00"
                        className="w-full sketchy-input text-sm"
                        value={roomForm.timeSlot || ''}
                        onChange={(e) => setRoomForm(prev => ({ ...prev, timeSlot: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">💰 預設租借租金 (元)</label>
                      <input
                        type="number"
                        required
                        placeholder="例如：300"
                        className="w-full sketchy-input text-sm"
                        value={roomForm.currentPrice || ''}
                        onChange={(e) => setRoomForm(prev => ({ ...prev, currentPrice: Number(e.target.value) }))}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* LESSON SCHEDULE FORM */}
              {activeSubTab === 'lessons' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1">🧸 選擇上課學員</label>
                      <select
                        required
                        className="w-full sketchy-input text-sm"
                        value={lessonForm.studentId || ''}
                        onChange={(e) => setLessonForm(prev => ({ ...prev, studentId: e.target.value }))}
                      >
                        <option value="" disabled>--- 請選擇學員 ---</option>
                        {students.map(s => (
                          <option key={s.id} value={s.id}>{s.name} {s.avatar}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">🦒 授課指導老師</label>
                      <select
                        required
                        className="w-full sketchy-input text-sm"
                        value={lessonForm.teacherId || ''}
                        onChange={(e) => {
                          const matchingTeach = teachers.find(t => t.id === e.target.value);
                          setLessonForm(prev => ({ 
                            ...prev, 
                            teacherId: e.target.value,
                            instrument: matchingTeach?.instrument?.split(' ')[0] || prev.instrument 
                          }));
                        }}
                      >
                        <option value="" disabled>--- 請選擇老師 ---</option>
                        {teachers.map(t => (
                          <option key={t.id} value={t.id}>{t.name} {t.avatar}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1">🎻 上課樂科學科</label>
                      <input
                        type="text"
                        required
                        className="w-full sketchy-input text-sm"
                        value={lessonForm.instrument || ''}
                        onChange={(e) => setLessonForm(prev => ({ ...prev, instrument: e.target.value }))}
                        placeholder="例如：鋼琴、小提琴、古典吉他"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">🚪 使用/分配琴房</label>
                      <select
                        required
                        className="w-full sketchy-input text-sm"
                        value={lessonForm.roomName || ''}
                        onChange={(e) => setLessonForm(prev => ({ ...prev, roomName: e.target.value }))}
                      >
                        {rooms.map(r => (
                          <option key={r.id} value={r.name}>{r.name} {r.emoji}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1">📅 上課日期</label>
                      <input
                        type="date"
                        required
                        className="w-full sketchy-input text-sm"
                        value={lessonForm.date || ''}
                        onChange={(e) => setLessonForm(prev => ({ ...prev, date: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">⏰ 上課時段 (可自訂輸入)</label>
                      <input
                        type="text"
                        required
                        placeholder="請輸入或選擇上課時間"
                        list="lesson-time-slots"
                        className="w-full sketchy-input text-sm"
                        value={lessonForm.timeSlot || ''}
                        onChange={(e) => setLessonForm(prev => ({ ...prev, timeSlot: e.target.value }))}
                      />
                      <datalist id="lesson-time-slots">
                        <option value="09:00 - 10:00" />
                        <option value="10:00 - 11:00" />
                        <option value="11:00 - 12:00" />
                        <option value="12:00 - 13:00" />
                        <option value="13:00 - 14:00" />
                        <option value="14:00 - 15:00" />
                        <option value="15:00 - 16:00" />
                        <option value="16:00 - 17:00" />
                        <option value="17:00 - 18:00" />
                        <option value="18:00 - 19:00" />
                        <option value="19:00 - 20:00" />
                      </datalist>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1">💰 預估課程學費 (元)</label>
                      <input
                        type="number"
                        required
                        className="w-full sketchy-input text-sm"
                        value={lessonForm.price || ''}
                        onChange={(e) => setLessonForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                        placeholder="例如：1200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">💰 收費到帳旗標</label>
                      <select
                        className="w-full sketchy-input text-sm"
                        value={lessonForm.feePaid ? 'true' : 'false'}
                        onChange={(e) => setLessonForm(prev => ({ ...prev, feePaid: e.target.value === 'true' }))}
                      >
                        <option value="false">❌ 尚未收算 (待櫃台處理)</option>
                        <option value="true">✅ 已經繳清學費</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* RECURRING LESSON FORM */}
              {activeSubTab === 'recurring-lessons' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1">🧸 選擇常規學員</label>
                      <select
                        required
                        className="w-full sketchy-input text-sm"
                        value={recurringLessonForm.studentId || ''}
                        onChange={(e) => setRecurringLessonForm(prev => ({ ...prev, studentId: e.target.value }))}
                      >
                        <option value="" disabled>--- 請選擇學員 ---</option>
                        {students.map(s => (
                          <option key={s.id} value={s.id}>{s.name} {s.avatar}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">🦒 固定授課老師</label>
                      <select
                        required
                        className="w-full sketchy-input text-sm"
                        value={recurringLessonForm.teacherId || ''}
                        onChange={(e) => {
                          const matchingTeach = teachers.find(t => t.id === e.target.value);
                          setRecurringLessonForm(prev => ({ 
                            ...prev, 
                            teacherId: e.target.value,
                            instrument: matchingTeach?.instrument?.split(' ')[0] || prev.instrument 
                          }));
                        }}
                      >
                        <option value="" disabled>--- 請選擇老師 ---</option>
                        {teachers.map(t => (
                          <option key={t.id} value={t.id}>{t.name} {t.avatar}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1">🎻 上課樂科學科</label>
                      <input
                        type="text"
                        required
                        className="w-full sketchy-input text-sm"
                        value={recurringLessonForm.instrument || ''}
                        onChange={(e) => setRecurringLessonForm(prev => ({ ...prev, instrument: e.target.value }))}
                        placeholder="例如：鋼琴、小提琴、古典吉他"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">🚪 固定使用琴房</label>
                      <select
                        required
                        className="w-full sketchy-input text-sm"
                        value={recurringLessonForm.roomName || ''}
                        onChange={(e) => setRecurringLessonForm(prev => ({ ...prev, roomName: e.target.value }))}
                      >
                        {rooms.map(r => (
                          <option key={r.id} value={r.name}>{r.name} {r.emoji}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1">🔄 每週上課星期</label>
                      <select
                        required
                        className="w-full sketchy-input text-sm"
                        value={recurringLessonForm.dayOfWeek ?? 1}
                        onChange={(e) => setRecurringLessonForm(prev => ({ ...prev, dayOfWeek: Number(e.target.value) }))}
                      >
                        <option value="1">每週一</option>
                        <option value="2">每週二</option>
                        <option value="3">每週三</option>
                        <option value="4">每週四</option>
                        <option value="5">每週五</option>
                        <option value="6">每週六</option>
                        <option value="0">每週日</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">⏰ 上課時段 (可自訂輸入)</label>
                      <input
                        type="text"
                        required
                        placeholder="請輸入或選擇上課時間"
                        list="lesson-time-slots"
                        className="w-full sketchy-input text-sm"
                        value={recurringLessonForm.timeSlot || ''}
                        onChange={(e) => setRecurringLessonForm(prev => ({ ...prev, timeSlot: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1">💰 每堂常規學費 (元)</label>
                      <input
                        type="number"
                        required
                        className="w-full sketchy-input text-sm"
                        value={recurringLessonForm.price || ''}
                        onChange={(e) => setRecurringLessonForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                        placeholder="例如：1200"
                      />
                    </div>
                  </div>
                </>
              )}

            </div>

            {/* Bottom Actions */}
            <div className="mt-6 pt-4 border-t-2 border-brand-brown flex justify-end gap-3 text-sm">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="sketchy-button bg-white hover:bg-slate-50 text-brand-brown px-4 py-2"
              >
                取消
              </button>
              <button
                type="submit"
                className="sketchy-button bg-brand-yellow hover:bg-amber-200 text-brand-brown px-5 py-2 font-black flex items-center gap-1"
              >
                <Check className="w-4 h-4" />
                <span>儲存並發布</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Custom styled Simulation modal dialog */}
      {simulationModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="w-full max-w-sm bg-brand-cream border-4 border-brand-brown rounded-[24px] shadow-[8px_8px_0px_#4A3728] p-5 relative overflow-hidden animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setSimulationModal(prev => ({ ...prev, isOpen: false }))}
              className="absolute top-3 right-3 p-1 rounded-full border border-brand-brown/40 bg-white hover:bg-slate-50 text-brand-brown/70 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h4 className="font-extrabold text-md mb-2 text-brand-brown flex items-center gap-1.5 border-b border-brand-brown/30 pb-2.5">
              <span>🚀 模擬線上簽到連結點擊</span>
            </h4>

            <form onSubmit={handleSimulateCheckInSubmit} className="space-y-4 pt-1">
              <div className="flex items-center gap-3 bg-white p-3 border-2 border-brand-brown rounded-xl">
                <span className="text-3xl p-1 bg-brand-cream border border-brand-brown rounded-full w-12 h-12 flex items-center justify-center shadow-[1px_1px_0px_#4A3728]">
                  {simulationModal.avatar}
                </span>
                <div>
                  <h5 className="font-black text-sm text-brand-brown">
                    模擬對象：{simulationModal.targetName}
                  </h5>
                  <p className="text-[10px] text-brand-brown/70 font-semibold">
                    身分角色：{simulationModal.type === 'student' ? '🧸 艾麗絲音樂班學員' : '🦒 哆咪授課教師'}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-brand-brown/90">
                  {simulationModal.type === 'student' ? '📝 本日心情備忘 / 家長留言 (選填)' : '💬 打卡備註 / 教室整備說明 (選填)'}
                </label>
                <textarea
                  value={simulationNote}
                  onChange={(e) => setSimulationNote(e.target.value)}
                  placeholder={simulationModal.type === 'student' ? '例如：已經上樓上課、小提琴弦有調好呀...' : '例如：提早到教室整理琴譜完畢...'}
                  className="w-full sketchy-input text-xs h-16 resize-none p-2"
                  maxLength={60}
                />
              </div>

              <div className="flex justify-end gap-2 text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setSimulationModal(prev => ({ ...prev, isOpen: false }))}
                  className="sketchy-button bg-white hover:bg-slate-50 text-brand-brown px-3 py-1.5"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="sketchy-button bg-brand-green hover:bg-emerald-200 text-brand-brown px-4 py-1.5 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>送出線上簽到</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom styled confirm dialog */}
      {customConfirm.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="w-full max-w-sm bg-brand-cream border-4 border-brand-brown rounded-[24px] shadow-[8px_8px_0px_#4A3728] p-5 relative overflow-hidden animate-in zoom-in-95 duration-150">
            <h4 className="font-black text-lg mb-2 text-brand-brown flex items-center gap-2">
              {customConfirm.title}
            </h4>
            <p className="text-xs font-semibold text-brand-brown/85 leading-relaxed mb-4">
              {customConfirm.message}
            </p>
            <div className="flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setCustomConfirm(prev => ({ ...prev, isOpen: false }))}
                className="sketchy-button bg-white hover:bg-slate-50 text-brand-brown px-3 py-1.5"
              >
                取消
              </button>
              <button
                type="button"
                onClick={customConfirm.onConfirm}
                className="sketchy-button bg-red-100 hover:bg-red-200 text-red-700 px-4 py-1.5 font-bold"
              >
                確認
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom styled alert dialog */}
      {customAlert.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="w-full max-w-sm bg-brand-cream border-4 border-brand-brown rounded-[24px] shadow-[8px_8px_0px_#4A3728] p-5 relative overflow-hidden animate-in zoom-in-95 duration-150">
            <h4 className="font-black text-lg mb-2 text-brand-brown flex items-center gap-2">
              {customAlert.title}
            </h4>
            <p className="text-xs font-semibold text-brand-brown/85 leading-relaxed mb-4">
              {customAlert.message}
            </p>
            <div className="flex justify-end text-xs">
              <button
                type="button"
                onClick={() => setCustomAlert(prev => ({ ...prev, isOpen: false }))}
                className="sketchy-button bg-brand-yellow hover:bg-amber-200 text-brand-brown px-4 py-1.5 font-bold"
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
