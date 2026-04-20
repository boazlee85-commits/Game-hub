import React, { useRef } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PIECES, PIECE_ORDER, getPieceEmoji } from '@/lib/strategoEngine';
import { ensureUserProfile, updateUserProfile, uploadUserFile } from '@/lib/userProfileService';
import { Camera, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Pieces() {
  const { user: authUser } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const uploadingRef = useRef(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['userProfile', authUser?.id],
    queryFn: async () => {
      if (!authUser) return null;
      return await ensureUserProfile(authUser.id, authUser.email, authUser.name);
    },
    enabled: !!authUser,
    staleTime: 1000 * 60 * 5,
  });

  const pieceImages = profile?.pieceImages || {};

  const handleUpload = async (pieceKey, file) => {
    if (!authUser || !file) return;
    uploadingRef.current = pieceKey;
    queryClient.setQueryData(['userProfile', authUser.id], prev => ({ ...prev, _uploading: pieceKey }));

    try {
      const fileUrl = await uploadUserFile(authUser.id, file, `piece_${pieceKey}_${Date.now()}_${file.name}`);
      const newPieceImages = { ...pieceImages, [pieceKey]: fileUrl };
      await updateUserProfile(authUser.id, { pieceImages: newPieceImages });
      queryClient.invalidateQueries({ queryKey: ['userProfile', authUser.id] });
      toast.success(`${PIECES[pieceKey].name} image updated!`);
    } catch (error) {
      toast.error('Unable to upload piece image. Please try again.');
      console.error(error);
    } finally {
      uploadingRef.current = null;
    }
  };

  if (!authUser) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-sm text-muted-foreground">Please sign in to upload piece images.</div>
      </div>
    );
  }

  if (isLoading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-muted border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-6 pt-10 space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Piece Images</h1>
        <p className="text-sm text-muted-foreground mt-1">Upload a custom image for each piece. Tap a piece to change its photo.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {PIECE_ORDER.map(key => {
          const piece = PIECES[key];
          const imgUrl = pieceImages[key];
          const isUploading = profile?._uploading === key;

          return (
            <PieceCard
              key={key}
              pieceKey={key}
              piece={piece}
              imgUrl={imgUrl}
              isUploading={isUploading}
              onUpload={handleUpload}
            />
          );
        })}
      </div>
    </div>
  );
}

function PieceCard({ pieceKey, piece, imgUrl, isUploading, onUpload }) {
  const inputRef = useRef(null);

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col items-center gap-3">
      <button
        onClick={() => inputRef.current?.click()}
        className="relative w-20 h-20 rounded-full overflow-hidden bg-muted border-2 border-border hover:border-primary transition-colors group"
      >
        {imgUrl ? (
          <img src={imgUrl} alt={piece.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl">
            {getPieceEmoji(pieceKey)}
          </div>
        )}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          {isUploading
            ? <Loader2 className="w-6 h-6 text-white animate-spin" />
            : <Camera className="w-6 h-6 text-white" />
          }
        </div>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onUpload(pieceKey, e.target.files[0])}
      />
      <div className="text-center">
        <div className="font-semibold text-sm text-foreground">{piece.name}</div>
        <div className="text-xs text-muted-foreground">Rank {piece.rank}</div>
      </div>
    </div>
  );
}