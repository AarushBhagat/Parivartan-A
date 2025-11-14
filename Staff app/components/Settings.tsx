import { useState } from 'react';
import { User, DEPARTMENTS } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { 
  User as UserIcon, 
  Bell, 
  LogOut,
  Save,
  Mail,
  Phone,
  Hash,
  Building2
} from 'lucide-react';

interface SettingsProps {
  user: User;
  onLogout: () => void;
  onUpdateProfile: (updates: Partial<User>) => void;
}

export function Settings({ user, onLogout, onUpdateProfile }: SettingsProps) {
  const [name, setName] = useState(user.name);
  const [contact, setContact] = useState(user.contact);
  
  const [notificationSettings, setNotificationSettings] = useState({
    newAssignment: true,
    deadlineReminder: true,
    citizenComment: true,
    statusUpdate: false,
  });

  const handleSaveProfile = () => {
    onUpdateProfile({ name, contact });
    // Show success message
    alert('Profile updated successfully!');
  };

  return (
    <div className="space-y-4">
      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <UserIcon className="w-5 h-5" />
            Profile Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </Label>
            <Input
              id="email"
              value={user.email}
              disabled
              className="bg-gray-50"
            />
            <p className="text-xs text-gray-500">Email cannot be changed</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="staffId" className="flex items-center gap-2">
              <Hash className="w-4 h-4" />
              Staff ID
            </Label>
            <Input
              id="staffId"
              value={user.staffId}
              disabled
              className="bg-gray-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Department
            </Label>
            <Input
              id="department"
              value={DEPARTMENTS[user.department]}
              disabled
              className="bg-gray-50 text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Contact Number
            </Label>
            <Input
              id="contact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
          </div>

          <Button onClick={handleSaveProfile} className="w-full bg-blue-600 hover:bg-blue-700">
            <Save className="w-4 h-4 mr-2" />
            Save Profile
          </Button>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">New Issue Assignment</p>
              <p className="text-xs text-gray-500">Get notified when a new issue is assigned</p>
            </div>
            <Switch
              checked={notificationSettings.newAssignment}
              onCheckedChange={(checked) =>
                setNotificationSettings({ ...notificationSettings, newAssignment: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Deadline Reminders</p>
              <p className="text-xs text-gray-500">Receive reminders about upcoming deadlines</p>
            </div>
            <Switch
              checked={notificationSettings.deadlineReminder}
              onCheckedChange={(checked) =>
                setNotificationSettings({ ...notificationSettings, deadlineReminder: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Citizen Comments</p>
              <p className="text-xs text-gray-500">Get notified of citizen comments on your issues</p>
            </div>
            <Switch
              checked={notificationSettings.citizenComment}
              onCheckedChange={(checked) =>
                setNotificationSettings({ ...notificationSettings, citizenComment: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Status Updates</p>
              <p className="text-xs text-gray-500">Receive updates on issue status changes</p>
            </div>
            <Switch
              checked={notificationSettings.statusUpdate}
              onCheckedChange={(checked) =>
                setNotificationSettings({ ...notificationSettings, statusUpdate: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Logout */}
      <Card>
        <CardContent className="pt-6">
          <Button 
            onClick={onLogout} 
            variant="destructive" 
            className="w-full"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </CardContent>
      </Card>

      {/* App Info */}
      <div className="text-center text-xs text-gray-500 pb-4">
        <p>Civic Issue Reporter v1.0.0</p>
        <p className="mt-1">© 2025 City Government</p>
      </div>
    </div>
  );
}
