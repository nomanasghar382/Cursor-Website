import { createHash } from "crypto";
import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../../database/prisma.service";

@Injectable()
export class GiftCardsService {
  constructor(private readonly prisma: PrismaService) {}

  private hashCode(code: string) {
    return createHash("sha256").update(code.trim().toUpperCase()).digest("hex");
  }

  async validate(code: string, amount: number) {
    const giftCard = await this.prisma.giftCard.findFirst({
      where: {
        codeHash: this.hashCode(code),
        status: "ACTIVE",
        OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
      },
    });

    if (!giftCard) {
      throw new BadRequestException("Gift card is invalid or expired.");
    }

    const balance = Number(giftCard.currentBalance);
    if (balance <= 0) {
      throw new BadRequestException("Gift card has no remaining balance.");
    }

    const appliedAmount = Math.min(balance, amount);
    return {
      giftCardId: giftCard.id,
      appliedAmount,
      remainingBalance: Number((balance - appliedAmount).toFixed(2)),
      currencyCode: giftCard.currencyCode,
    };
  }

  async redeem(giftCardId: string, orderId: string, amount: number) {
    const giftCard = await this.prisma.giftCard.findUnique({ where: { id: giftCardId } });
    if (!giftCard) return;

    const nextBalance = Math.max(0, Number(giftCard.currentBalance) - amount);
    await this.prisma.$transaction([
      this.prisma.giftCard.update({
        where: { id: giftCardId },
        data: {
          currentBalance: nextBalance,
          status: nextBalance === 0 ? "DEPLETED" : "ACTIVE",
        },
      }),
      this.prisma.giftCardTransaction.create({
        data: {
          giftCardId,
          orderId,
          amountDelta: -amount,
          transactionType: "REDEEM",
        },
      }),
    ]);
  }
}
