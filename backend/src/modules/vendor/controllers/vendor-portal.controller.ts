import { Body, Controller, Delete, Get, Param, Patch, Post, Query, VERSION_NEUTRAL } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../../common/decorators/current-user.decorator";
import { Permissions } from "../../../common/decorators/permissions.decorator";
import { AuthenticatedUser } from "../../../common/types/authenticated-user.type";
import {
  AiGenerateDto,
  CreateVendorProductDto,
  PayoutRequestDto,
  UpdateStoreDto,
  UpdateVendorOrderStatusDto,
  UpdateVendorProductDto,
  VendorExportReportDto,
  VendorPaginationQueryDto,
} from "../dto/vendor.dto";
import { VendorPortalService } from "../services/vendor-portal.service";

@ApiTags("Vendor Portal")
@ApiBearerAuth()
@Controller({ path: "vendor", version: ["1", VERSION_NEUTRAL] })
export class VendorPortalController {
  constructor(private readonly vendorService: VendorPortalService) {}

  @Get("dashboard")
  @Permissions("analytics:read")
  dashboard(@CurrentUser() user: AuthenticatedUser, @Query("storeId") storeId?: string) {
    return this.vendorService.getDashboard(user, storeId);
  }

  @Get("dashboard/ai")
  @Permissions("ai:read")
  aiInsights(@CurrentUser() user: AuthenticatedUser, @Query("storeId") storeId?: string) {
    return this.vendorService.getAiInsights(user, storeId);
  }

  @Get("store")
  @Permissions("stores:read")
  getStore(@CurrentUser() user: AuthenticatedUser, @Query("storeId") storeId?: string) {
    return this.vendorService.getStore(user, storeId);
  }

  @Patch("store")
  @Permissions("stores:write")
  updateStore(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateStoreDto, @Query("storeId") storeId?: string) {
    return this.vendorService.updateStore(user, dto, storeId);
  }

  @Get("products")
  @Permissions("products:read")
  listProducts(@CurrentUser() user: AuthenticatedUser, @Query() query: VendorPaginationQueryDto) {
    return this.vendorService.listProducts(user, query);
  }

  @Get("products/:id")
  @Permissions("products:read")
  getProduct(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string, @Query("storeId") storeId?: string) {
    return this.vendorService.getProduct(user, id, storeId);
  }

  @Post("products")
  @Permissions("products:write")
  createProduct(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateVendorProductDto) {
    return this.vendorService.createProduct(user, dto);
  }

  @Patch("products/:id")
  @Permissions("products:write")
  updateProduct(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: UpdateVendorProductDto,
    @Query("storeId") storeId?: string,
  ) {
    return this.vendorService.updateProduct(user, id, dto, storeId);
  }

  @Delete("products/:id")
  @Permissions("products:write")
  deleteProduct(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string, @Query("storeId") storeId?: string) {
    return this.vendorService.deleteProduct(user, id, storeId);
  }

  @Get("inventory")
  @Permissions("products:read")
  listInventory(@CurrentUser() user: AuthenticatedUser, @Query() query: VendorPaginationQueryDto) {
    return this.vendorService.listInventory(user, query);
  }

  @Get("catalog/options")
  @Permissions("products:read")
  catalogOptions() {
    return this.vendorService.listCatalogOptions();
  }

  @Get("orders")
  @Permissions("orders:read")
  listOrders(@CurrentUser() user: AuthenticatedUser, @Query() query: VendorPaginationQueryDto) {
    return this.vendorService.listOrders(user, query);
  }

  @Get("orders/:id")
  @Permissions("orders:read")
  getOrder(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string, @Query("storeId") storeId?: string) {
    return this.vendorService.getOrder(user, id, storeId);
  }

  @Patch("orders/:id/status")
  @Permissions("orders:write")
  updateOrderStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: UpdateVendorOrderStatusDto,
    @Query("storeId") storeId?: string,
  ) {
    return this.vendorService.updateOrderStatus(user, id, dto, storeId);
  }

  @Get("customers")
  @Permissions("orders:read")
  listCustomers(@CurrentUser() user: AuthenticatedUser, @Query() query: VendorPaginationQueryDto) {
    return this.vendorService.listCustomers(user, query);
  }

  @Get("customers/:id")
  @Permissions("orders:read")
  getCustomer(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string, @Query("storeId") storeId?: string) {
    return this.vendorService.getCustomer(user, id, storeId);
  }

  @Get("reviews")
  @Permissions("content:read")
  listReviews(@CurrentUser() user: AuthenticatedUser, @Query("storeId") storeId?: string) {
    return this.vendorService.listReviews(user, storeId);
  }

  @Get("payouts")
  @Permissions("analytics:read")
  getPayouts(@CurrentUser() user: AuthenticatedUser, @Query("storeId") storeId?: string) {
    return this.vendorService.getPayouts(user, storeId);
  }

  @Post("payouts/request")
  @Permissions("analytics:write")
  requestPayout(@CurrentUser() user: AuthenticatedUser, @Body() dto: PayoutRequestDto) {
    return this.vendorService.requestPayout(user, dto.storeId);
  }

  @Get("analytics")
  @Permissions("analytics:read")
  analytics(@CurrentUser() user: AuthenticatedUser, @Query("storeId") storeId?: string) {
    return this.vendorService.getAnalytics(user, storeId);
  }

  @Post("analytics/export")
  @Permissions("analytics:read")
  exportReport(@CurrentUser() user: AuthenticatedUser, @Body() dto: VendorExportReportDto) {
    return this.vendorService.exportReport(user, dto);
  }

  @Post("ai/generate")
  @Permissions("ai:write")
  generateAi(@CurrentUser() user: AuthenticatedUser, @Body() dto: AiGenerateDto) {
    return this.vendorService.generateAiContent(user, dto);
  }
}
