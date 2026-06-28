import { Body, Controller, Delete, Get, Param, Patch, Post, VERSION_NEUTRAL } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../../../common/types/authenticated-user.type";
import { AddCartItemDto, SaveForLaterDto, SyncCartDto, UpdateCartItemDto } from "../dto/cart.dto";
import { CartService } from "../services/cart.service";

@ApiTags("Cart")
@Controller({ path: "cart", version: ["1", VERSION_NEUTRAL] })
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@CurrentUser() user: AuthenticatedUser) {
    return this.cartService.getCart(user.id);
  }

  @Post("items")
  addItem(@CurrentUser() user: AuthenticatedUser, @Body() dto: AddCartItemDto) {
    return this.cartService.addItem(user.id, dto);
  }

  @Patch("items/:variantId")
  updateItem(
    @CurrentUser() user: AuthenticatedUser,
    @Param("variantId") variantId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(user.id, variantId, dto);
  }

  @Delete("items/:variantId")
  removeItem(@CurrentUser() user: AuthenticatedUser, @Param("variantId") variantId: string) {
    return this.cartService.removeItem(user.id, variantId);
  }

  @Post("sync")
  syncCart(@CurrentUser() user: AuthenticatedUser, @Body() dto: SyncCartDto) {
    return this.cartService.syncCart(user.id, dto);
  }

  @Post("save-for-later")
  saveForLater(@CurrentUser() user: AuthenticatedUser, @Body() dto: SaveForLaterDto) {
    return this.cartService.saveForLater(user.id, dto);
  }

  @Post("saved/:variantId/move-to-cart")
  moveSavedToCart(@CurrentUser() user: AuthenticatedUser, @Param("variantId") variantId: string) {
    return this.cartService.moveSavedToCart(user.id, variantId);
  }

  @Delete()
  clearCart(@CurrentUser() user: AuthenticatedUser) {
    return this.cartService.clearCart(user.id);
  }
}
