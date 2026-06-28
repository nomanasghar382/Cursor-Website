import { Body, Controller, Get, Param, Patch, Post, Query, VERSION_NEUTRAL } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Permissions } from "../../../common/decorators/permissions.decorator";
import { ExportReportDto, PaginationQueryDto, UpdateFeatureFlagDto, UpdateSettingDto } from "../dto/admin.dto";
import { AdminPlatformService } from "../services/admin-domain.service";

@ApiTags("Admin Platform")
@ApiBearerAuth()
@Controller({ path: "admin/platform", version: ["1", VERSION_NEUTRAL] })
export class AdminPlatformController {
  constructor(private readonly platformService: AdminPlatformService) {}

  @Get("roles")
  @Permissions("users:read")
  listRoles() {
    return this.platformService.listRoles();
  }

  @Get("permissions")
  @Permissions("users:read")
  listPermissions() {
    return this.platformService.listPermissions();
  }

  @Get("admins")
  @Permissions("users:read")
  listAdmins(@Query() query: PaginationQueryDto) {
    return this.platformService.listAdmins(query);
  }

  @Get("audit-logs")
  @Permissions("settings:read")
  listAuditLogs(@Query() query: PaginationQueryDto) {
    return this.platformService.listAuditLogs(query);
  }

  @Get("activity-logs")
  @Permissions("settings:read")
  listActivityLogs(@Query() query: PaginationQueryDto) {
    return this.platformService.listActivityLogs(query);
  }

  @Get("security-logs")
  @Permissions("settings:read")
  listSecurityLogs(@Query() query: PaginationQueryDto) {
    return this.platformService.listSecurityLogs(query);
  }

  @Get("feature-flags")
  @Permissions("settings:read")
  listFeatureFlags() {
    return this.platformService.listFeatureFlags();
  }

  @Patch("feature-flags/:key")
  @Permissions("settings:write")
  updateFeatureFlag(@Param("key") key: string, @Body() dto: UpdateFeatureFlagDto) {
    return this.platformService.updateFeatureFlag(key, dto);
  }

  @Get("settings")
  @Permissions("settings:read")
  listSettings() {
    return this.platformService.listSettings();
  }

  @Post("settings")
  @Permissions("settings:write")
  updateSetting(@Body() dto: UpdateSettingDto) {
    return this.platformService.updateSetting(dto);
  }

  @Get("languages")
  @Permissions("settings:read")
  listLanguages() {
    return this.platformService.listLanguages();
  }

  @Get("currencies")
  @Permissions("settings:read")
  listCurrencies() {
    return this.platformService.listCurrencies();
  }

  @Get("taxes")
  @Permissions("settings:read")
  listTaxRates() {
    return this.platformService.listTaxRates();
  }

  @Get("shipping-zones")
  @Permissions("settings:read")
  listShippingZones() {
    return this.platformService.listShippingZones();
  }

  @Get("payment-methods")
  @Permissions("settings:read")
  listPaymentMethods() {
    return this.platformService.listPaymentMethods();
  }

  @Post("reports/export")
  @Permissions("analytics:read")
  exportReport(@Body() dto: ExportReportDto) {
    return this.platformService.exportReport(dto);
  }
}
