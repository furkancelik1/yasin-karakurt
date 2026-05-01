import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAllCheckins = async (req: Request, res: Response) => {
  try {
    // Check-inleri gönderilme tarihine (submittedAt) göre en yeniden en eskiye sıralıyoruz
    const checkins = await prisma.checkIn.findMany({
      orderBy: {
        submittedAt: "desc", // "createdAt" yerine şemandaki "submittedAt" kullanıldı
      },
      include: {
        // User tablosunu ve onun içindeki Profile tablosunu çekiyoruz
        user: {
          select: {
            id: true,
            email: true, // User modelinde sadece email var, onu alıyoruz
            profile: {    // İsim bilgisi Profile tablosunda olduğu için onu da include ediyoruz
              select: {
                firstName: true,
                lastName: true,
                avatarUrl: true, // İstersen profil fotoğrafını da çekebilirsin
              }
            }
          },
        },
        photos: true, // Şemandaki CheckInPhoto ilişkisi
      },
    });

    res.status(200).json({
      success: true,
      data: checkins,
    });
  } catch (error) {
    console.error("Check-inler çekilirken hata oluştu:", error);
    res.status(500).json({
      success: false,
      message: "Check-in verileri alınırken sunucu hatası oluştu.",
    });
  }
};