import { motion } from 'framer-motion';
import { Bell, CheckCheck, AlertTriangle, Info, CheckCircle, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { timeAgo } from '../utils/constants';
import { Notification } from '../types';

const TYPE_STYLES: Record<Notification['type'], { icon: React.ReactNode; bg: string; border: string }> = {
  critical: { icon: <AlertTriangle size={16} className="text-[#FF4057]" />, bg: 'bg-[#FF4057]/5', border: 'border-[#FF4057]/20' },
  warning: { icon: <AlertTriangle size={16} className="text-[#FF9F43]" />, bg: 'bg-orange-500/5', border: 'border-orange-500/20' },
  info: { icon: <Info size={16} className="text-[#35D9FF]" />, bg: 'bg-[#35D9FF]/5', border: 'border-[#35D9FF]/20' },
  success: { icon: <CheckCircle size={16} className="text-[#20C997]" />, bg: 'bg-[#20C997]/5', border: 'border-[#20C997]/20' },
};

export function NotificationsPage() {
  const { state, dispatch, unreadCount } = useApp();

  const markAllRead = () => dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' });

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Bell size={24} className="text-[#FF9F43]" /> Notifications
          </h1>
          {unreadCount > 0 && (
            <p className="text-[#35D9FF] text-sm">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="btn-cyan text-sm flex items-center gap-2 py-2">
            <CheckCheck size={15} /> Mark All Read
          </button>
        )}
      </motion.div>

      <div className="space-y-3">
        {state.notifications.length === 0 && (
          <div className="glass-card p-16 text-center">
            <Bell size={40} className="text-white/10 mx-auto mb-3" />
            <p className="text-white/40">No notifications yet</p>
          </div>
        )}
        {state.notifications.map((n, i) => {
          const style = TYPE_STYLES[n.type];
          return (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`glass-card p-4 border ${style.border} ${style.bg} ${!n.read ? 'ring-1 ring-inset ring-white/5' : 'opacity-70'}`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex-shrink-0">{style.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-white font-semibold text-sm">{n.title}</span>
                    {!n.read && <div className="w-2 h-2 bg-[#35D9FF] rounded-full flex-shrink-0" />}
                  </div>
                  <p className="text-white/60 text-sm">{n.message}</p>
                  <div className="text-white/30 text-xs mt-1">{timeAgo(n.createdAt)}</div>
                </div>
                <button
                  onClick={() => dispatch({ type: 'MARK_NOTIFICATION_READ', payload: n.id })}
                  className="p-1 hover:bg-white/5 rounded text-white/30 hover:text-white transition-colors flex-shrink-0"
                >
                  <CheckCheck size={14} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
