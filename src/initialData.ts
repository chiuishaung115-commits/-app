import { Student, Teacher, Room, Lesson, Attendance, SignNotification, RoomRental, RecurringLesson } from './types';

export const initialStudents: Student[] = [
  {
    id: 's1',
    name: '王伯軒',
    avatar: '👦',
    phone: '0912-888-999',
    parentName: '王媽媽',
    parentPhone: '0912-888-999',
    joinDate: '2026-06-01',
    active: true,
    notes: '愛唱歌，琴鍵指力練習中'
  },
  {
    id: 's2',
    name: '貓咪妙妙',
    avatar: '🐱',
    phone: '0922-111-222',
    parentName: '貓爸爸',
    parentPhone: '0922-111-333',
    joinDate: '2026-02-14',
    active: true,
    notes: '練習時手腕記得要放鬆，需要適度休息與鼓勵。'
  },
  {
    id: 's3',
    name: '兔兔糖糖',
    avatar: '🐰',
    phone: '0933-444-555',
    parentName: '兔媽媽',
    parentPhone: '0933-444-556',
    joinDate: '2026-03-20',
    active: true,
    notes: '今日著重節拍器練習。視譜彈奏能力很棒！'
  },
  {
    id: 's4',
    name: '小豬皮皮',
    avatar: '🐷',
    phone: '0944-777-888',
    parentName: '豬媽媽',
    parentPhone: '0944-777-889',
    joinDate: '2025-12-05',
    active: true,
    notes: '課堂表現非常積極，喜歡課堂末段成果發表與錄音。'
  },
  {
    id: 's5',
    name: '狐狸瑞瑞',
    avatar: '🦊',
    phone: '0955-666-777',
    parentName: '狐狸爸爸',
    parentPhone: '0955-666-778',
    joinDate: '2026-04-01',
    active: true,
    notes: '小提琴拉琴姿勢持續微調中，音準有顯著進步！'
  }
];

export const initialTeachers: Teacher[] = [
  {
    id: 't1',
    name: '長頸鹿老師',
    avatar: '🦒',
    instrument: '鋼琴 / 視唱樂理',
    phone: '0988-123-456',
    color: '#FCD34D' // amber-300
  },
  {
    id: 't2',
    name: '大象叔叔',
    avatar: '🐘',
    instrument: '古典吉他 / 烏克麗麗',
    phone: '0977-654-321',
    color: '#81E6D9' // teal-300
  },
  {
    id: 't3',
    name: '無尾熊姐姐',
    avatar: '🐨',
    instrument: '小提琴 / 大提琴',
    phone: '0966-222-333',
    color: '#C084FC' // purple-400
  },
  {
    id: 't4',
    name: '獅子王老師',
    avatar: '🦁',
    instrument: '熱血爵士鼓 / 木箱鼓',
    phone: '0911-333-555',
    color: '#F87171' // red-400
  }
];

export const initialRooms: Room[] = [
  {
    id: 'r1',
    name: '愛麗絲鋼琴房',
    emoji: '🎹',
    equipment: 'YAMAHA 三角鋼琴、粉色黑板架、手電譜燈',
    status: 'Rented',
    currentRenter: '林曼珍',
    currentRenterPhone: '0933-222-111',
    timeSlot: '14:00 - 15:00'
  },
  {
    id: 'r2',
    name: '莫札特小提琴房',
    emoji: '🎻',
    equipment: '立面落地大姿態鏡、中提琴架、藍牙音響',
    status: 'Available'
  },
  {
    id: 'r3',
    name: '森林爵士鼓房',
    emoji: '🥁',
    equipment: 'Roland 電子鼓加套裝、低音隔音門',
    status: 'Maintenance'
  },
  {
    id: 'r4',
    name: '快樂烏克麗麗房',
    emoji: '🎸',
    equipment: '多把掛牆小吉他、暖光小抬燈、雙人木椅',
    status: 'Available'
  }
];

export const initialLessons: Lesson[] = [
  {
    id: 'l1',
    studentId: 's1',
    studentName: '王伯軒',
    teacherId: 't1',
    teacherName: '長頸鹿老師',
    instrument: '鋼琴',
    roomName: '愛麗絲鋼琴房',
    date: '2026-06-12',
    timeSlot: '13:00 - 14:00',
    price: 1200,
    feePaid: false,
    attendance: Attendance.Absent
  }
];

export const initialRoomRentals: RoomRental[] = [
  {
    id: 'rr1',
    roomId: 'r1',
    roomName: '愛麗絲鋼琴房',
    renterName: '林曼珍',
    renterPhone: '0933-222-111',
    timeSlot: '14:00 - 15:00',
    price: 300,
    paid: false,
    date: '2026-06-12'
  }
];

export const initialNotifications: SignNotification[] = [
  {
    id: 'n1',
    type: 'StudentCheckIn',
    message: '🌸 【系統通報】學員「兔兔糖糖」已於 15:55 完成線上自主簽到囉！(本日課程 16:00 鋼琴課)',
    time: '15:55',
    read: false,
    senderName: '兔兔糖糖',
    role: 'Student'
  },
  {
    id: 'n2',
    type: 'TeacherCheckIn',
    message: '🦒 【老師打卡】「長頸鹿老師」已完成 13:45 第一堂鋼琴課簽到。',
    time: '13:45',
    read: true,
    senderName: '長頸鹿老師',
    role: 'Teacher'
  },
  {
    id: 'n3',
    type: 'TuitionAlert',
    message: '💰 【學雜帳款】「貓咪妙妙」的本日小提琴課費用 $1500 待收，本月有逾期提醒。',
    time: '11:00',
    read: false,
    senderName: '貓咪妙妙',
    role: 'Admin'
  }
];

export const initialRecurringLessons: RecurringLesson[] = [
  {
    id: 'rl1',
    studentId: 's1',
    studentName: '王伯軒',
    teacherId: 't1',
    teacherName: '長頸鹿老師',
    instrument: '鋼琴',
    roomName: '愛麗絲鋼琴房',
    dayOfWeek: 5, // Friday
    timeSlot: '13:00 - 14:00',
    price: 1200
  },
  {
    id: 'rl2',
    studentId: 's2',
    studentName: '貓咪妙妙',
    teacherId: 't3',
    teacherName: '無尾熊姐姐',
    instrument: '小提琴',
    roomName: '莫札特小提琴房',
    dayOfWeek: 5, // Friday
    timeSlot: '15:30 - 16:30',
    price: 1500
  },
  {
    id: 'rl3',
    studentId: 's3',
    studentName: '兔兔糖糖',
    teacherId: 't1',
    teacherName: '長頸鹿老師',
    instrument: '鋼琴',
    roomName: '愛麗絲鋼琴房',
    dayOfWeek: 5, // Friday
    timeSlot: '16:00 - 17:00',
    price: 1200
  },
  {
    id: 'rl4',
    studentId: 's4',
    studentName: '小豬皮皮',
    teacherId: 't2',
    teacherName: '大象叔叔',
    instrument: '古典吉他',
    roomName: '快樂烏克麗麗房',
    dayOfWeek: 5, // Friday
    timeSlot: '18:00 - 19:00',
    price: 1000
  },
  {
    id: 'rl5',
    studentId: 's5',
    studentName: '狐狸瑞瑞',
    teacherId: 't3',
    teacherName: '無尾熊姐姐',
    instrument: '小提琴',
    roomName: '莫札特小提琴房',
    dayOfWeek: 5, // Friday
    timeSlot: '19:00 - 20:00',
    price: 1500
  },
  {
    id: 'rl7',
    studentId: 's3',
    studentName: '兔兔糖糖',
    teacherId: 't3',
    teacherName: '無尾熊姐姐',
    instrument: '小提琴',
    roomName: '莫札特小提琴房',
    dayOfWeek: 3, // Wednesday
    timeSlot: '14:30 - 15:30',
    price: 1400
  },
  {
    id: 'rl8',
    studentId: 's2',
    studentName: '貓咪妙妙',
    teacherId: 't1',
    teacherName: '長頸鹿老師',
    instrument: '鋼琴',
    roomName: '愛麗絲鋼琴房',
    dayOfWeek: 6, // Saturday
    timeSlot: '11:00 - 12:00',
    price: 1250
  }
];
