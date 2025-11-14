import { User, Issue, DEPARTMENTS } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingUp,
  MapPin,
  Calendar
} from 'lucide-react';

interface DashboardProps {
  user: User;
  issues: Issue[];
  onViewAllIssues: () => void;
  onViewIssue: (issueId: string) => void;
}

export function Dashboard({ user, issues, onViewAllIssues, onViewIssue }: DashboardProps) {
  const assignedIssues = issues.filter(issue => issue.assignedTo === user.id);

  const pendingCount = assignedIssues.filter(i => i.status === 'pending' || i.status === 'acknowledged').length;
  const inProgressCount = assignedIssues.filter(i => i.status === 'in-progress').length;
  const resolvedToday = assignedIssues.filter(i => {
    if (i.status === 'resolved' && i.completionDate) {
      const today = new Date();
      const completionDate = new Date(i.completionDate);
      return completionDate.toDateString() === today.toDateString();
    }
    return false;
  }).length;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", color: string }> = {
      'pending': { variant: 'outline', color: 'text-orange-600 border-orange-600' },
      'acknowledged': { variant: 'secondary', color: 'text-blue-600' },
      'in-progress': { variant: 'default', color: 'bg-blue-600' },
      'resolved': { variant: 'default', color: 'bg-green-600' },
      'cannot-resolve': { variant: 'destructive', color: '' }
    };
    
    const config = variants[status] || variants.pending;
    return (
      <Badge variant={config.variant} className={config.color}>
        {status.replace('-', ' ')}
      </Badge>
    );
  };

  const getPriorityIcon = (priority: string) => {
    if (priority === 'high') return <AlertCircle className="w-4 h-4 text-red-600" />;
    if (priority === 'medium') return <Clock className="w-4 h-4 text-orange-600" />;
    return <TrendingUp className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="space-y-4">
      {/* Profile Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Name:</span>
            <span>{user.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Staff ID:</span>
            <span>{user.staffId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Department:</span>
            <span className="text-xs">{DEPARTMENTS[user.department]}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Contact:</span>
            <span>{user.contact}</span>
          </div>
        </CardContent>
      </Card>

      {/* Today's Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Today's Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl">{resolvedToday}</div>
              <div className="text-xs text-gray-600">Resolved</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl">{inProgressCount}</div>
              <div className="text-xs text-gray-600">In Progress</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-2xl">{pendingCount}</div>
              <div className="text-xs text-gray-600">Pending</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* My Assigned Issues */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">My Assigned Issues</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {assignedIssues.map((issue) => (
            <div
              key={issue.id}
              className="border rounded-lg p-3 space-y-2 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => onViewIssue(issue.id)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getPriorityIcon(issue.priority)}
                    <h4 className="truncate">{issue.title}</h4>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{issue.location.address}</span>
                  </div>
                </div>
                {getStatusBadge(issue.status)}
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="capitalize bg-gray-100 px-2 py-1 rounded">{issue.category}</span>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
          
          {assignedIssues.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No issues assigned</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
