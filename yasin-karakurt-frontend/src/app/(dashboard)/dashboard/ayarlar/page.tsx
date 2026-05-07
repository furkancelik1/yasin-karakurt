'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Camera, Save, Loader2, Eye, EyeOff, ArrowLeft, X } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  profile?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    phone?: string;
    fitnessGoal?: string;
  };
}

interface ProfileForm {
  firstName: string;
  lastName: string;
  phone: string;
  fitnessGoal: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function AyarlarPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<ProfileForm>({
    firstName: '',
    lastName: '',
    phone: '',
    fitnessGoal: '',
  });
  const [passwordData, setPasswordData] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: res } = await api.get<{ success: boolean; data: UserProfile }>('/users/profile');
        if (res.success && res.data) {
          setProfile(res.data);
          setFormData({
            firstName: res.data.profile?.firstName || '',
            lastName: res.data.profile?.lastName || '',
            phone: res.data.profile?.phone || '',
            fitnessGoal: res.data.profile?.fitnessGoal || '',
          });
        }
      } catch (error) {
        console.error('Profil çekme hatası:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.patch('/users/profile', formData);
      toast.success('Profil güncellendi!');
    } catch (error) {
      toast.error('Güncelleme sırasında hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
  
  const isPasswordValid = (password: string) => PASSWORD_REGEX.test(password);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordData.currentPassword) {
      toast.error('Mevcut şifrenizi girin.');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Yeni şifreler eşleşmiyor.');
      return;
    }

    if (!isPasswordValid(passwordData.newPassword)) {
      toast.error('Şifre en az 8 karakter, bir büyük harf ve bir rakam içermelidir.');
      return;
    }

    setChangingPassword(true);

    try {
      await api.put('/users/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Şifreniz başarıyla güncellendi!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Şifre değiştirme sırasında hata oluştu.';
      toast.error(message);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleAvatarUpload = async () => {
    const fileInput = fileRef.current;
    if (!fileInput?.files?.length) return;
    const file = fileInput.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Lütfen bir görsel dosyası seçin.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Görsel 5MB\'dan küçük olmalıdır.');
      return;
    }

    setUploadingAvatar(true);

    try {
      const formDataImg = new FormData();
      formDataImg.append('avatar', file);

      const { data: res } = await api.patch<{ success: boolean; data: { avatarUrl: string } }>('/users/profile-image', formDataImg, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.success && res.data?.avatarUrl) {
        setProfile(prev => prev ? { ...prev, profile: { ...prev.profile!, avatarUrl: res.data.avatarUrl } } : null);
        toast.success('Fotoğraf güncellendi!');
      }
      
      setPreviewUrl(null);
      fileInput.value = '';
    } catch (error) {
      console.error('Fotoğraf yükleme hatası:', error);
      toast.error('Fotoğraf yükleme sırasında hata oluştu.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const cancelAvatarUpload = () => {
    setPreviewUrl(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div className="w-8 h-8 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
      </div>
    );
  }

  const initials = `${formData.firstName?.[0] || ''}${formData.lastName?.[0] || ''}`.toUpperCase();
  const currentAvatarUrl = previewUrl || profile?.profile?.avatarUrl;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <header className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-3 rounded-xl border border-white/10 hover:border-gold/30 text-ash/60 hover:text-gold">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-display text-white uppercase flex items-center gap-2">
            <User size={24} className="text-gold" /> Hesap Ayarları
          </h1>
          <p className="text-ash/50 text-sm mt-1">Profilini yönet ve şifreni değiştir</p>
        </div>
      </header>

      <form onSubmit={handleProfileSubmit} className="space-y-6">
        <div className="bg-charcoal/40 border border-white/5 rounded-2xl p-6">
          <h2 className="text-sm font-bold text-white uppercase mb-6 flex items-center gap-2">
            <User size={16} className="text-gold" /> Profil Bilgileri
          </h2>

          <div className="flex items-center gap-6 mb-6">
            <div className="relative group">
              <div className="w-28 h-28 rounded-full bg-charcoal border-2 border-gold/30 overflow-hidden flex items-center justify-center relative">
                {currentAvatarUrl ? (
                  <img src={currentAvatarUrl} alt="Profil" className="w-full h-full object-cover" />
                ) : initials ? (
                  <span className="text-3xl font-bold text-gold">{initials}</span>
                ) : (
                  <User size={36} className="text-ash/50" />
                )}
                
                <AnimatePresence>
                  {previewUrl && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 flex items-center justify-center gap-2">
                      <button type="button" onClick={handleAvatarUpload} disabled={uploadingAvatar} className="p-2 rounded-full bg-emerald-500 text-black hover:bg-emerald-400">
                        {uploadingAvatar ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      </button>
                      <button type="button" onClick={cancelAvatarUpload} className="p-2 rounded-full bg-rose-500 text-white hover:bg-rose-400">
                        <X size={16} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {!previewUrl && (
                <button type="button" onClick={() => fileRef.current?.click()} className="absolute bottom-0 right-0 p-2.5 rounded-full bg-gold text-black hover:bg-white shadow-lg">
                  <Camera size={16} />
                </button>
              )}
              
              <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarSelect} className="hidden" />
            </div>
            
            <div className="flex-1">
              <p className="text-white font-medium text-lg">{formData.firstName} {formData.lastName}</p>
              <p className="text-ash/50 text-sm">{profile?.email}</p>
              <p className="text-ash/40 text-xs mt-2">
                {profile?.profile?.avatarUrl ? 'Fotoğrafı değiştirmek için kameraya tıklayın' : 'Profil fotoğrafı eklemek için kameraya tıklayın'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-ash/70 text-xs font-bold uppercase mb-2 block">İsim</label>
              <input type="text" value={formData.firstName} onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))} className="w-full bg-charcoal/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold/50 outline-none" />
            </div>
            <div>
              <label className="text-ash/70 text-xs font-bold uppercase mb-2 block">Soyisim</label>
              <input type="text" value={formData.lastName} onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))} className="w-full bg-charcoal/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold/50 outline-none" />
            </div>
          </div>

          <div className="mt-4">
            <label className="text-ash/70 text-xs font-bold uppercase mb-2 block">E-posta</label>
            <input type="email" value={profile?.email || ''} disabled className="w-full bg-charcoal/20 border border-white/5 rounded-xl px-4 py-3 text-ash/50 cursor-not-allowed" />
          </div>

          <div className="mt-4">
            <label className="text-ash/70 text-xs font-bold uppercase mb-2 block">Telefon</label>
            <input type="tel" value={formData.phone} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} placeholder="Telefon numaranız" className="w-full bg-charcoal/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold/50 outline-none" />
          </div>

          <button type="submit" disabled={saving} className="mt-6 w-full py-3 rounded-xl bg-gold text-black font-bold uppercase hover:bg-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Kaydet</>}
          </button>
        </div>
      </form>

      <div className="bg-charcoal/40 border border-white/5 rounded-2xl p-6">
        <h2 className="text-sm font-bold text-white uppercase mb-6 flex items-center gap-2">
          <Lock size={16} className="text-gold" /> Şifre Değiştir
        </h2>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="relative">
            <label className="text-ash/70 text-xs font-bold uppercase mb-2 block">Eski Şifre</label>
            <input type={showCurrentPassword ? 'text' : 'password'} value={passwordData.currentPassword} onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))} placeholder="Mevcut şifreniz" className="w-full bg-charcoal/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold/50 outline-none pr-12" />
            <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-4 top-9 text-ash/50 hover:text-white">
              {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="relative">
            <label className="text-ash/70 text-xs font-bold uppercase mb-2 block">Yeni Şifre</label>
            <input 
              type={showPassword ? 'text' : 'password'} 
              value={passwordData.newPassword} 
              onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))} 
              placeholder="Yeni şifreniz" 
              className={`w-full bg-charcoal/60 border rounded-xl px-4 py-3 text-white focus:border-gold/50 outline-none pr-12 ${
                passwordData.newPassword && !isPasswordValid(passwordData.newPassword) 
                  ? 'border-rose-500/50' 
                  : 'border-white/10'
              }`} 
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-9 text-ash/50 hover:text-white">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            {passwordData.newPassword && !isPasswordValid(passwordData.newPassword) && (
              <p className="text-rose-400 text-xs mt-1">Şifre en az 8 karakter, bir büyük harf ve bir rakam içermelidir</p>
            )}
          </div>

          <div>
            <label className="text-ash/70 text-xs font-bold uppercase mb-2 block">Yeni Şifre (Tekrar)</label>
            <input 
              type={showPassword ? 'text' : 'password'} 
              value={passwordData.confirmPassword} 
              onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))} 
              placeholder="Yeni şifrenizi tekrar girin" 
              className={`w-full bg-charcoal/60 border rounded-xl px-4 py-3 text-white focus:border-gold/50 outline-none ${
                passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword
                  ? 'border-rose-500/50'
                  : 'border-white/10'
              }`} 
            />
            {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
              <p className="text-rose-400 text-xs mt-1">Şifreler eşleşmiyor</p>
            )}
          </div>

          <button 
            type="submit" 
            disabled={
              changingPassword || 
              !passwordData.currentPassword || 
              !passwordData.newPassword || 
              !passwordData.confirmPassword ||
              !isPasswordValid(passwordData.newPassword) ||
              passwordData.newPassword !== passwordData.confirmPassword
            } 
            className="mt-4 w-full py-3 rounded-xl bg-gold text-black font-bold uppercase hover:bg-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {changingPassword ? <Loader2 size={18} className="animate-spin" /> : <><Lock size={18} /> Şifre Değiştir</>}
          </button>
        </form>
      </div>
    </div>
  );
}