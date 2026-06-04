import React, { useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Camera, Loader2, Mail, User } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfileHeader({ user, onAvatarUpdate }) {
  const fileRef = useRef();
  const [uploading, setUploading] = useState(false);
  const avatar = user?.avatar_url;

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.auth.updateMe({ avatar_url: file_url });
      onAvatarUpdate(file_url);
      toast.success('Avatar updated!');
    } catch {
      toast.error('Failed to upload image');
    }
    setUploading(false);
  };

  const tierColors = {
    bronze: 'from-amber-700 to-amber-500',
    silver: 'from-slate-500 to-slate-300',
    gold: 'from-yellow-600 to-yellow-400',
    platinum: 'from-violet-600 to-violet-400',
  };

  return (
    <div className="flex flex-col items-center py-8">
      {/* Avatar */}
      <div className="relative mb-4">
        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-secondary/40 shadow-lg bg-muted flex items-center justify-center">
          {avatar ? (
            <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <User className="h-10 w-10 text-muted-foreground" />
          )}
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center shadow-md hover:bg-secondary/90 transition-colors"
        >
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>

      <h2 className="font-display text-xl font-bold text-primary">{user?.full_name || 'Guest'}</h2>
      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
        <Mail className="h-3 w-3" /> {user?.email}
      </p>
    </div>
  );
}