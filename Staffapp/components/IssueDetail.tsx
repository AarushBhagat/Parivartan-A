import { useState } from 'react';
import { Issue, UserRole, DEPARTMENTS } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  MapPin, 
  Calendar, 
  User, 
  Phone, 
  MessageSquare,
  Navigation,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Camera,
  ArrowLeft,
  Building2
} from 'lucide-react';

interface IssueDetailProps {
  issue: Issue;
  userRole: UserRole;
  onBack: () => void;
  onUpdateStatus: (issueId: string, status: string, comment: string, reason?: string) => void;
}

export function IssueDetail({ issue, userRole, onBack, onUpdateStatus }: IssueDetailProps) {
  const [updateComment, setUpdateComment] = useState('');
  const [cannotResolveReason, setCannotResolveReason] = useState('');
  const [showReasonInput, setShowReasonInput] = useState(false);

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

  const handleStatusUpdate = (newStatus: string) => {
    if (newStatus === 'cannot-resolve') {
      setShowReasonInput(true);
    } else {
      onUpdateStatus(issue.id, newStatus, updateComment);
      setUpdateComment('');
    }
  };

  const handleCannotResolve = () => {
    if (cannotResolveReason.trim()) {
      onUpdateStatus(issue.id, 'cannot-resolve', updateComment, cannotResolveReason);
      setUpdateComment('');
      setCannotResolveReason('');
      setShowReasonInput(false);
    }
  };

  const openInMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${issue.location.lat},${issue.location.lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h2 className="truncate">{issue.title}</h2>
          <p className="text-sm text-gray-500">Issue ID: {issue.id}</p>
        </div>
      </div>

      {/* Status and Priority */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Status</p>
              {getStatusBadge(issue.status)}
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">Priority</p>
              <div className="flex items-center gap-1 justify-end">
                {issue.priority === 'high' && <AlertCircle className="w-4 h-4 text-red-600" />}
                {issue.priority === 'medium' && <Clock className="w-4 h-4 text-orange-600" />}
                {issue.priority === 'low' && <TrendingUp className="w-4 h-4 text-gray-400" />}
                <span className="capitalize">{issue.priority}</span>
              </div>
            </div>
          </div>
          {issue.upvotes > 0 && (
            <div className="mt-3 pt-3 border-t flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>{issue.upvotes} citizens upvoted this issue</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700">{issue.description}</p>
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-start gap-2 text-sm">
              <Building2 className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <span className="text-gray-600">Department: </span>
                <span className="text-gray-900">{DEPARTMENTS[issue.category]}</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-600">Reported On</span>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Location</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
            <span className="text-sm">{issue.location.address}</span>
          </div>
          <div className="bg-gray-100 rounded-lg h-32 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Map Preview</p>
              <p className="text-xs">Lat: {issue.location.lat}, Lng: {issue.location.lng}</p>
            </div>
          </div>
          <Button onClick={openInMaps} className="w-full bg-blue-600 hover:bg-blue-700">
            <Navigation className="w-4 h-4 mr-2" />
            Get Directions
          </Button>
        </CardContent>
      </Card>

      {/* Photos */}
      {issue.photos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Photos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {issue.photos.map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt={`Issue photo ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reporter Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Reporter Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-600" />
            <span>{issue.reporter.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-600" />
            <span>{issue.reporter.contact}</span>
          </div>
        </CardContent>
      </Card>

      {/* Comments */}
      {issue.comments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Comments & Updates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {issue.comments.map((comment) => (
              <div key={comment.id} className="border-l-2 border-blue-600 pl-3 py-1">
                <div className="flex items-center gap-2 mb-1">
                  <MessageSquare className="w-3 h-3 text-gray-600" />
                  <span className="text-sm">{comment.author}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(comment.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{comment.text}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Resolved Photos */}
      {issue.resolvedPhotos && issue.resolvedPhotos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resolution Photos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {issue.resolvedPhotos.map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt={`Resolution photo ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Update Status - Field Staff Only */}
      {userRole === 'field-staff' && issue.status !== 'resolved' && issue.status !== 'cannot-resolve' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Update Issue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="update-comment">Work Update</Label>
              <Textarea
                id="update-comment"
                placeholder="Describe the work done or current status..."
                value={updateComment}
                onChange={(e) => setUpdateComment(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Upload Photos</Label>
              <Button variant="outline" className="w-full" type="button">
                <Camera className="w-4 h-4 mr-2" />
                Take or Upload Photo
              </Button>
            </div>

            {!showReasonInput ? (
              <div className="grid grid-cols-2 gap-2">
                {issue.status === 'pending' && (
                  <Button
                    onClick={() => handleStatusUpdate('acknowledged')}
                    variant="outline"
                    className="w-full"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Acknowledge
                  </Button>
                )}
                
                {(issue.status === 'pending' || issue.status === 'acknowledged') && (
                  <Button
                    onClick={() => handleStatusUpdate('in-progress')}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Start Work
                  </Button>
                )}

                {issue.status === 'in-progress' && (
                  <>
                    <Button
                      onClick={() => handleStatusUpdate('resolved')}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Mark Resolved
                    </Button>
                    <Button
                      onClick={() => handleStatusUpdate('cannot-resolve')}
                      variant="destructive"
                      className="w-full"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Cannot Resolve
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Cannot Resolve</Label>
                <Textarea
                  id="reason"
                  placeholder="Explain why this issue cannot be resolved..."
                  value={cannotResolveReason}
                  onChange={(e) => setCannotResolveReason(e.target.value)}
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleCannotResolve}
                    variant="destructive"
                    className="flex-1"
                    disabled={!cannotResolveReason.trim()}
                  >
                    Submit
                  </Button>
                  <Button
                    onClick={() => {
                      setShowReasonInput(false);
                      setCannotResolveReason('');
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
