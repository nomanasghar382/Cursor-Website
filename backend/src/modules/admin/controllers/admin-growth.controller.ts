import { Body, Controller, Get, Post, Query, VERSION_NEUTRAL } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../../common/decorators/current-user.decorator";
import { Permissions } from "../../../common/decorators/permissions.decorator";
import { AuthenticatedUser } from "../../../common/types/authenticated-user.type";
import { CreateBlogDto, CreateCmsPageDto, CreateCouponDto, CreateGiftCardDto, PaginationQueryDto } from "../dto/admin.dto";
import { AdminGrowthService } from "../services/admin-domain.service";

@ApiTags("Admin Growth")
@ApiBearerAuth()
@Controller({ path: "admin/growth", version: ["1", VERSION_NEUTRAL] })
export class AdminGrowthController {
  constructor(private readonly growthService: AdminGrowthService) {}

  @Get("coupons")
  @Permissions("settings:read")
  listCoupons(@Query() query: PaginationQueryDto) {
    return this.growthService.listCoupons(query);
  }

  @Post("coupons")
  @Permissions("settings:write")
  createCoupon(@Body() dto: CreateCouponDto) {
    return this.growthService.createCoupon(dto);
  }

  @Get("gift-cards")
  @Permissions("settings:read")
  listGiftCards(@Query() query: PaginationQueryDto) {
    return this.growthService.listGiftCards(query);
  }

  @Post("gift-cards")
  @Permissions("settings:write")
  createGiftCard(@Body() dto: CreateGiftCardDto) {
    return this.growthService.createGiftCard(dto);
  }

  @Get("campaigns")
  @Permissions("settings:read")
  listCampaigns() {
    return this.growthService.listCampaigns();
  }

  @Get("banners")
  @Permissions("content:read")
  listBanners() {
    return this.growthService.listBanners();
  }

  @Get("cms/pages")
  @Permissions("content:read")
  listCmsPages(@Query() query: PaginationQueryDto) {
    return this.growthService.listCmsPages(query);
  }

  @Post("cms/pages")
  @Permissions("content:write")
  createCmsPage(@Body() dto: CreateCmsPageDto) {
    return this.growthService.createCmsPage(dto);
  }

  @Get("blogs")
  @Permissions("content:read")
  listBlogs(@Query() query: PaginationQueryDto) {
    return this.growthService.listBlogs(query);
  }

  @Post("blogs")
  @Permissions("content:write")
  createBlog(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateBlogDto) {
    return this.growthService.createBlog(dto, user.id);
  }

  @Get("faqs")
  @Permissions("content:read")
  listFaqs() {
    return this.growthService.listFaqs();
  }
}
