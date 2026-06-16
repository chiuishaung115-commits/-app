import React from 'react';
import { SignNotification } from '../types';
import { Bell, Trash2, CheckCircle2, UserCheck, X, Sparkles, ReceiptText } from 'lucide-react';

interface AlertsContainerProps {
  notifications: SignNotification[];
  isOpen: boolean;
  onClose: () => void;
  onMarkRead: (id: string) => void;
  onClearAll: () => void;
  onTriggerMockAlert: (type: 'student' | 'teacher' | 'tuition') => void;
}

export default function AlertsContainer({
  notifications,
  isOpen,
  onClose,
  onMarkRead,
  onClearAll,
  onTriggerMockAlert
}: AlertsContainerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 bg-black/40 backdrop-blur-xs transition-opacity overflow-y-auto">
      <div className="w-full max-w-md bg-brand-cream border-4 border-brand-brown rounded-[24px] shadow-[8px_8px_0px_#4A3728] p-6 mt-16 md:mr-10 relative overflow-hidden animate-in fade-in slide-in-from-right-10 duration-200">
        
        {/* Cute hand-drawn diagonal banner stripe */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-brand-pink/20 -rotate-45 translate-x-12 -translate-y-12 pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-brand-brown pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-brand-yellow rounded-lg border border-brand-brown">
              <Bell className="w-5 h-5 text-amber-500 animate-swing" />
            </div>
            <div>
              <h3 className="font-extrabold text-xl font-sans text-brand-brown">簽到 & 提醒廣播站</h3>
              <p className="text-xs text-brand-brown/70">線上師生簽到、學費摧繳看板</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-red-100 rounded-full border-2 border-brand-brown bg-white shadow-[1px_1px_0px_#4A3728] transition-transform active:translate-y-0.2"
          >
            <X className="w-4 h-4 text-brand-brown" />
          </button>
        </div>

        {/* Quick Testing sandbox inside notifications */}
        <div className="bg-white border-2 border-brand-brown rounded-xl p-3 mb-4 shadow-[2px_2px_0px_#4A3728]">
          <h4 className="text-xs font-bold text-amber-900 mb-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>互動沙盒：模擬發出提醒</span>
          </h4>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onTriggerMockAlert('student')}
              className="text-[11px] bg-brand-blue/30 border border-brand-brown rounded-lg py-1 px-1 text-center font-bold hover:bg-brand-blue/50 hover:scale-103 transition-transform cursor-pointer"
            >
              🙋‍♂️ 學生簽到
            </button>
            <button
              onClick={() => onTriggerMockAlert('teacher')}
              className="text-[11px] bg-brand-pink/30 border border-brand-brown rounded-lg py-1 px-1 text-center font-bold hover:bg-brand-pink/50 hover:scale-103 transition-transform cursor-pointer"
            >
              🦒 老師簽到
            </button>
            <button
              onClick={() => onTriggerMockAlert('tuition')}
              className="text-[11px] bg-amber-100 border border-brand-brown rounded-lg py-1 px-1 text-center font-bold hover:bg-amber-200 hover:scale-103 transition-transform cursor-pointer"
            >
              💰 學雜摧收
            </button>
          </div>
        </div>

        {/* Operations */}
        <div className="flex items-center justify-between text-xs font-bold mb-3">
          <span className="text-brand-brown/80">總數：{notifications.length} 筆通知</span>
          {notifications.length > 0 && (
            <button
              onClick={onClearAll}
              className="flex items-center gap-1 text-red-500 hover:text-red-700 bg-white border border-brand-brown px-2 py-1 rounded-md shadow-[1px_1px_0px_#4A3728] hover:shadow-[1px_1px_0px_transparent] hover:translate-x-0.2 hover:translate-y-0.2 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>清空紀錄</span>
            </button>
          )}
        </div>

        {/* Notifications list */}
        <div className="max-h-[350px] overflow-y-auto space-y-3 pr-1">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-brand-brown/50 bg-white/50 border border-dashed border-brand-brown/40 rounded-xl">
              <span className="text-4xl block mb-2">🎈</span>
              <p className="text-sm font-bold">目前無新提醒廣播</p>
              <p className="text-xs text-brand-brown/40 mt-1">可以使用上方沙盒模擬觸發</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const bgClass =
                notif.type === 'StudentCheckIn'
                  ? 'bg-brand-blue/15 border-brand-blue'
                  : notif.type === 'TeacherCheckIn'
                  ? 'bg-brand-green/20 border-brand-green'
                  : 'bg-brand-pink/15 border-brand-pink';

              const icon =
                notif.type === 'StudentCheckIn' ? (
                  <UserCheck className="w-4 h-4 text-sky-600" />
                ) : notif.type === 'TeacherCheckIn' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <ReceiptText className="w-4 h-4 text-red-500" />
                );

              return (
                <div
                  id={`notif-card-${notif.id}`}
                  key={notif.id}
                  className={`border-2 border-brand-brown rounded-xl p-3 shadow-[2px_2px_0px_#4A3728] flex flex-col justify-between gap-1 transition-all ${bgClass} ${
                    notif.read ? 'opacity-65' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex gap-2 items-start">
                      <div className="mt-0.5">{icon}</div>
                      <div>
                        <p className="text-xs font-semibold text-brand-brown leading-relaxed">
                          {notif.message}
                        </p>
                        <span className="text-[10px] font-bold text-orange-950/60 block mt-1">
                          時間: {notif.time}
                        </span>
                      </div>
                    </div>

                    {!notif.read && (
                      <button
                        onClick={() => onMarkRead(notif.id)}
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded border border-brand-brown bg-emerald-100 hover:bg-emerald-250 shrink-0 text-brand-brown transition-transform active:translate-y-0.2"
                        title="標記已讀"
                      >
                        已讀
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        <div className="mt-4 border-t border-brand-brown/40 pt-3 text-center">
          <p className="text-[10px] text-brand-brown/50">
            🔔 提示：當學生或老師在『師生線上簽到處』簽到時，右上方鈴鐺會即時閃動。
          </p>
        </div>

      </div>
    </div>
  );
}
