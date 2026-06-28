import { Body, Controller, Delete, Get, Param, Patch, Post, VERSION_NEUTRAL } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../../../common/decorators/public.decorator";
import { CurrentUser } from "../../../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../../../common/types/authenticated-user.type";
import { AddWishlistItemDto, CreateWishlistDto } from "../dto/wishlist.dto";
import { WishlistService } from "../services/wishlist.service";

@ApiTags("Wishlist")
@Controller({ path: "wishlists", version: ["1", VERSION_NEUTRAL] })
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.wishlistService.list(user.id);
  }

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateWishlistDto) {
    return this.wishlistService.create(user.id, dto);
  }

  @Get(":id")
  getById(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.wishlistService.getById(user.id, id);
  }

  @Post("items")
  addItem(@CurrentUser() user: AuthenticatedUser, @Body() dto: AddWishlistItemDto & { wishlistId?: string }) {
    return this.wishlistService.addItem(user.id, dto.wishlistId, dto);
  }

  @Delete("items/:itemId")
  removeItem(@CurrentUser() user: AuthenticatedUser, @Param("itemId") itemId: string) {
    return this.wishlistService.removeItem(user.id, itemId);
  }

  @Post(":id/share")
  share(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.wishlistService.share(user.id, id);
  }

  @Public()
  @Get("shared/:token")
  getShared(@Param("token") token: string) {
    return this.wishlistService.getShared(token);
  }
}
