export enum Attendance {
  Unchecked = 'Unchecked',
  CheckedIn = 'CheckedIn',
  Absent = 'Absent',
  Excused = 'Excused'
}

export interface Student {
  id: string;
  name: string;
  avatar: string; // emoji or cute illustration placeholder
  phone: string;
  parentName?: string;
  parentPhone?: string;
  joinDate: string;
  active: boolean;
  notes?: string;
}

export interface Teacher {
  id: string;
  name: string;
  avatar: string;
  instrument: string; // e.g., 鋼琴, 小提琴, 長笛, 吉他
  phone: string;
  color: string; // Hex color or Tailwind color class for cards
}

export interface Room {
  id: string;
  name: string;
  emoji: string; // cute piano, violin etc
  equipment: string;
  status: 'Available' | 'Rented' | 'Maintenance'; // 閒置中, 租借中, 保養中
  currentRenter?: string;
  currentRenterPhone?: string;
  timeSlot?: string;
  currentPrice?: number;
}

export interface Lesson {
  id: string;
  studentId: string;
  studentName: string;
  teacherId: string;
  teacherName: string;
  instrument: string;
  roomName: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // "10:00 - 11:00"
  price: number;
  feePaid: boolean;
  attendance: Attendance;
  checkInTime?: string;
}

export interface RoomRental {
  id: string;
  roomId: string;
  roomName: string;
  renterName: string;
  renterPhone: string;
  timeSlot: string;
  price: number;
  paid: boolean;
  date: string;
}

export interface RecurringLesson {
  id: string;
  studentId: string;
  studentName: string;
  teacherId: string;
  teacherName: string;
  instrument: string;
  roomName: string;
  dayOfWeek: number; // 0 for Sunday, 1 for Monday, ..., 6 for Saturday
  timeSlot: string;
  price: number;
}

export interface SignNotification {
  id: string;
  type: 'StudentCheckIn' | 'TeacherCheckIn' | 'TuitionAlert';
  message: string;
  time: string;
  read: boolean;
  senderName: string;
  role: 'Student' | 'Teacher' | 'Admin';
}
