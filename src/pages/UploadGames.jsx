import React, { useState } from 'react';
import { gameStorage } from '@/lib/gameStorage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle2, KeyRound, Link as LinkIcon, Lock, Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { AnimatePresence, motion } from 'framer-motion';

const PASSWORD_KEY = 'gamehub_upload_password';
const DEFAULT_PASSWORD = '0424';

export default function UploadGames() {
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [success, setSuccess] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const getStoredPassword = () => localStorage.getItem(PASSWORD_KEY) || DEFAULT_PASSWORD;

  const handleUnlock = () => {
    if (passwordInput === getStoredPassword()) {
      setUnlocked(true);
      setPasswordError(false);
      return;
    }

    setPasswordError(true);
    setPasswordInput('');
  };

  const handleChangePassword = () => {
    if (!newPassword.trim()) return;

    if (newPassword !== confirmPassword) {
      toast({ title: 'Passwords do not match', variant: 'destructive' });
      return;
    }

    localStorage.setItem(PASSWORD_KEY, newPassword);
    toast({ title: 'Password changed' });
    setChangingPassword(false);
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleUpload = () => {
    if (!title.trim() || !link.trim()) return;

    try {
      gameStorage.saveGame({ title: title.trim(), link: link.trim() });
      setTitle('');
      setLink('');
      setSuccess(true);
      toast({ title: 'Game uploaded' });
      window.setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      toast({
        title: 'Failed to upload game',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (!unlocked) {
    return (
      <div className="space-y-8">
        <header>
          <h1 className="font-heading text-[44px] font-bold leading-tight tracking-normal text-foreground md:text-5xl">
            Upload Games
          </h1>
          <p className="mt-2 text-xl font-medium text-muted-foreground">
            This section is password protected
          </p>
        </header>

        <div className="max-w-[420px] space-y-5 rounded-[18px] border border-border bg-card p-8">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15">
              <Lock className="h-7 w-7 text-primary" />
            </div>
            <p className="font-heading text-lg font-semibold text-foreground">Enter Password</p>
          </div>

          <Input
            type="password"
            placeholder="Password"
            value={passwordInput}
            onChange={(event) => {
              setPasswordInput(event.target.value);
              setPasswordError(false);
            }}
            onKeyDown={(event) => event.key === 'Enter' && handleUnlock()}
            className={`h-12 rounded-xl border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-primary ${
              passwordError ? 'border-destructive focus-visible:ring-destructive' : ''
            }`}
          />
          {passwordError && (
            <p className="-mt-2 text-sm text-destructive">Incorrect password</p>
          )}
          <Button
            onClick={handleUnlock}
            className="h-12 w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Unlock
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-[44px] font-bold leading-tight tracking-normal text-foreground md:text-5xl">
            Upload Games
          </h1>
          <p className="mt-2 text-xl font-medium text-muted-foreground">
            Add a game link and it will stay saved until you delete it
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setChangingPassword(!changingPassword)}
          className="h-11 gap-2 rounded-xl border-border bg-card text-foreground hover:bg-secondary"
        >
          <KeyRound className="h-4 w-4" />
          Change Password
        </Button>
      </header>

      <AnimatePresence>
        {changingPassword && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-[540px] space-y-4 rounded-[18px] border border-border bg-card p-5"
          >
            <p className="font-medium text-foreground">Change Password</p>
            <Input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="h-11 rounded-xl border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
            />
            <Input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="h-11 rounded-xl border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
            />
            <div className="flex gap-3">
              <Button
                onClick={handleChangePassword}
                className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Save
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setChangingPassword(false);
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className="rounded-xl border-border bg-card text-foreground hover:bg-secondary"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[540px] space-y-5 rounded-[18px] border border-border bg-card p-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground" htmlFor="game-title">
            Game Title
          </label>
          <Input
            id="game-title"
            placeholder="axis and allies"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="h-12 rounded-xl border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground" htmlFor="game-link">
            Game Link
          </label>
          <div className="relative">
            <LinkIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="game-link"
              placeholder="https://example.com/game"
              value={link}
              onChange={(event) => setLink(event.target.value)}
              className="h-12 rounded-xl border-border bg-background pl-11 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
            />
          </div>
        </div>

        <Button
          onClick={handleUpload}
          disabled={!title.trim() || !link.trim()}
          className="h-12 w-full gap-2 rounded-xl bg-primary text-base font-bold text-primary-foreground hover:bg-primary/90"
        >
          <Upload className="h-5 w-5" />
          Upload
        </Button>

        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-sm text-primary"
            >
              <CheckCircle2 className="h-4 w-4" />
              Game uploaded successfully. Check it on the Home page.
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
