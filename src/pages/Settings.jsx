import React, { useState, useRef } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ensureUserProfile, updateUserProfile, uploadUserFile } from '@/lib/userProfileService';
import { Label } from '@/components/ui/label';
import { Camera, User, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const { user: authUser } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['userProfile', authUser?.id],
    queryFn: async () => {
      if (!authUser) return null;
      return await ensureUserProfile(authUser.id, authUser.email, authUser.name);
    },
    enabled: !!authUser,
    staleTime: 1000 * 60 * 5,
  });

  const handlePhotoUpload = async (e) => {
    if (!authUser) return;
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileUrl = await uploadUserFile(authUser.id, file, `avatar_${Date.now()}_${file.name}`);
      await updateUserProfile(authUser.id, { avatarUrl: fileUrl, email: authUser.email });
      queryClient.invalidateQueries({ queryKey: ['userProfile', authUser.id] });
      toast.success('Photo updated!');
    } catch (error) {
      toast.error('Unable to upload avatar. Please try again.');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  if (!authUser) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <div className="text-sm text-muted-foreground">Please sign in to view your settings.</div>
      </div>
    );
  }

  if (isLoading) return (
    <div className="flex items-center justify-center h-full py-20">
      <div className="w-6 h-6 border-2 border-muted border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-md mx-auto p-6 pt-10 space-y-8">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Customize your player profile</p>
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-muted border-2 border-border flex items-center justify-center">
            {profile?.avatarUrl ? (
              <img src={profile.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-10 h-10 text-muted-foreground" />
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors"
          >
            {uploading
              ? <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : <Camera className="w-4 h-4 text-white" />
            }
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
        </div>
        <p className="text-xs text-muted-foreground">Tap the camera to upload a photo</p>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label>Email</Label>
        <div className="flex items-center gap-3 bg-muted border border-border rounded-md px-3 py-2.5">
          <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-sm text-foreground">{profile?.email || authUser.email}</span>
        </div>
        <p className="text-xs text-muted-foreground">This is the email you signed in with.</p>
      </div>
    </div>
  );
}