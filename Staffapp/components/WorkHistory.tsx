import { useState } from 'react';
import { Issue } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { MapPin, Calendar, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface WorkHistoryProps {
  issues: Issue[];
  onViewIssue: (issueId: string) => void;
  userRole: 'field-staff';
  userId: string;
}

export function WorkHistory({ issues, onViewIssue, userRole, userId }: WorkHistoryProps) {
  const [dateFilter, setDateFilter] = useState<string>('all');

  const completedIssues = issues.filter(issue => 
    issue.assignedTo === userId && 
    (issue.status === 'resolved' || issue.status === 'cannot-resolve')
  );

  const filteredIssues = completedIssues.filter((issue) => {
    
    if (dateFilter !== 'all' && issue.completionDate) {
      const completionDate = new Date(issue.completionDate);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (dateFilter === 'week' && diffDays > 7) return false;
      if (dateFilter === 'month' && diffDays > 30) return false;
      if (dateFilter === '3months' && diffDays > 90) return false;
    }
    
    return true;
  });

  const stats = {
    total: completedIssues.length,
    resolved: completedIssues.filter(i => i.status === 'resolved').length,
    cannotResolve: completedIssues.filter(i => i.status === 'cannot-resolve').length,
  };

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl">{stats.total}</div>
            <div className="text-xs text-gray-600">Total Completed</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl">{stats.resolved}</div>
            <div className="text-xs text-gray-600">Resolved</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-2xl">{stats.cannotResolve}</div>
            <div className="text-xs text-gray-600">Cannot Resolve</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* History List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Work History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredIssues.length > 0 ? (
            filteredIssues.map((issue) => (
              <div
                key={issue.id}
                className="border rounded-lg p-3 space-y-2 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => onViewIssue(issue.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {issue.status === 'resolved' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <h4 className="truncate text-sm">{issue.title}</h4>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{issue.location.address}</span>
                    </div>
                  </div>
                  <Badge 
                    variant={issue.status === 'resolved' ? 'default' : 'destructive'}
                    className={issue.status === 'resolved' ? 'bg-green-600' : ''}
                  >
                    {issue.status === 'resolved' ? 'Resolved' : 'Cannot Resolve'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="capitalize bg-gray-100 px-2 py-1 rounded">{issue.category}</span>
                  {issue.completionDate && (
                    <div className="flex items-center gap-1 text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>Completed: {new Date(issue.completionDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {issue.comments.length > 0 && (
                  <div className="text-xs text-gray-600 border-t pt-2 mt-2">
                    <p className="line-clamp-1">
                      Latest: {issue.comments[issue.comments.length - 1].text}
                    </p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No completed issues found</p>
              <p className="text-sm mt-1">Try adjusting your filters</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Count */}
      {filteredIssues.length > 0 && (
        <div className="text-center text-sm text-gray-500 py-2">
          Showing {filteredIssues.length} of {completedIssues.length} completed issues
        </div>
      )}
    </div>
  );
}
