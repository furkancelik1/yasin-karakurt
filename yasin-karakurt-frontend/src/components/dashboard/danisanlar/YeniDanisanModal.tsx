"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Loader2, UserPlus } from "lucide-react";

// Form Şeması
const formSchema = z.object({
  firstName: z.string().min(2, "İsim en az 2 karakter olmalı"),
  lastName: z.string().min(2, "Soyisim en az 2 karakter olmalı"),
  email: z.string().email("Geçerli bir e-posta adresi girin"),
  fitnessGoal: z.string().min(1, "Lütfen bir hedef seçin"),
  planType: z.enum(["BASIC", "PREMIUM", "VIP"]),
  password: z.string().min(6, "Geçici şifre en az 6 karakter olmalı"),
});

type FormValues = z.infer<typeof formSchema>;

interface YeniDanisanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const YeniDanisanModal = ({ isOpen, onClose, onSuccess }: YeniDanisanModalProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      planType: "BASIC",
      password: "tempPassword123", // Varsayılan geçici şifre
    }
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      // Backend'deki register rotasına istek atıyoruz
      await api.post("/auth/register", { ...data, role: "CLIENT" });
      
      toast.success(`${data.firstName} başarıyla sisteme eklendi.`);
      reset();
      onSuccess();
      onClose();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Kayıt sırasında bir hata oluştu.";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-zinc-950/90 border-zinc-800 backdrop-blur-xl shadow-[0_0_40px_rgba(139,92,246,0.15)] text-white">
        <DialogHeader>
          <DialogTitle className="text-3xl font-display italic text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-sky-400">
            Yeni Danışan Kaydı
          </DialogTitle>
          <DialogDescription className="text-zinc-500 font-light">
            Sisteme yeni bir başarı hikayesi ekliyorsun.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-zinc-400">Ad</Label>
              <Input id="firstName" {...register("firstName")} className="bg-zinc-900/50 border-zinc-800 focus:border-violet-500/50 transition-all" placeholder="Ahmet" />
              {errors.firstName && <p className="text-xs text-rose-500">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-zinc-400">Soyad</Label>
              <Input id="lastName" {...register("lastName")} className="bg-zinc-900/50 border-zinc-800 focus:border-violet-500/50 transition-all" placeholder="Yılmaz" />
              {errors.lastName && <p className="text-xs text-rose-500">{errors.lastName.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-zinc-400">E-posta</Label>
            <Input id="email" type="email" {...register("email")} className="bg-zinc-900/50 border-zinc-800 focus:border-violet-500/50 transition-all" placeholder="danisan@email.com" />
            {errors.email && <p className="text-xs text-rose-500">{errors.email.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-zinc-400">Üyelik Planı</Label>
              <Select onValueChange={(val: any) => setValue("planType", val)} defaultValue="BASIC">
                <SelectTrigger className="bg-zinc-900/50 border-zinc-800 text-white">
                  <SelectValue placeholder="Seçiniz" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                  <SelectItem value="BASIC">BASIC</SelectItem>
                  <SelectItem value="PREMIUM">PREMIUM</SelectItem>
                  <SelectItem value="VIP">VIP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fitnessGoal" className="text-zinc-400">Hedef</Label>
              <Input id="fitnessGoal" {...register("fitnessGoal")} className="bg-zinc-900/50 border-zinc-800 focus:border-violet-500/50 transition-all" placeholder="Yağ Yakımı" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" title="Danışanın ilk girişte kullanacağı şifre" className="text-zinc-400 flex items-center gap-1">
              Geçici Şifre
            </Label>
            <Input id="password" {...register("password")} className="bg-zinc-900/50 border-zinc-800 focus:border-violet-500/50 transition-all" />
          </div>

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium py-6 rounded-xl transition-all animate-neon-purple-pulse"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <><UserPlus className="mr-2 h-5 w-5" /> Danışanı Kaydet</>}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};