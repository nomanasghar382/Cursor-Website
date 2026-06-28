import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../../database/prisma.service";

@Injectable()
export class CouponsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findActiveByCode(code: string) {
    return this.prisma.coupon.findFirst({
      where: {
        code: code.toUpperCase(),
        deletedAt: null,
        status: "ACTIVE",
        startsAt: { lte: new Date() },
        OR: [{ endsAt: null }, { endsAt: { gte: new Date() } }],
      },
    });
  }

  countRedemptions(couponId: string, userId?: string) {
    return this.prisma.couponRedemption.count({
      where: {
        couponId,
        ...(userId ? { userId } : {}),
      },
    });
  }
}

@Injectable()
export class CouponsService {
  constructor(private readonly couponsRepository: CouponsRepository) {}

  async validate(code: string, userId: string, subtotal: number, shippingTotal: number) {
    const coupon = await this.couponsRepository.findActiveByCode(code);
    if (!coupon) {
      throw new BadRequestException("Coupon code is invalid or expired.");
    }

    const totalRedemptions = await this.couponsRepository.countRedemptions(coupon.id);
    if (coupon.usageLimit && totalRedemptions >= coupon.usageLimit) {
      throw new BadRequestException("Coupon usage limit has been reached.");
    }

    const userRedemptions = await this.couponsRepository.countRedemptions(coupon.id, userId);
    if (coupon.perUserLimit && userRedemptions >= coupon.perUserLimit) {
      throw new BadRequestException("You have already used this coupon.");
    }

    const discount = this.calculateDiscount(coupon.discountType, Number(coupon.discountValue), subtotal, shippingTotal);

    return {
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: Number(coupon.discountValue),
      },
      discountAmount: discount.amount,
      shippingDiscount: discount.shippingDiscount,
      message: discount.message,
      aiSuggestion: coupon.code === "NOVAEXVIP20" ? "VIP launch savings unlocked for your premium cart." : undefined,
    };
  }

  calculateDiscount(type: string, value: number, subtotal: number, shippingTotal: number) {
    switch (type) {
      case "PERCENTAGE":
        return {
          amount: Number(((subtotal * value) / 100).toFixed(2)),
          shippingDiscount: 0,
          message: `${value}% discount applied`,
        };
      case "FIXED_AMOUNT":
        return {
          amount: Math.min(value, subtotal),
          shippingDiscount: 0,
          message: `$${value.toFixed(2)} discount applied`,
        };
      case "FREE_SHIPPING":
        return {
          amount: 0,
          shippingDiscount: shippingTotal,
          message: "Free shipping applied",
        };
      default:
        return { amount: 0, shippingDiscount: 0, message: "No discount applied" };
    }
  }
}
