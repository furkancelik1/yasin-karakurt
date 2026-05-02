import { Request, Response } from "express";
import { PrismaClient, CheckInStatus } from "@prisma/client";

const prisma = new PrismaClient();

const checkinInclude = {
  user: {
    select: {
      id: true,
      email: true,
      profile: {
        select: {
          firstName: true,
          lastName: true,
          avatarUrl: true,
        },
      },
    },
  },
  photos: true,
};

export const getAllCheckins = async (req: Request, res: Response) => {
  try {
    const checkins = await prisma.checkIn.findMany({
      orderBy: { submittedAt: "desc" },
      include: checkinInclude,
    });

    res.status(200).json({ success: true, data: checkins });
  } catch (error) {
    console.error("Check-inler çekilirken hata oluştu:", error);
    res.status(500).json({ success: false, message: "Sunucu hatası." });
  }
};

export const getCheckinById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const checkin = await prisma.checkIn.findUnique({
      where: { id },
      include: checkinInclude,
    });

    if (!checkin) {
      return res.status(404).json({ success: false, message: "Check-in bulunamadı." });
    }

    // Aynı kullanıcının bir önceki check-in'ini getir (kıyaslama için)
    const previousCheckin = await prisma.checkIn.findFirst({
      where: {
        userId: checkin.userId,
        submittedAt: { lt: checkin.submittedAt },
      },
      orderBy: { submittedAt: "desc" },
      include: { photos: true },
    });

    res.status(200).json({
      success: true,
      data: { checkin, previousCheckin },
    });
  } catch (error) {
    console.error("Check-in detayı çekilirken hata:", error);
    res.status(500).json({ success: false, message: "Sunucu hatası." });
  }
};

export const updateCheckinStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body as { status: CheckInStatus };

    const validStatuses: CheckInStatus[] = ["PENDING", "REVIEWED", "COMPLETED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Geçersiz statü değeri." });
    }

    const updated = await prisma.checkIn.update({
      where: { id },
      data: {
        status,
        reviewedAt: status === "REVIEWED" || status === "COMPLETED" ? new Date() : undefined,
      },
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error("Statü güncellenirken hata:", error);
    res.status(500).json({ success: false, message: "Sunucu hatası." });
  }
};