import { Issue } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { MapPin, Navigation, AlertCircle } from 'lucide-react';

interface MapViewProps {
  issues: Issue[];
  onViewIssue: (issueId: string) => void;
  userId: string;
  userRole: 'admin' | 'field-staff';
}

export function MapView({ issues, onViewIssue, userId, userRole }: MapViewProps) {
  const assignedIssues = userRole === 'field-staff' 
    ? issues.filter(issue => issue.assignedTo === userId && issue.status !== 'resolved')
    : issues.filter(issue => issue.status !== 'resolved');

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending': 'bg-orange-500',
      'acknowledged': 'bg-blue-500',
      'in-progress': 'bg-blue-600',
      'resolved': 'bg-green-600',
      'cannot-resolve': 'bg-red-600'
    };
    return colors[status] || 'bg-gray-500';
  };

  const openInMaps = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Map Container */}
      <Card>
        <CardContent className="p-0">
          <div className="relative bg-gray-100 h-64 rounded-lg overflow-hidden">
            {/* Mock Map Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50">
              {/* Grid pattern to simulate map */}
              <div className="absolute inset-0" 
                   style={{
                     backgroundImage: 'linear-gradient(rgba(0,0,0,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.05) 1px, transparent 1px)',
                     backgroundSize: '20px 20px'
                   }}>
              </div>
            </div>

            {/* Issue Pins */}
            {assignedIssues.slice(0, 5).map((issue, index) => (
              <div
                key={issue.id}
                className={`absolute ${getStatusColor(issue.status)} w-8 h-8 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform`}
                style={{
                  left: `${20 + index * 15}%`,
                  top: `${30 + (index % 3) * 20}%`,
                }}
                onClick={() => onViewIssue(issue.id)}
              >
                <MapPin className="w-5 h-5 text-white" />
              </div>
            ))}

            {/* Legend */}
            <div className="absolute bottom-3 left-3 bg-white rounded-lg p-2 shadow-md text-xs space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span>Pending</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                <span>In Progress</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {userRole === 'field-staff' ? 'My Assigned Issues' : 'All Active Issues'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-3">
            Showing {assignedIssues.length} active issue{assignedIssues.length !== 1 ? 's' : ''} on map
          </p>
          <Button 
            onClick={() => {
              if (assignedIssues.length > 0) {
                openInMaps(assignedIssues[0].location.lat, assignedIssues[0].location.lng);
              }
            }}
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={assignedIssues.length === 0}
          >
            <Navigation className="w-4 h-4 mr-2" />
            Open in Google Maps
          </Button>
        </CardContent>
      </Card>

      {/* Issue List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Issues on Map</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {assignedIssues.length > 0 ? (
            assignedIssues.map((issue) => (
              <div
                key={issue.id}
                className="border rounded-lg p-3 space-y-2 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => onViewIssue(issue.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(issue.status)}`}></div>
                      <h4 className="truncate text-sm">{issue.title}</h4>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{issue.location.address}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      openInMaps(issue.location.lat, issue.location.lng);
                    }}
                  >
                    <Navigation className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="capitalize bg-gray-100 px-2 py-1 rounded">{issue.category}</span>
                  <Badge variant="outline" className="text-xs">
                    {issue.status.replace('-', ' ')}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No active issues to display</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
