import React, { useState, useEffect, useRef } from 'react';
import { 
  Cloud, CloudUpload, CloudDownload, File, FileText, Music, 
  FolderOpen, Trash2, LogOut, RefreshCw, AlertTriangle, 
  CheckSquare, ShieldCheck, FileDown, Upload, Check, X,
  ExternalLink, User, CheckCircle2, Database, AlertCircle
} from 'lucide-react';
import { 
  googleSignIn, 
  logout, 
  initAuth, 
  getOrCreateAppFolder, 
  listFilesInFolder, 
  uploadFileToFolder, 
  downloadFileContent, 
  deleteFile, 
  DriveItem 
} from '../lib/googleDrive';
import { Student, Teacher, Room, Lesson, RoomRental, RecurringLesson, SignNotification } from '../types';

interface GoogleDriveViewProps {
  students: Student[];
  teachers: Teacher[];
  rooms: Room[];
  lessons: Lesson[];
  roomRentals: RoomRental[];
  recurringLessons: RecurringLesson[];
  notifications: SignNotification[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  setTeachers: React.Dispatch<React.SetStateAction<Teacher[]>>;
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
  setLessons: React.Dispatch<React.SetStateAction<Lesson[]>>;
  setRoomRentals: React.Dispatch<React.SetStateAction<RoomRental[]>>;
  setRecurringLessons: React.Dispatch<React.SetStateAction<RecurringLesson[]>>;
  setNotifications: React.Dispatch<React.SetStateAction<SignNotification[]>>;
  onEmitNotification: (message: string, type: 'StudentCheckIn' | 'TeacherCheckIn' | 'TuitionAlert', senderName: string) => void;
}

export default function GoogleDriveView({
  students,
  teachers,
  rooms,
  lessons,
  roomRentals,
  recurringLessons,
  notifications,
  setStudents,
  setTeachers,
  setRooms,
  setLessons,
  setRoomRentals,
  setRecurringLessons,
  setNotifications,
  onEmitNotification
}: GoogleDriveViewProps) {
  
  // Auth states
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Drive workspace configurations
  const [appFolderId, setAppFolderId] = useState<string | null>(null);
  const [driveFiles, setDriveFiles] = useState<DriveItem[]>([]);
  const [loadingDrive, setLoadingDrive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Tabs for Google Drive subviews
  const [activeTab, setActiveTab] = useState<'materials' | 'backups'>('materials');

  // File upload state block
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Custom modal dialogues
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: 'delete' | 'restore' | 'danger';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'delete'
  });

  // Track Firebase Auth State on mounting
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
        setLoadingAuth(false);
      },
      () => {
        setUser(null);
        setToken(null);
        setLoadingAuth(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Sync / Read Google Drive once token is available
  useEffect(() => {
    if (token) {
      loadDriveWorkspace(token);
    } else {
      setAppFolderId(null);
      setDriveFiles([]);
    }
  }, [token]);

  const showNotification = (msg: string, isError = false) => {
    if (isError) {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(null), 5000);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        showNotification('🔑 成功登入 Google 帳戶並開通雲端硬碟權限！');
      }
    } catch (err: any) {
      console.error(err);
      showNotification('登入失敗，請確認是否提供了正確權限。', true);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setToken(null);
      showNotification('➡️ 已安全中斷雲端硬碟通道鏈結！');
    } catch (err) {
      showNotification('登出時發生異常', true);
    }
  };

  const loadDriveWorkspace = async (accessToken: string) => {
    setLoadingDrive(true);
    try {
      const folderId = await getOrCreateAppFolder(accessToken);
      setAppFolderId(folderId);
      const files = await listFilesInFolder(accessToken, folderId);
      setDriveFiles(files);
    } catch (err: any) {
      console.error(err);
      showNotification('讀取 Google Drive 空間時發生錯誤，請重新登入！', true);
    } finally {
      setLoadingDrive(false);
    }
  };

  // Upload lesson sheets or standard staff PDFs/audios
  const handleFileUpload = async (file: File) => {
    if (!token || !appFolderId) return;
    setUploadProgress(`正在上傳檔案 👉 ${file.name}...`);
    try {
      const uploadedItem = await uploadFileToFolder(
        token,
        appFolderId,
        file.name,
        file,
        file.type || 'application/octet-stream'
      );
      
      // Update list
      setDriveFiles(prev => [uploadedItem, ...prev]);
      showNotification(`🎉 $『${file.name}』 已成功上傳備存至您的 Google 雲端專屬教材夾！`);
    } catch (err) {
      console.error(err);
      showNotification('檔案上傳失敗，請稍候再試', true);
    } finally {
      setUploadProgress(null);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  // Handle direct file deletion (per guideline: always ask for explicit confirmation!)
  const triggerDeleteConfirm = (fileId: string, fileName: string) => {
    setConfirmModal({
      isOpen: true,
      title: '🗑️ 確定要刪除雲端檔案嗎？',
      message: `您即將從 Google Drive「哆咪音樂坊-雲端教材與備份」中永久刪除檔案「${fileName}」！此項操作是不可逆的，確定要繼續嗎？`,
      type: 'delete',
      onConfirm: async () => {
        if (!token) return;
        try {
          await deleteFile(token, fileId);
          setDriveFiles(prev => prev.filter(f => f.id !== fileId));
          showNotification(`✅ 檔案 『${fileName}』 已成功由雲端空間中抹除！`);
        } catch (err) {
          showNotification('刪除雲端檔案失敗', true);
        } finally {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  // System Database State - Backup Trigger
  const handlePerformBackup = async () => {
    if (!token || !appFolderId) return;
    setLoadingDrive(true);
    try {
      const payload = {
        applet_id: 'afcc7c26-30b9-4828-b524-8f33d29bfd9d',
        exportDate: new Date().toISOString(),
        students,
        teachers,
        rooms,
        lessons,
        roomRentals,
        recurringLessons,
        notifications
      };
      
      const now = new Date();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const date = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      const filename = `哆咪音樂坊_系統備份_${now.getFullYear()}${month}${date}_${hours}${mins}.json`;

      const blobContent = JSON.stringify(payload, null, 2);
      
      const uploadedItem = await uploadFileToFolder(
        token,
        appFolderId,
        filename,
        blobContent,
        'application/json'
      );
      
      setDriveFiles(prev => [uploadedItem, ...prev]);
      
      // Emit school system notification
      onEmitNotification(
        `💾 【系統備份完成】智慧後台已成功連線，並將全校資料備份儲存為「${filename}」於 Google 雲端硬碟中。`,
        'TuitionAlert',
        '雲端排程器'
      );

      showNotification(`💾 全校學籍與排課資料已打包上傳！檔案名稱為『${filename}』`);
    } catch (err) {
      console.error(err);
      showNotification('系統備份失敗，請稍候重試', true);
    } finally {
      setLoadingDrive(false);
    }
  };

  // System Database State - Restore Trigger (requires explicit confirmation!)
  const triggerRestoreConfirm = (fileId: string, fileName: string) => {
    setConfirmModal({
      isOpen: true,
      title: '🚨 警告：您即將進行全系統還原！',
      message: `您即將使用檔案「${fileName}」覆蓋『目前』本地瀏覽器所有的學員名冊、授課師資、教室租借、今日排課及固定排課紀錄！這會覆蓋今天所有的全新調整，確定要執行全校系統還原嗎？`,
      type: 'restore',
      onConfirm: async () => {
        if (!token) return;
        setLoadingDrive(true);
        try {
          const rawText = await downloadFileContent(token, fileId);
          const payload = JSON.parse(rawText);
          
          if (!payload.students || !payload.lessons || !payload.teachers) {
            throw new Error('不合法的哆咪備份格式，遺漏關鍵對象主鍵');
          }

          // Force update local states
          setStudents(payload.students || []);
          setTeachers(payload.teachers || []);
          setRooms(payload.rooms || []);
          setLessons(payload.lessons || []);
          setRoomRentals(payload.roomRentals || []);
          setRecurringLessons(payload.recurringLessons || []);
          if (payload.notifications) {
            setNotifications(payload.notifications);
          }

          // Emit a system notification so lobby or teachers get a nice prompt
          onEmitNotification(
            `🔄 【全校資料還原】系統剛已從 Google 雲端「${fileName}」完成全校資料倒回還原，教室與課表已就緒！`,
            'TuitionAlert',
            '系統回復器'
          );

          showNotification(`🎉 恭喜！全系統與學員排課已成功還原至備份點：『${fileName}』`);
        } catch (err: any) {
          console.error(err);
          showNotification(`還原失敗: ${err.message || '檔案解析格式不符特徵'}`, true);
        } finally {
          setLoadingDrive(false);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  // Helper icons selector based on mimeType
  const getFileIcon = (mime: string) => {
    if (mime.includes('image')) return <CheckCircle2 className="w-8 h-8 text-indigo-500" />;
    if (mime.includes('audio') || mime.includes('mp3')) return <Music className="w-8 h-8 text-rose-500 animate-pulse" />;
    if (mime.includes('pdf')) return <FileText className="w-8 h-8 text-red-500" />;
    if (mime.includes('json') || mime.includes('javascript')) return <Database className="w-8 h-8 text-sky-600" />;
    return <File className="w-8 h-8 text-brand-brown/50" />;
  };

  // Distinguish uploaded student sheet musics vs database json backups
  const materialFiles = driveFiles.filter(f => !f.name.startsWith('哆咪音樂坊_系統備份_') && f.mimeType !== 'application/vnd.google-apps.folder');
  const backupFiles = driveFiles.filter(f => f.name.startsWith('哆咪音樂坊_系統備份_'));

  if (loadingAuth) {
    return (
      <div className="sketchy-card bg-white p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
        <RefreshCw className="w-8 h-8 text-brand-pink animate-spin mb-3" />
        <p className="font-extrabold text-sm">正在開通 Google Workspace 雲端硬碟安全通道...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Intro info card element */}
      <div className="sketchy-card bg-indigo-50 border-indigo-600 p-5">
        <h3 className="font-black text-xl flex items-center gap-2 text-indigo-800">
          <Cloud className="w-5 h-5 text-indigo-700 animate-pulse" />
          <span>☁️ 哆咪雲端硬碟 (Google Drive) 教材與備份中樞</span>
        </h3>
        <p className="text-xs md:text-sm text-indigo-900/85 mt-2 font-bold leading-relaxed">
          此面板已完成 Google 雲端硬碟 (Google Drive) 的權限串接。
          您可以自由上傳教學講義 PDF、小提琴或鋼琴的教學背景 MP3 音檔。
          同時，系統支援「一鍵全校備份」，將學生、老師、當日排課與長規排課一併安全封存在 Google Cloud 中，支持随时還原！
        </p>
      </div>

      {/* Auth Control Header Block */}
      <div className="sketchy-card bg-white p-5 flex flex-col md:flex-row justify-between items-center gap-4">
        {!user ? (
          <div className="flex flex-col md:flex-row justify-between items-center w-full gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl p-2 bg-yellow-50 border border-brand-brown rounded-full w-12 h-12 flex items-center justify-center shadow-[1px_1px_0px_#4A3728]">
                🔑
              </span>
              <div>
                <h4 className="font-black text-sm md:text-md">當前未與 Google Drive 建立安全通訊</h4>
                <p className="text-xs text-brand-brown/70 font-semibold mt-0.5">請點選右側安全按鈕完成授權與連線</p>
              </div>
            </div>

            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="px-5 py-2.5 bg-brand-blue hover:bg-sky-200 text-brand-brown text-xs md:text-sm font-black border-2 border-brand-brown rounded-xl shadow-[2px_2px_0px_#4A3728] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-2"
            >
              <CloudUpload className="w-4 h-4" />
              <span>{isLoggingIn ? '程式連線中...' : '使用 Google 帳戶登入授權'}</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row justify-between items-center w-full gap-4">
            <div className="flex items-center gap-3">
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  referrerPolicy="no-referrer"
                  alt={user.displayName}
                  className="w-12 h-12 rounded-full border-2 border-brand-brown shadow-[1.5px_1.5px_0px_#4A3728]" 
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-brand-green/20 border-2 border-brand-brown flex items-center justify-center text-xl font-bold shadow-[1.5px_1.5px_0px_#4A3728]">
                  👦
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-sm md:text-md text-brand-brown">{user.displayName || '行政治理員'}</h4>
                  <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded border border-emerald-400">
                    連線安全中 ●
                  </span>
                </div>
                <p className="text-[10px] text-brand-brown/70 font-mono mt-0.5">{user.email}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => token && loadDriveWorkspace(token)}
                disabled={loadingDrive}
                className="px-4 py-1.5 bg-white hover:bg-slate-50 text-brand-brown text-xs font-bold border-2 border-brand-brown rounded-xl shadow-[1.5px_1.5px_0px_#4A3728] active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingDrive ? 'animate-spin' : ''}`} />
                <span>整理硬碟</span>
              </button>
              
              <button
                onClick={handleLogout}
                className="px-4 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border-2 border-brand-brown rounded-xl shadow-[1.5px_1.5px_0px_#4A3728] active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>中斷鏈結</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="sketchy-card bg-red-100 border-red-500 p-3.5 text-xs text-red-800 font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-red-650 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="sketchy-card bg-emerald-100 border-emerald-500 p-3.5 text-xs text-emerald-800 font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-650 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main active Google Drive Panels */}
      {user && (
        <div className="space-y-6">
          {/* Sub Navigation inside Google Drive section */}
          <div className="flex border-b-2 border-brand-brown/30 gap-4">
            <button
              onClick={() => {
                setActiveTab('materials');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`pb-2.5 font-black text-sm relative transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'materials' 
                  ? 'text-brand-brown border-b-3 border-brand-pink scale-102 font-black' 
                  : 'text-brand-brown/50 hover:text-brand-brown'
              }`}
            >
              <FolderOpen className="w-4 h-4" />
              <span>🎷 雲端課堂教材教材庫 ({materialFiles.length})</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('backups');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`pb-2.5 font-black text-sm relative transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'backups' 
                  ? 'text-brand-brown border-b-3 border-brand-pink scale-102 font-black' 
                  : 'text-brand-brown/50 hover:text-brand-brown'
              }`}
            >
              <CloudDownload className="w-4 h-4" />
              <span>💾 哆咪學籍定期雲備份盒 ({backupFiles.length})</span>
            </button>
          </div>

          {activeTab === 'materials' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Side: Drag-and-drop file uploader */}
              <div className="lg:col-span-5 space-y-4">
                <div className="sketchy-card bg-brand-cream/20 p-5">
                  <h4 className="font-extrabold text-sm mb-3 text-brand-brown flex items-center gap-1">
                    <CloudUpload className="w-4 h-4 text-brand-brown/80" />
                    <span>上傳實體講義或練習音樂</span>
                  </h4>

                  <div 
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-3 border-dashed border-brand-brown rounded-[20px] p-8 text-center cursor-pointer transition-all ${
                      dragActive ? 'bg-indigo-105/5 border-indigo-500 scale-[0.99]' : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    <Upload className={`w-8 h-8 mx-auto text-brand-brown/40 mb-2.5 ${dragActive ? 'animate-bounce text-indigo-500' : ''}`} />
                    <p className="text-xs font-black text-brand-brown">
                      將樂譜 PDF、MP3 音樂或琴房照片拖曳至此處
                    </p>
                    <p className="text-[10px] text-brand-brown/40 font-bold mt-1.5">
                      或者直接點擊本區塊開啟資料夾選擇
                    </p>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={onFileChange}
                      className="hidden" 
                    />
                  </div>

                  {uploadProgress && (
                    <div className="mt-4 p-3 bg-indigo-50 border border-brand-brown rounded-xl text-center text-xs font-bold text-indigo-900 animate-pulse">
                      {uploadProgress}
                    </div>
                  )}

                  <div className="border-t border-brand-brown/30 mt-4 pt-3 text-[10px] text-brand-brown/50 font-bold leading-relaxed space-y-1">
                    <p>💡 檔案將直接存入您 Google Drive 帳號底下專屬於本應用的資料夾：</p>
                    <p className="font-mono text-brand-brown/80">「哆咪音樂坊-雲端教材與備份」</p>
                    <p>家長與小老師亦可在手機端直接查閱這些教材樂譜！</p>
                  </div>
                </div>
              </div>

              {/* Right Side: Listed Material files in Drive */}
              <div className="lg:col-span-7">
                <div className="sketchy-card bg-white p-5 min-h-[380px]">
                  <div className="flex justify-between items-center border-b-2 border-brand-brown pb-3 mb-4">
                    <h4 className="font-black text-md flex items-center gap-1.5">
                      <FolderOpen className="w-5 h-5 text-indigo-950" />
                      <span>雲端教材檔案庫</span>
                    </h4>
                    <span className="text-xs bg-indigo-50 border border-indigo-200 text-indigo-950 font-bold px-2 py-0.5 rounded-full">
                      共 {materialFiles.length} 份
                    </span>
                  </div>

                  {loadingDrive ? (
                    <div className="text-center py-20 flex flex-col items-center justify-center">
                      <RefreshCw className="w-6 h-6 text-brand-pink animate-spin mb-2" />
                      <p className="text-xs font-extrabold text-brand-brown/40">讀取雲端樂譜及錄音中...</p>
                    </div>
                  ) : materialFiles.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-brand-brown/20 bg-brand-cream/10 rounded-2xl">
                      <Music className="w-10 h-10 text-brand-brown/20 mx-auto mb-2 animate-bounce" />
                      <p className="text-xs font-black text-brand-brown/60">雲端內目前沒有任何教材或音檔</p>
                      <p className="text-[10px] text-brand-brown/40 mt-1">請使用左側上傳按鈕，以便為小寶貝學員提供備存資料！</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                      {materialFiles.map((file) => (
                        <div key={file.id} className="p-3 border-2 border-brand-brown bg-brand-cream/5 rounded-xl hover:bg-brand-cream/10 transition-all flex items-center justify-between gap-3 text-xs shadow-[1.5px_1.5px_0px_#4A3728]">
                          <div className="flex items-center gap-3 min-w-0">
                            {getFileIcon(file.mimeType)}
                            <div className="min-w-0">
                              <h5 className="font-bold text-brand-brown truncate pr-2 max-w-[220px] md:max-w-[280px]" title={file.name}>
                                {file.name}
                              </h5>
                              <p className="text-[9px] text-brand-brown/40 font-bold mt-0.5">
                                上傳時間: {new Date(file.createdTime).toLocaleString()}
                                {file.size && ` · ${(parseInt(file.size) / 1024).toFixed(1)} KB`}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-1 shrink-0">
                            {file.webViewLink && (
                              <a 
                                href={file.webViewLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="p-1.5 border border-brand-brown bg-white rounded-lg hover:bg-indigo-50 text-indigo-900 shadow-[1px_1px_0px_#4A3728]"
                                title="瀏覽原始檔案"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <button
                              onClick={() => triggerDeleteConfirm(file.id, file.name)}
                              className="p-1.5 border border-brand-brown bg-rose-50 rounded-lg hover:bg-rose-100 text-rose-700 shadow-[1px_1px_0px_#4A3728] cursor-pointer"
                              title="刪除教材"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              </div>

            </div>
          ) : (
            // Backup subtab view
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Side: Backup action block */}
              <div className="lg:col-span-5 space-y-4">
                <div className="sketchy-card bg-rose-50/20 p-5 border-rose-350">
                  <h4 className="font-extrabold text-sm mb-3 text-brand-brown flex items-center gap-1">
                    <Database className="w-4 h-4 text-brand-brown/85 animate-pulse" />
                    <span>打包全校排授課備份</span>
                  </h4>

                  <p className="text-xs text-brand-brown/80 leading-relaxed font-semibold mb-4">
                    備份作業會打包『這部本地瀏覽器』目前快取的全部學員名單、老師名冊、排課紀錄以及琴房使用狀態。
                    接著會自動產生獨立的雲端 `.json` 資料，並放置在您個人的 Google 雲端帳戶下，用作灾難回復或多機同步。
                  </p>

                  <button
                    onClick={handlePerformBackup}
                    disabled={loadingDrive}
                    className="w-full py-3 bg-brand-green hover:bg-emerald-250 text-brand-brown font-extrabold text-sm border-2 border-brand-brown rounded-xl shadow-[3px_3px_0px_#4A3728] active:translate-y-0.5 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Database className="w-4 h-4" />
                    <span>{loadingDrive ? '正在快遞備份至雲端...' : '🚀 打包並一鍵上傳備份'}</span>
                  </button>

                  <div className="border-t border-brand-brown/20 mt-4 pt-4 text-[10px] text-brand-brown/50 leading-relaxed">
                    <p className="font-black text-rose-900 flex items-center gap-1 mb-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                      還原重要說明：
                    </p>
                    <p>
                      進行「系統還原」是極度高危險的操作！
                      還原期間會直接清洗本系統的全部本地資料。
                      請確保每次還原前，已妥善核對對應的系統時間戳記檔案！
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Side: Existing Backup List */}
              <div className="lg:col-span-7">
                <div className="sketchy-card bg-white p-5 min-h-[380px]">
                  <div className="flex justify-between items-center border-b-2 border-brand-brown pb-3 mb-4">
                    <h4 className="font-black text-md flex items-center gap-1.5">
                      <Database className="w-5 h-5 text-indigo-950" />
                      <span>歷史備份檔案盒 (存放在雲端)</span>
                    </h4>
                    <span className="text-xs bg-emerald-50 border border-emerald-200 text-emerald-950 font-bold px-2 py-0.5 rounded-full">
                      共 {backupFiles.length} 盤
                    </span>
                  </div>

                  {loadingDrive ? (
                    <div className="text-center py-20 flex flex-col items-center justify-center">
                      <RefreshCw className="w-6 h-6 text-brand-pink animate-spin mb-2" />
                      <p className="text-xs font-extrabold text-brand-brown/40">搜尋系統備份封包中...</p>
                    </div>
                  ) : backupFiles.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-brand-brown/20 bg-brand-cream/10 rounded-2xl">
                      <CloudDownload className="w-10 h-10 text-brand-brown/20 mx-auto mb-2 animate-bounce" />
                      <p className="text-xs font-black text-brand-brown/60">尚未查到任何系統雲端備份</p>
                      <p className="text-[10px] text-brand-brown/40 mt-1">請利用左側「打包全校排授課備份」產出您的第一盤雲端封裝！</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                      {backupFiles.map((file) => (
                        <div key={file.id} className="p-3 border-2 border-brand-brown bg-emerald-50/10 rounded-xl hover:bg-emerald-50/20 transition-all flex items-center justify-between gap-3 text-xs shadow-[1.5px_1.5px_0px_#4A3728]">
                          <div className="flex items-center gap-3 min-w-0">
                            {getFileIcon(file.mimeType)}
                            <div className="min-w-0">
                              <h5 className="font-extrabold text-teal-900 truncate pr-2 max-w-[220px]" title={file.name}>
                                {file.name}
                              </h5>
                              <p className="text-[10px] text-brand-brown/50 font-semibold mt-0.5">
                                封裝時間: {new Date(file.createdTime).toLocaleString()}
                                {file.size && ` · ${(parseInt(file.size) / 1024).toFixed(1)} KB`}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-1 shrink-0">
                            <button
                              onClick={() => triggerRestoreConfirm(file.id, file.name)}
                              className="px-2.5 py-1.5 border border-brand-brown bg-emerald-100 hover:bg-emerald-200 text-emerald-950 rounded-lg text-[10px] font-black shadow-[1.5px_1.5px_0px_#4A3728] cursor-pointer flex items-center gap-1"
                              title="系統還原為此封裝"
                            >
                              <RefreshCw className="w-3 h-3 text-emerald-950" />
                              <span>還原</span>
                            </button>
                            <button
                              onClick={() => triggerDeleteConfirm(file.id, file.name)}
                              className="p-1.5 border border-brand-brown bg-rose-50 rounded-lg hover:bg-rose-100 text-rose-700 shadow-[1px_1px_0px_#4A3728] cursor-pointer"
                              title="永久刪除備份"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* Implicit confirmation modal box - mandatory per critical instruction */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-brand-cream border-4 border-brand-brown rounded-[24px] shadow-[8px_8px_0px_#4A3728] p-6 relative overflow-hidden animate-in zoom-in-95 duration-200">
            
            <button
              onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
              className="absolute top-4 right-4 p-1 rounded-full border border-brand-brown/40 bg-white hover:bg-slate-50 text-brand-brown/70 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3 mt-1">
              <div className={`p-2 rounded-full border-2 border-brand-brown shadow-[1.5px_1.5px_0px_#4A3728] ${
                confirmModal.type === 'delete' ? 'bg-red-100 text-red-650' : 'bg-amber-100 text-amber-655'
              }`}>
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <h4 className="font-black text-brand-brown text-base leading-snug">
                  {confirmModal.title}
                </h4>
                <p className="text-xs md:text-sm text-brand-brown/80 font-bold leading-relaxed pr-2">
                  {confirmModal.message}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 text-xs pt-4 border-t border-brand-brown/20 mt-4.5">
              <button
                type="button"
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="sketchy-button bg-white hover:bg-slate-50 text-brand-brown px-3 py-1.8 font-bold"
              >
                取消
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className={`sketchy-button text-brand-brown px-4 py-1.8 font-black flex items-center gap-1 cursor-pointer ${
                  confirmModal.type === 'delete' ? 'bg-rose-100 hover:bg-rose-200' : 'bg-amber-100 hover:bg-amber-250'
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
