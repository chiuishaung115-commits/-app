import React, { useState } from 'react';
import { Student, Teacher, Lesson, Attendance } from '../types';
import { Sparkles, Trophy, CheckCircle, Smile, HelpCircle, ArrowRight, Music, Heart } from 'lucide-react';

interface CheckInViewProps {
  students: Student[];
  teachers: Teacher[];
  lessons: Lesson[];
  setLessons: React.Dispatch<React.SetStateAction<Lesson[]>>;
  onEmitNotification: (message: string, type: 'StudentCheckIn' | 'TeacherCheckIn' | 'TuitionAlert', senderName: string) => void;
  selectedDate: string;
}

export default function CheckInView({
  students,
  teachers,
  lessons,
  setLessons,
  onEmitNotification,
  selectedDate
}: CheckInViewProps) {
  // Check-in Identity Mode
  const [identityMode, setIdentityMode] = useState<'student' | 'teacher'>('student');

  // Student specific check-in states
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [studentNote, setStudentNote] = useState('');

  // Teacher specific check-in states
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [teacherStatusMsg, setTeacherStatusMsg] = useState('');

  // Big Splash celebration modal on successful check-in
  const [successModal, setSuccessModal] = useState<{
    isOpen: boolean;
    name: string;
    avatar: string;
    type: 'student' | 'teacher';
    time: string;
    extraMsg?: string;
  }>({
    isOpen: false,
    name: '',
    avatar: '🧸',
    type: 'student',
    time: ''
  });

  // Filter lessons for today
  const todayStr = selectedDate;

  // Handle Student online sign in click
  const handleStudentCheckInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return alert('請先點擊選擇您的動物卡片喔！');

    const chosenStudent = students.find(s => s.id === selectedStudentId);
    if (!chosenStudent) return;

    // Find if there is an active lesson today for this student
    const activeLessonsToday = lessons.filter(l => l.studentId === selectedStudentId && l.date === todayStr);
    
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Update lesson state in global app
    if (activeLessonsToday.length > 0) {
      setLessons(prev => prev.map(l => {
        // Mark all matching lessons for today as checked-in
        if (l.studentId === selectedStudentId && l.date === todayStr) {
          return {
            ...l,
            attendance: Attendance.CheckedIn,
            checkInTime: timeStr
          };
        }
        return l;
      }));
    } else {
      // Even if they don't have a schedule today, they can still do walk-in sign in! Very flexible.
    }

    // Build broadcast text and record in notification lists
    const lessonInfoText = activeLessonsToday.length > 0 
      ? `本日課程是 ${activeLessonsToday[0].timeSlot} 的「${activeLessonsToday[0].instrument}」`
      : '今日暫無正規排課 (自主教室自主練琴)';

    const noteText = studentNote.trim() ? ` 📝 本日心情備忘：『${studentNote}』` : '';
    const message = `🌸 【線上通知】學員「${chosenStudent.name} ${chosenStudent.avatar}」完成線上到班登入！(${timeStr})。${lessonInfoText}。${noteText}`;
    
    onEmitNotification(message, 'StudentCheckIn', chosenStudent.name);

    // Trigger cute celebration splash
    setSuccessModal({
      isOpen: true,
      name: chosenStudent.name,
      avatar: chosenStudent.avatar,
      type: 'student',
      time: timeStr,
      extraMsg: activeLessonsToday.length > 0 
        ? `本日教授課程：${activeLessonsToday[0].timeSlot} (${activeLessonsToday[0].instrument})，請提醒櫃台老師，並準備至教室上課喔！`
        : '今日無登記正規上排課，歡迎來本教室自由練琴，記得親切向大廳櫃台打招呼喔！'
    });

    // Reset fields
    setSelectedStudentId('');
    setStudentNote('');
  };

  // Handle Teacher online check in click
  const handleTeacherCheckInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacherId) return alert('請先點擊選擇您的教師卡片喔！');

    const chosenTeacher = teachers.find(t => t.id === selectedTeacherId);
    if (!chosenTeacher) return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const statusText = teacherStatusMsg.trim() ? ` 💬 教學小指南：『${teacherStatusMsg}』` : '';
    const message = `🦒 【線上通知】優質導師「${chosenTeacher.name} ${chosenTeacher.avatar}」已經順利抵達校區打卡簽到！教室整備狀況良好。${statusText}`;

    onEmitNotification(message, 'TeacherCheckIn', chosenTeacher.name);

    // Trigger splash
    setSuccessModal({
      isOpen: true,
      name: chosenTeacher.name,
      avatar: chosenTeacher.avatar,
      type: 'teacher',
      time: timeStr,
      extraMsg: `辛苦了！今日有您陪伴孩子們拉近與音樂的距離，琴房教具均已殺菌整理就緒。加油喔！`
    });

    // Reset fields
    setSelectedTeacherId('');
    setTeacherStatusMsg('');
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-12 text-brand-brown">
      
      {/* Kiosk Mode Container Card */}
      <div className="sketchy-card bg-white p-6 md:p-8 relative">
        {/* Ribbon banner on top right */}
        <div className="absolute top-0 right-10 bg-brand-pink text-brand-brown border-x-2 border-b-2 border-brand-brown text-xs font-black px-4 py-1 flex items-center gap-1 shadow-[1px_1px_0px_#4A3728]">
          <Heart className="w-3.5 h-3.5 fill-rose-500 stroke-none" />
          <span>線上自主簽到機</span>
        </div>

        <div className="text-center max-w-xl mx-auto mb-8 mt-2">
          <span className="text-4xl animate-bounce inline-block">🔔</span>
          <h2 className="text-2xl md:text-3xl font-black mt-2">小小樂手與大師簽到處</h2>
          <p className="text-xs md:text-sm text-brand-brown/75 mt-1 leading-relaxed font-bold">
            請在下方點擊您的代表性動物大頭卡片，送出後系統會同步「廣播提醒」櫃台大廳人員，
            協助您快速對帳、入班與分發琴房。
          </p>
        </div>

        {/* Identity Selector */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => {
              setIdentityMode('student');
              setSelectedStudentId('');
            }}
            className={`flex-1 max-w-[200px] sketchy-button px-4 py-3 font-black text-sm flex flex-col items-center gap-1.5 cursor-pointer ${
              identityMode === 'student' ? 'bg-brand-blue shadow-[4px_4px_0px_#4A3728] -translate-y-0.5' : 'bg-brand-cream/40'
            }`}
          >
            <span className="text-3xl">🧸</span>
            <span>我是萌萌學員</span>
          </button>
          
          <button
            onClick={() => {
              setIdentityMode('teacher');
              setSelectedTeacherId('');
            }}
            className={`flex-1 max-w-[200px] sketchy-button px-4 py-3 font-black text-sm flex flex-col items-center gap-1.5 cursor-pointer ${
              identityMode === 'teacher' ? 'bg-brand-pink shadow-[4px_4px_0px_#4A3728] -translate-y-0.5' : 'bg-brand-cream/40'
            }`}
          >
            <span className="text-3xl">🦒</span>
            <span>我是優質導師</span>
          </button>
        </div>

        {/* MAIN SIGN-IN FORM DISPLAY */}
        {identityMode === 'student' ? (
          <form onSubmit={handleStudentCheckInSubmit} className="space-y-6">
            
            {/* Step 1: Select Student Card */}
            <div>
              <h3 className="font-extrabold text-sm mb-3 flex items-center gap-1">
                <span className="h-5 w-5 bg-brand-yellow border border-brand-brown rounded-full flex items-center justify-center text-xs">1</span>
                <span>點擊選擇屬於您的動物寶貝：</span>
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {students.map((stud) => {
                  const isSelected = selectedStudentId === stud.id;
                  // check if already checked in today
                  const isAlreadyIn = lessons.some(l => l.studentId === stud.id && l.date === todayStr && l.attendance === Attendance.CheckedIn);

                  return (
                    <button
                      type="button"
                      key={stud.id}
                      onClick={() => setSelectedStudentId(stud.id)}
                      className={`sketchy-card sketchy-card-interactive p-3.5 flex flex-col items-center justify-center gap-1 relative overflow-hidden bg-brand-cream/25 cursor-pointer ${
                        isSelected 
                          ? 'bg-brand-blue ring-3 ring-sky-400 border-sky-600 scale-103' 
                          : 'hover:bg-amber-50/10'
                      }`}
                    >
                      <span className="text-3xl block">{stud.avatar}</span>
                      <strong className="text-sm font-extrabold text-brand-brown block">{stud.name}</strong>
                      
                      {isAlreadyIn && (
                        <span className="absolute top-1 right-1 text-xs shrink-0" title="今日已簽到">
                          ✅
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Message write */}
            <div>
              <h3 className="font-extrabold text-sm mb-2 flex items-center gap-1">
                <span className="h-5 w-5 bg-brand-yellow border border-brand-brown rounded-full flex items-center justify-center text-xs">2</span>
                <span>有什麼小叮嚀想告訴櫃台老師嗎？(或填寫本日心情，選填)：</span>
              </h3>
              <input
                type="text"
                maxLength={40}
                placeholder="例如：我指甲修剪好了！、今天媽媽等下五點會直接來接我喔..."
                value={studentNote}
                onChange={(e) => setStudentNote(e.target.value)}
                className="w-full sketchy-input text-xs"
              />
            </div>

            {/* Submit btn */}
            <div className="text-center pt-3">
              <button
                type="submit"
                className="sketchy-button bg-brand-green hover:bg-emerald-250 hover:scale-[1.01] transition-transform text-brand-brown font-extrabold text-sm md:text-base py-3 px-8 inline-flex items-center gap-2"
              >
                <Music className="w-5 h-5 text-emerald-700 animate-spin-slow" />
                <span>送出，完成線上大廳到班簽到 🚀</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>
        ) : (
          <form onSubmit={handleTeacherCheckInSubmit} className="space-y-6">
            
            {/* Step 1: Select Teacher Card */}
            <div>
              <h3 className="font-extrabold text-sm mb-3 flex items-center gap-1">
                <span className="h-5 w-5 bg-brand-yellow border border-brand-brown rounded-full flex items-center justify-center text-xs">1</span>
                <span>點擊選擇您的教師身分：</span>
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {teachers.map((teach) => {
                  const isSelected = selectedTeacherId === teach.id;
                  return (
                    <button
                      type="button"
                      key={teach.id}
                      onClick={() => setSelectedTeacherId(teach.id)}
                      className={`sketchy-card sketchy-card-interactive p-3 flex flex-col items-center justify-center gap-1 bg-brand-cream/25 cursor-pointer ${
                        isSelected 
                          ? 'bg-brand-pink ring-3 ring-pink-400 border-pink-600 scale-103' 
                          : 'hover:bg-amber-50/10'
                      }`}
                    >
                      <span className="text-3xl block">{teach.avatar}</span>
                      <strong className="text-sm font-extrabold text-brand-brown block">{teach.name}</strong>
                      <span className="text-[10px] text-brand-brown/70 font-semibold truncate max-w-full">
                        {teach.instrument}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Teacher Message write */}
            <div>
              <h3 className="font-extrabold text-sm mb-2 flex items-center gap-1">
                <span className="h-5 w-5 bg-brand-yellow border border-brand-brown rounded-full flex items-center justify-center text-xs">2</span>
                <span>備課/叮嚀留言 (選填)：</span>
              </h3>
              <input
                type="text"
                placeholder="例如：教材已擺放、本日進度追蹤至第三條、下午茶已寄櫃..."
                value={teacherStatusMsg}
                onChange={(e) => setTeacherStatusMsg(e.target.value)}
                className="w-full sketchy-input text-xs"
              />
            </div>

            {/* Submit btn */}
            <div className="text-center pt-3">
              <button
                type="submit"
                className="sketchy-button bg-brand-yellow hover:bg-amber-200 text-brand-brown font-extrabold text-sm md:text-base py-3 px-8 inline-flex items-center gap-2"
              >
                <Trophy className="w-5 h-5 text-amber-600" />
                <span>完成教師校區簽到，開啟美好教學 🦒</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>
        )}
      </div>

      {/* POP-UP SPLASH MODAL ON SUCCESS CELEBRATION */}
      {successModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-brand-cream border-4 border-brand-brown rounded-[28px] shadow-[10px_10px_0px_#4A3728] p-6 text-center relative overflow-hidden animate-in scale-in duration-250">
            
            {/* confetti decorative ribbons */}
            <div className="absolute top-0 inset-x-0 h-4 bg-brand-yellow" />
            <div className="absolute -top-6 -left-6 text-5xl opacity-40">🌸</div>
            <div className="absolute -bottom-6 -right-6 text-5xl opacity-40">🎵</div>
            
            <div className="w-20 h-20 bg-brand-yellow border-3 border-brand-brown rounded-full mx-auto flex items-center justify-center shadow-[3px_3px_0px_#4A3728] mb-4">
              <span className="text-5xl">{successModal.avatar}</span>
            </div>

            <h3 className="font-black text-2xl mb-1 text-emerald-800">🎉 丁咚！簽到完成！</h3>
            <p className="text-sm text-brand-brown font-extrabold mb-4">
              歡迎抵達！<strong>{successModal.name}</strong> 老師學員 
              於 <span className="underline decoration-brand-yellow decoration-3 underline-offset-2 font-black">{successModal.time}</span> 完成通報！
            </p>

            <div className="bg-white border-2 border-brand-brown rounded-xl p-4 text-xs font-semibold text-brand-brown/90 leading-relaxed mb-6 text-left">
              <span className="block mb-1 text-amber-900 font-extrabold">🔔 大廳櫃台提示播報：</span>
              {successModal.extraMsg}
            </div>

            <button
              id="confirm-success-modal-btn"
              onClick={() => setSuccessModal(prev => ({ ...prev, isOpen: false }))}
              className="sketchy-button w-full bg-brand-green py-2.5 font-black text-sm text-brand-brown"
            >
              好棒！準備上課囉 🍭
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
