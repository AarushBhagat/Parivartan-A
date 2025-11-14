import { useState } from 'react';
import { Issue, IssueStatus, IssueCategory, DEPARTMENTS } from '../types';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Search, 
  MapPin, 
  Calendar,
  AlertCircle,
  Clock,
  TrendingUp,
  Filter
} from 'lucide-react';

interface IssueListProps {
  issues: Issue[];
  onViewIssue: (issueId: string) => void;
  userRole: 'field-staff';
  userId: string;
}

export function IssueList({ issues, onViewIssue, userRole, userId }: IssueListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority'>('date');
  const [quickFilter, setQuickFilter] = useState<'all' | 'assigned' | 'pending' | 'in-progress'>('all');

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

  const getPriorityIcon = (priority: string, upvotes: number) => {
    if (priority === 'high' || upvotes > 20) return <AlertCircle className="w-4 h-4 text-red-600" />;
    if (priority === 'medium' || upvotes > 10) return <Clock className="w-4 h-4 text-orange-600" />;
    return <TrendingUp className="w-4 h-4 text-gray-400" />;
  };

  const filteredIssues = issues.filter((issue) => {
    // Quick filter
    if (quickFilter === 'assigned' && issue.assignedTo !== userId) return false;
    if (quickFilter === 'pending' && issue.status !== 'pending') return false;
    if (quickFilter === 'in-progress' && issue.status !== 'in-progress') return false;

    // Search filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      issue.title.toLowerCase().includes(searchLower) ||
      issue.location.address.toLowerCase().includes(searchLower) ||
      issue.id.toLowerCase().includes(searchLower);
    
    if (!matchesSearch) return false;

    // Status filter
    if (statusFilter !== 'all' && issue.status !== statusFilter) return false;

    return true;
  });

  const sortedIssues = [...filteredIssues].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] + (a.upvotes / 10);
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] + (b.upvotes / 10);
      return bPriority - aPriority;
    }
  });

  return (
    <div className="space-y-4">
      {/* Quick Filter Tabs */}
      <Tabs value={quickFilter} onValueChange={(v) => setQuickFilter(v as any)} className="w-full">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="assigned">Assigned</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="in-progress">Active</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="search"
          placeholder="Search by location or Issue ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-gray-600" />
            <span className="text-sm">Filters</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="acknowledged">Acknowledged</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Sort by Date</SelectItem>
                <SelectItem value="priority">Sort by Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Issue List */}
      <div className="space-y-3">
        {sortedIssues.map((issue) => (
          <Card
            key={issue.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onViewIssue(issue.id)}
          >
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getPriorityIcon(issue.priority, issue.upvotes)}
                    <h3 className="truncate">{issue.title}</h3>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{issue.location.address}</span>
                  </div>
                </div>
                {getStatusBadge(issue.status)}
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex flex-col gap-1">
                  <span className="text-gray-500">ID: {issue.id}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {issue.upvotes > 0 && (
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <TrendingUp className="w-3 h-3" />
                  <span>{issue.upvotes} upvotes</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {sortedIssues.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center py-12 text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No issues found</p>
              <p className="text-sm mt-1">Try adjusting your filters</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Results Count */}
      {sortedIssues.length > 0 && (
        <div className="text-center text-sm text-gray-500 py-2">
          Showing {sortedIssues.length} of {issues.length} issues
        </div>
      )}
    </div>
  );
}
