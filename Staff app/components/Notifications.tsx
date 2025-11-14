import { Notification } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Bell, Clock, MessageSquare, AlertCircle, CheckCircle2 } from 'lucide-react';

interface NotificationsProps {
  notifications: Notification[];
  onViewIssue: (issueId: string) => void;
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
}

export function Notifications({ 
  notifications, 
  onViewIssue, 
  onMarkAsRead,
  onMarkAllAsRead 
}: NotificationsProps) {
  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'assignment':
        return <Bell className="w-5 h-5 text-blue-600" />;
      case 'deadline':
        return <Clock className="w-5 h-5 text-orange-600" />;
      case 'comment':
        return <MessageSquare className="w-5 h-5 text-green-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </p>
            </div>
            {unreadCount > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={onMarkAllAsRead}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Mark all read
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-2">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`cursor-pointer transition-all ${
                !notification.read 
                  ? 'border-l-4 border-l-blue-600 bg-blue-50 hover:bg-blue-100' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => {
                if (!notification.read) {
                  onMarkAsRead(notification.id);
                }
                if (notification.issueId) {
                  onViewIssue(notification.issueId);
                }
              }}
            >
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-sm">{notification.title}</h4>
                      {!notification.read && (
                        <Badge variant="default" className="bg-blue-600 text-xs">New</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{notification.message}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(notification.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="pt-6 text-center py-12 text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No notifications</p>
              <p className="text-sm mt-1">You're all caught up!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
