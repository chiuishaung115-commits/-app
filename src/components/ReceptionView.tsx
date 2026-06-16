import React, { useState } from 'react';
import { Student, Teacher, Room, Lesson, Attendance, RoomRental } from '../types';
import { 
  Users, CheckCircle, Clock, Check, X, ShieldAlert,
  HelpCircle, Sparkles, Award, Wallet, Coins, Plus, Trash2, Calendar, DoorOpen,
  Phone, Search, Edit3
} from 'lucide-react';

interface ReceptionViewProps {
  students: Student[];
  teachers: Teacher[];
  rooms: Room[];
  lessons: Lesson[];
  roomRentals: RoomRental[];
  setLessons: React.Dispatch<React.SetStateAction<Lesson[]>>;
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
  setRoomRentals: React.Dispatch<React.SetStateAction<RoomRental[]>>;
  onEmitNotification: (message: string, type: 'StudentCheckIn' | 'TeacherCheckIn' | 'TuitionAlert', senderName: string) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
}

export default function ReceptionView({
  students,
  teachers,
  rooms,
  lessons,
  roomRentals,
  setLessons,
  setRooms,
  setRoomRentals,
  onEmitNotification,
  selectedDate,
  setSelectedDate
}: ReceptionViewProps) {
  
  // Room Rental Dialog Form State
  const [isRentModalOpen, setIsRentModalOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [editingRentalId, setEditingRentalId] = useState<string | null>(null);

  // Custom confirmation modal state to avoid iframe window.confirm blockages
  const [customConfirm, setCustomConfirm] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: 'delete' | 'release';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'delete'
  });

  // Phonebook Search & Copy feedback States
  const [phonebookSearch, setPhonebookSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const [rentalForm, setRentalForm] = useState({
    renterName: '',
    renterPhone: '',
    timeSlot: '14:00 - 15:00',
    price: 300,
    paid: false
  });

  // Filter lessons for selected date
  const selectedDateLessons = lessons.filter(l => l.date === selectedDate);
  // Filter rentals for selected date
  const selectedDateRentals = roomRentals.filter(r => r.date === selectedDate);

  // Quick attendance click
  const handleSetAttendance = (lessonId: string, status: Attendance) => {
    const originalLesson = lessons.find(l => l.id === lessonId);
    if (!originalLesson) return;

    setLessons(prev => prev.map(l => {
      if (l.id === lessonId) {
        let checkTime = l.checkInTime;
        if (status === Attendance.CheckedIn && !checkTime) {
          const now = new Date();
          checkTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        } else if (status !== Attendance.CheckedIn) {
          checkTime = undefined;
        }

        // Notify if state changed
        if (l.attendance !== status) {
          let msg = '';
          if (status === Attendance.CheckedIn) msg = `🔔 【手動到班】學員「${l.studentName}」已抵達教室並由櫃台簽到。`;
          if (status === Attendance.Absent) msg = `⚠️ 【學員缺席】學員「${l.studentName}」本日未到。`;
          if (status === Attendance.Excused) msg = `📝 【事假請假】學員「${l.studentName}」已辦理請假。`;
          if (msg) onEmitNotification(msg, 'StudentCheckIn', l.studentName);
        }

        return { ...l, attendance: status, checkInTime: checkTime };
      }
      return l;
    }));
  };

  // Mark lesson tuition as Paid
  const handlePayLesson = (lessonId: string) => {
    setLessons(prev => prev.map(l => {
      if (l.id === lessonId) {
        const cost = l.price;
        onEmitNotification(`💰 【學雜收款】櫃台已收到學員「${l.studentName}」上課學費 $${cost} 元！`, 'TuitionAlert', l.studentName);
        return { ...l, feePaid: true };
      }
      return l;
    }));
  };

  // Mark room rentals as Paid
  const handlePayRental = (rentalId: string) => {
    setRoomRentals(prev => prev.map(r => {
      if (r.id === rentalId) {
        onEmitNotification(`💰 【租地收款】櫃台已收到「${r.renterName}」租借琴房費 $${r.price} 元。`, 'TuitionAlert', r.renterName);
        return { ...r, paid: true };
      }
      return r;
    }));
  };

  // Open Rent Dialog
  const handleOpenRent = (roomId: string) => {
    const targetRoom = rooms.find(r => r.id === roomId);
    if (targetRoom?.status === 'Maintenance') {
      alert('這間琴房正在進行定期保養調音中，暫不提供外租喔！');
      return;
    }
    setSelectedRoomId(roomId);
    setEditingRentalId(null);
    setRentalForm({
      renterName: '',
      renterPhone: '',
      timeSlot: targetRoom?.timeSlot || '14:00 - 15:00',
      price: targetRoom?.currentPrice !== undefined ? targetRoom.currentPrice : 300,
      paid: false
    });
    setIsRentModalOpen(true);
  };

  // Open Edit Rental Dialog
  const handleOpenEditRental = (rental: RoomRental) => {
    setSelectedRoomId(rental.roomId);
    setEditingRentalId(rental.id);
    setRentalForm({
      renterName: rental.renterName,
      renterPhone: rental.renterPhone || '',
      timeSlot: rental.timeSlot || '',
      price: rental.price || 300,
      paid: rental.paid
    });
    setIsRentModalOpen(true);
  };

  // Submit Rent Rental
  const handleSubmitRental = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomId) return;

    const room = rooms.find(r => r.id === selectedRoomId);
    if (!room) return;

    if (!rentalForm.renterName) {
      alert('請填寫租借人名字！');
      return;
    }

    if (editingRentalId) {
      // Find old room to see if we changed rooms during edit
      const oldRental = roomRentals.find(r => r.id === editingRentalId);
      const oldRoomId = oldRental?.roomId;

      // Update existing rental log
      setRoomRentals(prev => prev.map(r => r.id === editingRentalId ? {
        ...r,
        roomId: selectedRoomId,
        roomName: room.name,
        renterName: rentalForm.renterName,
        renterPhone: rentalForm.renterPhone || '0900-000-000',
        timeSlot: rentalForm.timeSlot,
        price: Number(rentalForm.price) || 300,
        paid: rentalForm.paid
      } : r));

      // Update corresponding room statuses
      setRooms(prev => prev.map(r => {
        // Clear previous room if renting was moved to another room
        if (oldRoomId && oldRoomId !== selectedRoomId && r.id === oldRoomId) {
          return {
            ...r,
            status: 'Available',
            currentRenter: undefined,
            currentRenterPhone: undefined,
            timeSlot: undefined,
            currentPrice: undefined
          };
        }
        // Set new room details
        if (r.id === selectedRoomId) {
          return {
            ...r,
            status: 'Rented',
            currentRenter: rentalForm.renterName,
            currentRenterPhone: rentalForm.renterPhone,
            timeSlot: rentalForm.timeSlot,
            currentPrice: Number(rentalForm.price) || 300
          };
        }
        return r;
      }));

      onEmitNotification(`📝 【修改租約】「${rentalForm.renterName}」的琴房租借資訊已成功更新！`, 'StudentCheckIn', rentalForm.renterName);
    } else {
      // Create a brand new rental
      const newRental: RoomRental = {
        id: 'rr_' + Date.now(),
        roomId: selectedRoomId,
        roomName: room.name,
        renterName: rentalForm.renterName,
        renterPhone: rentalForm.renterPhone || '0900-000-000',
        timeSlot: rentalForm.timeSlot,
        price: Number(rentalForm.price) || 300,
        paid: rentalForm.paid,
        date: selectedDate
      };

      setRoomRentals(prev => [...prev, newRental]);
      
      // Set room status to Rented
      setRooms(prev => prev.map(r => r.id === selectedRoomId ? {
        ...r,
        status: 'Rented',
        currentRenter: rentalForm.renterName,
        currentRenterPhone: rentalForm.renterPhone,
        timeSlot: rentalForm.timeSlot,
        currentPrice: Number(rentalForm.price) || 300
      } : r));

      onEmitNotification(`🔑 【琴房出租】「${rentalForm.renterName}」成功預約了租用本日「${room.name}」(${rentalForm.timeSlot})。`, 'StudentCheckIn', rentalForm.renterName);
    }

    setIsRentModalOpen(false);
  };

  // Release/Free Room
  const handleReleaseRoom = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;

    setCustomConfirm({
      isOpen: true,
      title: '🌿 確定要釋放琴房嗎？',
      message: `您即將清理並將「${room.name}」復歸為【閒置】狀態。這會移除該琴房當前登記的租借人關聯。確定要繼續嗎？`,
      type: 'release',
      onConfirm: () => {
        setRooms(prev => prev.map(r => r.id === roomId ? {
          ...r,
          status: 'Available',
          currentRenter: undefined,
          currentRenterPhone: undefined,
          timeSlot: undefined,
          currentPrice: undefined
        } : r));
        onEmitNotification(`🌿 【琴房釋放】「${room.name}」使用完畢，已清理完成狀態更新為：閒置可供使用。`, 'StudentCheckIn', '系統');
        setCustomConfirm(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Toggle Maintenance
  const handleToggleMaintenance = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;

    const newStatus = room.status === 'Maintenance' ? 'Available' : 'Maintenance';
    setRooms(prev => prev.map(r => r.id === roomId ? {
      ...r,
      status: newStatus,
      currentRenter: undefined,
      currentRenterPhone: undefined,
      timeSlot: undefined,
      currentPrice: undefined
    } : r));

    if (newStatus === 'Maintenance') {
      onEmitNotification(`🛠️ 【琴房維護】「${room.name}」進行調音預防保養，暫停外租。`, 'TuitionAlert', '調音工程師');
    } else {
      onEmitNotification(`✨ 【維護完畢】「${room.name}」保養調音完成，恢復開放琴房。`, 'StudentCheckIn', '系統');
    }
  };

  // Delete rental log
  const handleDeleteRentalLog = (id: string, roomId: string) => {
    const rental = roomRentals.find(r => r.id === id);
    if (!rental) return;

    setCustomConfirm({
      isOpen: true,
      title: '🗑️ 確定要永久刪除此琴房租借紀錄嗎？',
      message: `您即將從系統中永久刪除「${rental.renterName}」租借「${rental.roomName}」的紀錄！如果此琴房目前在租借狀態，也會自動釋放。此項操作是不可逆的，確定要繼續嗎？`,
      type: 'delete',
      onConfirm: () => {
        setRoomRentals(prev => prev.filter(r => r.id !== id));
        // Optionally release room if it matches current renter
        setRooms(prev => prev.map(r => r.id === roomId ? {
          ...r,
          status: 'Available',
          currentRenter: undefined,
          currentRenterPhone: undefined,
          timeSlot: undefined,
          currentPrice: undefined
        } : r));
        onEmitNotification(`🗑️ 【琴房退租】「${rental.renterName}」租借「${rental.roomName}」的紀錄已由櫃台刪除。`, 'StudentCheckIn', '系統');
        setCustomConfirm(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Calculates Tuition / Financial stats
  // Only include rental fees on reception board (student tuitions are managed in admin view)
  const totalPaid = selectedDateRentals.filter(r => r.paid).reduce((sum, r) => sum + r.price, 0);
  const totalUnpaid = selectedDateRentals.filter(r => !r.paid).reduce((sum, r) => sum + r.price, 0);

  const grandTotal = totalPaid + totalUnpaid;
  const paidPercent = grandTotal > 0 ? Math.round((totalPaid / grandTotal) * 100) : 0;

  // Filter students for the phone book contact list
  const filteredPhonebook = students.filter(s => {
    const term = phonebookSearch.trim().toLowerCase();
    if (!term) return true;
    return (
      s.name.toLowerCase().includes(term) ||
      (s.phone && s.phone.includes(term)) ||
      (s.parentName && s.parentName.toLowerCase().includes(term)) ||
      (s.parentPhone && s.parentPhone.includes(term))
    );
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pb-12 text-brand-brown">
      
      {/* Date header select & stats indicators */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 bg-white px-4 py-2 border-2 border-brand-brown rounded-2xl shadow-[2px_2px_0px_#4A3728]">
          <Calendar className="w-5 h-5 text-amber-500 animate-pulse" />
          <span className="font-extrabold text-sm md:text-md mr-1">本日值班看板: </span>
          <input
            id="reception-date-picker"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border-b border-dashed border-brand-brown font-extrabold text-amber-900 bg-transparent focus:outline-none focus:border-solid text-sm"
          />
        </div>
        
        {/* Short motivational badge */}
        <div className="hidden lg:flex items-center gap-1 bg-[#D2EBD9] border border-emerald-600 px-3 py-1 rounded-full text-xs font-bold text-emerald-950/80">
          <Award className="w-4 h-4 text-emerald-600" />
          <span>今日校務順暢中！記得親切跟小小鋼琴家打招呼喔 🎵</span>
        </div>
      </div>

      {/* Main Bento Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Attendance Dashboard (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="sketchy-card bg-white p-5">
            <div className="flex justify-between items-center border-b-2 border-brand-brown pb-3 mb-4">
              <h3 className="font-black text-xl flex items-center gap-2">
                <span>🧸 學生課堂出勤 (一目了然)</span>
              </h3>
              <span className="text-xs bg-brand-pink/30 border border-brand-pink text-brand-brown font-black px-2.5 py-0.5 rounded-full">
                排課共 {selectedDateLessons.length} 人次
              </span>
            </div>

            {selectedDateLessons.length === 0 ? (
              <div className="text-center py-12 text-brand-brown/50 bg-brand-cream/35 border-2 border-dashed border-brand-brown/40 rounded-xl">
                <span className="text-4xl block mb-2">🏖️</span>
                <p className="font-bold">今日尚無排課課程規劃</p>
                <p className="text-xs text-brand-brown/40 mt-1">您可以前往管理者後台新增一筆排課！</p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedDateLessons.map((les) => {
                  const studentObj = students.find(s => s.id === les.studentId);
                  
                  return (
                    <div
                      id={`attendance-row-${les.id}`}
                      key={les.id}
                      className="border-2 border-brand-brown rounded-xl p-3.5 bg-brand-cream/15 shadow-[2px_2px_0px_#4A3728] flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-sm hover:bg-amber-50/20 transition-all"
                    >
                      {/* Stud Basic info */}
                      <div className="flex items-center gap-3">
                        <span className="text-3xl bg-white border border-brand-brown rounded-full w-11 h-11 flex items-center justify-center shadow-[1px_1px_0px_#4A3728]">
                          {studentObj?.avatar || '🧸'}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-black text-base">{les.studentName}</span>
                            <span className="text-[10px] border border-brand-brown px-1.5 py-0.1 rounded-md bg-brand-yellow font-bold shrink-0">
                              {les.instrument}
                            </span>
                          </div>
                          
                          <div className="text-xs text-brand-brown/70 font-semibold space-y-0.5 mt-0.5">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-brand-brown/65" />
                              <span>{les.timeSlot} 課堂</span>
                            </div>
                            <span className="text-[10px] font-medium text-brand-brown/70 block">
                              指導: <strong>{les.teacherName}</strong> | 琴房: {les.roomName}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Outbound Quick action switcher */}
                      <div className="flex flex-col items-end gap-1.5 w-full md:w-auto mt-2 md:mt-0 border-t md:border-t-0 border-brand-brown/10 pt-2 md:pt-0">
                        {/* Attendance State Pills */}
                        <div className="flex gap-1 bg-[#ECE3D0] p-0.5 rounded-lg border border-brand-brown text-[11px] font-bold">
                          {[
                            { key: Attendance.Unchecked, label: '未到', color: 'bg-white font-normal hover:bg-white/80' },
                            { key: Attendance.CheckedIn, label: '已到班', color: 'bg-brand-green border-emerald-700 font-extrabold' },
                            { key: Attendance.Absent, label: '缺席', color: 'bg-brand-pink border-red-700 font-extrabold' },
                            { key: Attendance.Excused, label: '請假', color: 'bg-amber-200 border-amber-600 font-extrabold' }
                          ].map((pill) => {
                            const isSelected = les.attendance === pill.key;
                            return (
                              <button
                                key={pill.key}
                                onClick={() => handleSetAttendance(les.id, pill.key)}
                                className={`px-2 py-1 rounded cursor-pointer transition-all ${
                                  isSelected 
                                    ? `${pill.color} text-brand-brown border shadow-[1px_1px_0px_#4A3728]` 
                                    : 'text-brand-brown/60 hover:text-brand-brown bg-transparent'
                                }`}
                              >
                                {pill.label}
                              </button>
                            );
                          })}
                        </div>
                        
                        {/* Attendance extra metadata timestamp */}
                        {les.attendance === Attendance.CheckedIn && (
                          <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 rounded px-1.5 py-0.2 border border-emerald-300">
                             ✔ 完成到班登錄 ({les.checkInTime || '手動'})
                          </span>
                        )}
                        {les.attendance === Attendance.Absent && (
                          <span className="text-[10px] font-bold text-red-800 bg-red-55 rounded px-1.5 py-0.2">
                             ❌ 學員無故缺席
                          </span>
                        )}
                        {les.attendance === Attendance.Excused && (
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-50 rounded px-1.5 py-0.2">
                             ✏ 課前辦理請假完成
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>


        </div>

        {/* RIGHT COLUMN: Room states & Tuitions stats (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Bento Segment 2: Financial Stats (琴房租借收費一目了然) */}
          <div className="sketchy-card bg-brand-cream p-5 relative overflow-hidden shadow-[6px_6px_0px_#4A3728]">
            {/* background circle decor */}
            <div className="absolute -bottom-10 -right-10 w-28 h-28 bg-brand-yellow/25 rounded-full animate-pulse" />
            
            <div className="flex justify-between items-center border-b-2 border-brand-brown pb-3 mb-4">
              <h3 className="font-black text-xl flex items-center gap-2">
                <Wallet className="w-5 h-5 text-amber-600" />
                <span>💰 本日琴房租借收款統計</span>
              </h3>
            </div>

            {/* Micro progress graph */}
            <div className="space-y-3 mb-4 relative z-10">
              <div className="flex justify-between items-end">
                <span className="text-xs text-brand-brown font-extrabold">琴房收款達成率</span>
                <span className="text-base text-brand-brown font-black">{paidPercent}%</span>
              </div>
              <div className="w-full h-4 bg-stone-200 border-2 border-brand-brown rounded-full overflow-hidden">
                <div 
                  className="h-full bg-brand-green transition-all duration-500" 
                  style={{ width: `${paidPercent}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4 relative z-10">
              <div className="bg-white border-2 border-brand-brown p-3 rounded-xl shadow-[2px_2px_0px_#4A3728]">
                <span className="text-[10px] text-brand-brown/70 block font-bold">🟢 已收總額 (到帳)</span>
                <span className="text-lg text-emerald-700 font-extrabold block mt-0.5">
                  $ {totalPaid} 元
                </span>
                <span className="text-[9px] text-brand-brown/60 block leading-tight font-medium">
                  今日琴房租用之已付款金額
                </span>
              </div>
              <div className="bg-white border-2 border-brand-brown p-3 rounded-xl shadow-[2px_2px_0px_#4A3728]">
                <span className="text-[10px] text-brand-brown/70 block font-bold">💸 待收總額 (推催中)</span>
                <span className="text-lg text-rose-600 font-extrabold block mt-0.5 animate-pulse">
                  $ {totalUnpaid} 元
                </span>
                <span className="text-[9px] text-brand-brown/60 block leading-tight font-medium">
                  今日琴房租客現場待對帳額
                </span>
              </div>
            </div>

            {/* Today's Rental Lists & Actions */}
            <div>
              <h4 className="text-xs font-black text-brand-brown mb-2">📌 本日琴房租借清單 ({selectedDateRentals.length} 筆)</h4>
              <div className="max-h-[180px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {selectedDateRentals.map(r => (
                  <div key={r.id} className="flex flex-col gap-1 text-xs bg-white border border-brand-brown p-2 rounded-lg shadow-[1px_1px_0px_#4A3728]">
                    <div className="flex justify-between items-start">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-extrabold text-brand-brown">👤 {r.renterName}</span>
                          <span className="text-[9px] text-brand-brown/70 font-semibold bg-brand-cream/60 border border-brand-brown/20 px-1 rounded">
                            {r.roomName}
                          </span>
                        </div>
                        <div className="text-[10px] text-brand-brown/50 font-semibold mt-0.5">
                          🕒 時段: {r.timeSlot || '未設定'}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 shrink-0">
                        <span className={`text-[9px] font-black px-1.5 py-0.2 rounded border ${
                          r.paid 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                            : 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                        }`}>
                          {r.paid ? '已付' : '待收'}
                        </span>
                        <span className="font-extrabold text-[#4A3728] ml-1">${r.price}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center border-t border-dashed border-brand-brown/20 pt-1.5 mt-1.5">
                      {/* Left: Quick actions */}
                      <div className="flex gap-1.5">
                        {!r.paid && (
                          <button
                            onClick={() => handlePayRental(r.id)}
                            className="text-[9px] font-extrabold px-2 py-0.5 bg-brand-yellow hover:bg-amber-250 border border-brand-brown rounded transition-all cursor-pointer"
                          >
                            對帳收款
                          </button>
                        )}
                      </div>

                      {/* Right: Edit & Delete buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditRental(r)}
                          className="p-1 border border-brand-brown bg-indigo-50 hover:bg-indigo-100 rounded text-indigo-900 transition-all cursor-pointer"
                          title="編輯租借紀錄"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRentalLog(r.id, r.roomId)}
                          className="p-1 border border-brand-brown bg-rose-50 hover:bg-rose-100 rounded text-rose-700 transition-all cursor-pointer"
                          title="刪除租借紀錄"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {selectedDateRentals.length === 0 && (
                  <div className="text-center py-6 border-2 border-dashed border-brand-brown/20 bg-brand-cream/10 rounded-2xl">
                    <p className="text-xs font-black text-brand-brown/50">本日尚未登記任何琴房租用喔！</p>
                    <p className="text-[10px] text-brand-brown/45 mt-1">您可以點按下方琴房卡片上的「登記外租」啟動。</p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Bento Segment 3: Rooms Rental Tracker (琴房租借一目了然) */}
          <div className="sketchy-card bg-white p-5">
            <div className="flex justify-between items-center border-b-2 border-brand-brown pb-3 mb-4">
              <h3 className="font-black text-xl flex items-center gap-2">
                <DoorOpen className="w-5 h-5 text-teal-600" />
                <span>🎹 現場琴房即時租用</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {rooms.map((room) => {
                const targetRental = roomRentals.find(r => r.roomId === room.id && r.date === selectedDate);
                const isRentedOnDate = !!targetRental;

                const effectiveStatus = room.status === 'Maintenance' 
                  ? 'Maintenance' 
                  : (isRentedOnDate ? 'Rented' : 'Available');

                const renterName = targetRental ? targetRental.renterName : undefined;
                const renterPhone = targetRental ? targetRental.renterPhone : undefined;
                const timeSlot = targetRental ? targetRental.timeSlot : (room.timeSlot || '13:00 - 14:00');
                const price = targetRental ? targetRental.price : (room.currentPrice ?? 300);

                let statusColor = 'bg-brand-green/20 border-emerald-600';
                let statusText = '🟢 閒置中可約';
                
                if (effectiveStatus === 'Rented') {
                  statusColor = 'bg-brand-pink/20 border-rose-500';
                  statusText = '🔴 使用租借中';
                } else if (effectiveStatus === 'Maintenance') {
                  statusColor = 'bg-amber-100 border-amber-600';
                  statusText = '🛠️ 調音保養中';
                }

                return (
                  <div id={`reception-room-${room.id}`} key={room.id} className={`border-2 border-brand-brown rounded-xl p-3 flex flex-col justify-between ${statusColor}`}>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-2xl">{room.emoji}</span>
                        <strong className="text-brand-brown text-xs block truncate leading-tight">{room.name}</strong>
                      </div>
                      <div className="text-[10px] text-brand-brown/80 font-bold mt-1 max-h-[30px] overflow-hidden truncate">
                        備配: {room.equipment}
                      </div>

                      <div className="mt-2 text-[10px] font-black">{statusText}</div>

                      {effectiveStatus === 'Rented' && (
                        <div className="mt-2 bg-white/70 border border-brand-brown p-1.5 rounded text-[9px] font-bold space-y-0.5">
                          <p>👤 登記人: <span className="text-[#4A3728] font-extrabold">{renterName}</span></p>
                          <p>🕒 租借時段: <span className="text-indigo-800 font-extrabold">{timeSlot || '未填'}</span></p>
                          <p>💰 租金金額: <span className="text-rose-600 font-extrabold">$ {price ?? 300} 元</span></p>
                        </div>
                      )}
                    </div>

                    {/* Room actions */}
                    <div className="flex flex-col gap-1.5 mt-3 pt-2.5 border-t border-brand-brown/10">
                      {effectiveStatus === 'Available' && (
                        <button
                          onClick={() => handleOpenRent(room.id)}
                          className="w-full text-[10px] font-black py-1 px-2 border-2 border-brand-brown bg-brand-yellow hover:bg-amber-200 rounded-lg text-center cursor-pointer"
                        >
                          🔑 登記外租
                        </button>
                      )}
                      
                      {effectiveStatus === 'Rented' && (
                        <button
                          onClick={() => handleReleaseRoom(room.id)}
                          className="w-full text-[10px] font-black py-1 px-2 border-2 border-brand-brown bg-emerald-100 hover:bg-emerald-250 rounded-lg text-center cursor-pointer"
                        >
                          🌿 釋放歸還房
                        </button>
                      )}

                      <button
                        onClick={() => handleToggleMaintenance(room.id)}
                        className="w-full text-[9px] font-black py-0.5 text-brand-brown bg-transparent text-center underline hover:text-orange-950 cursor-pointer"
                      >
                        {effectiveStatus === 'Maintenance' ? '結束定期保養' : '進入儀器調音'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bento Segment 4: Student & Parent Phonebook (學生電話簿) */}
          <div className="sketchy-card bg-[#F5F9FC] p-5 shadow-[4px_4px_0px_#4A3728]">
            <div className="flex justify-between items-center border-b-2 border-brand-brown pb-3 mb-4">
              <h3 className="font-black text-lg flex items-center gap-2">
                <Phone className="w-5 h-5 text-[#5465FF]" />
                <span>📞 學生與家長聯絡名冊</span>
              </h3>
              <span className="text-[10px] bg-brand-blue/20 border border-brand-blue text-[#1E3A8A] font-black px-2 py-0.5 rounded-full">
                共 {students.length} 位
              </span>
            </div>

            {/* Search input inside Phonebook */}
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-brand-brown/50 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="phonebook-search-input"
                type="text"
                placeholder="搜尋姓名/電話..."
                value={phonebookSearch}
                onChange={(e) => setPhonebookSearch(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 border-2 border-brand-brown rounded-xl bg-white focus:outline-none focus:bg-white transition-all font-semibold"
              />
            </div>

            {/* Contacts list */}
            <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {filteredPhonebook.length === 0 ? (
                <div className="text-center py-6 text-brand-brown/50 text-xs font-semibold">
                  🔍 找不到符合條件的聯絡人
                </div>
              ) : (
                filteredPhonebook.map((student) => (
                  <div 
                    id={`phone-item-${student.id}`}
                    key={student.id} 
                    className="p-2.5 rounded-xl border border-brand-brown bg-white hover:bg-emerald-50/10 transition-all duration-150 flex items-center justify-between shadow-[1px_1px_0px_#4A3728]"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-2xl bg-white border border-brand-brown rounded-full w-8 h-8 flex items-center justify-center shrink-0">
                        {student.avatar || '🧸'}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-extrabold text-xs text-brand-brown truncate">{student.name}</span>
                          <span className={`text-[9px] px-1 rounded font-bold border shrink-0 ${student.active ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-stone-100 text-stone-500 border-stone-300'}`}>
                            {student.active ? '學員' : '停課'}
                          </span>
                        </div>
                        {student.parentName && (
                          <p className="text-[10px] text-brand-brown/60 font-semibold truncate">
                            家長: {student.parentName}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end gap-1 shrink-0 font-mono text-[10px]">
                      {/* Student phone */}
                      {student.phone && (
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-slate-700">{student.phone}</span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(student.phone);
                              setCopiedId(student.id + '-std');
                              setTimeout(() => setCopiedId(null), 1500);
                            }}
                            className={`text-[9px] font-bold px-1 py-0.2 rounded border transition-colors cursor-pointer ${
                              copiedId === student.id + '-std'
                                ? 'bg-brand-green text-emerald-800 border-emerald-500' 
                                : 'bg-slate-50 text-slate-600 border-brand-brown/30 hover:bg-slate-150'
                            }`}
                          >
                            {copiedId === student.id + '-std' ? '已複製' : '學員'}
                          </button>
                        </div>
                      )}
                      
                      {/* Parent phone */}
                      {student.parentPhone && (
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-amber-800">{student.parentPhone}</span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(student.parentPhone!);
                              setCopiedId(student.id + '-parent');
                              setTimeout(() => setCopiedId(null), 1500);
                            }}
                            className={`text-[9px] font-bold px-1 py-0.2 rounded border transition-colors cursor-pointer ${
                              copiedId === student.id + '-parent'
                                ? 'bg-brand-green text-emerald-800 border-emerald-500' 
                                : 'bg-amber-50 text-amber-700 border-brand-brown/30 hover:bg-amber-100'
                            }`}
                          >
                            {copiedId === student.id + '-parent' ? '已複製' : '家長'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* RENT PIANO ROOM FORM MODAL */}
      {isRentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <form 
            onSubmit={handleSubmitRental}
            className="w-full max-w-sm bg-brand-cream border-4 border-brand-brown rounded-[24px] shadow-[8px_8px_0px_#4A3728] p-6 relative overflow-hidden animate-in zoom-in-95 duration-100"
          >
            {/* Header */}
            <div className="flex justify-between items-center border-b-2 border-brand-brown pb-3 mb-4">
              <h3 className="font-black text-md flex items-center gap-1">
                <span>🔑 {editingRentalId ? '編輯琴房租借紀錄' : '琴房租借登記卡'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsRentModalOpen(false)}
                className="p-1 hover:bg-slate-100 border border-brand-brown rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Inputs */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold mb-1">🎹 指定租用琴房</label>
                <select
                  required
                  className="w-full sketchy-input text-xs"
                  value={selectedRoomId || ''}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                >
                  {rooms.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.emoji} {r.name} {r.status === 'Maintenance' ? '(🛠️ 調音保養中)' : r.id === selectedRoomId ? '(目前所選)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">👤 租用人姓名 / 學員代表</label>
                <input
                  type="text"
                  required
                  placeholder="例如：猴子強強"
                  value={rentalForm.renterName}
                  onChange={(e) => setRentalForm(prev => ({ ...prev, renterName: e.target.value }))}
                  className="w-full sketchy-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">📞 聯絡人連絡電話</label>
                <input
                  type="text"
                  required
                  placeholder="例如：0911-333-222"
                  value={rentalForm.renterPhone}
                  onChange={(e) => setRentalForm(prev => ({ ...prev, renterPhone: e.target.value }))}
                  className="w-full sketchy-input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold mb-1">⏱ 租用時間/時段</label>
                  <input
                    type="text"
                    required
                    placeholder="請輸入或選擇時段"
                    list="rental-time-slots"
                    className="w-full sketchy-input text-xs"
                    value={rentalForm.timeSlot}
                    onChange={(e) => setRentalForm(prev => ({ ...prev, timeSlot: e.target.value }))}
                  />
                  <datalist id="rental-time-slots">
                    <option value="10:00 - 11:30" />
                    <option value="13:00 - 14:00" />
                    <option value="14:00 - 15:30" />
                    <option value="15:30 - 17:00" />
                    <option value="17:00 - 18:30" />
                    <option value="18:30 - 20:00" />
                  </datalist>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">💰 租借金額 (元)</label>
                  <input
                    type="number"
                    required
                    value={rentalForm.price}
                    onChange={(e) => setRentalForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                    className="w-full sketchy-input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">💰 收銀到帳</label>
                <select
                  className="w-full sketchy-input text-xs"
                  value={rentalForm.paid ? 'true' : 'false'}
                  onChange={(e) => setRentalForm(prev => ({ ...prev, paid: e.target.value === 'true' }))}
                >
                  <option value="false">❌ 尚未收算 (現場代繳卡)</option>
                  <option value="true">✅ 現場立即繳訖租金</option>
                </select>
              </div>
            </div>

            {/* Bottom buttons */}
            <div className="mt-5 border-t border-brand-brown/40 pt-3 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setIsRentModalOpen(false)}
                className="sketchy-button px-3 py-1.5 bg-white text-brand-brown"
              >
                取消
              </button>
              <button
                type="submit"
                className="sketchy-button px-4 py-1.5 bg-brand-yellow font-bold text-brand-brown"
              >
                {editingRentalId ? '儲存修改' : '確認登記'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {customConfirm.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-brand-cream border-4 border-brand-brown rounded-[24px] shadow-[6px_6px_0px_#4A3728] p-5 relative overflow-hidden animate-in zoom-in-95 duration-200">
            
            <button
              onClick={() => setCustomConfirm(prev => ({ ...prev, isOpen: false }))}
              className="absolute top-4 right-4 p-1 rounded-full border border-brand-brown/40 bg-white hover:bg-slate-50 text-brand-brown/70 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3 mt-1 text-brand-brown">
              <span className="text-3xl">
                {customConfirm.type === 'delete' ? '🗑️' : '🌿'}
              </span>
              <div className="space-y-1.5 flex-1 min-w-0">
                <h4 className="font-black text-[#4A3728] text-base leading-snug">
                  {customConfirm.title}
                </h4>
                <p className="text-xs text-brand-brown/80 font-bold leading-relaxed pr-2">
                  {customConfirm.message}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs pt-4 border-t border-brand-brown/20 mt-4">
              <button
                type="button"
                onClick={() => setCustomConfirm(prev => ({ ...prev, isOpen: false }))}
                className="sketchy-button bg-white hover:bg-slate-50 text-brand-brown px-3 py-1.5 font-bold"
              >
                取消
              </button>
              <button
                type="button"
                onClick={customConfirm.onConfirm}
                className={`sketchy-button text-brand-brown px-4 py-1.5 font-black flex items-center gap-1 cursor-pointer ${
                  customConfirm.type === 'delete' ? 'bg-rose-100 hover:bg-rose-200' : 'bg-emerald-100 hover:bg-emerald-250'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>確認執行</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
