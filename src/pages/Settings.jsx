import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

const PASSWORD_KEY = 'gamehub_upload_password';
const DEFAULT_PASSWORD = '0424';

export default function Settings() {
  const [changingPassword, setChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const getStoredPassword = () => localStorage.getItem(PASSWORD_KEY) || DEFAULT_PASSWORD;

  const handleChangePassword = () => {
    if (!newPassword.trim()) return;
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    localStorage.setItem(PASSWORD_KEY, newPassword);
    toast.success('Password changed!');
    setChangingPassword(false);
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your preferences</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 max-w-lg space-y-6">
        {/* User info */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center">
            <User className="w-7 h-7 text-primary" />
          </div>
          <div>
            <p className="font-heading font-semibold text-foreground text-lg">
              Anonymous User
            </p>
            <p className="text-sm text-muted-foreground">Local account</p>
          </div>
        </div>

        <div className="border-t border-border pt-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Upload Password</p>
                <p className="text-sm text-muted-foreground">Password for uploading games</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setChangingPassword(!changingPassword)}
              >
                {changingPassword ? 'Cancel' : 'Change'}
              </Button>
            </div>

            {changingPassword && (
              <div className="space-y-3 pt-3 border-t border-border">
                <Input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-10"
                />
                <Input
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-10"
                />
                <Button
                  onClick={handleChangePassword}
                  className="w-full h-10"
                  disabled={!newPassword.trim() || !confirmPassword.trim()}
                >
                  <KeyRound className="w-4 h-4 mr-2" />
                  Update Password
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}