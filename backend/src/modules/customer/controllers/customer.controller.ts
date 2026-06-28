import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
  VERSION_NEUTRAL,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiConsumes, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../../../common/types/authenticated-user.type";
import { StorageService } from "../../storage/services/storage.service";
import { FileValidationPipe } from "../../../uploads/pipes/file-validation.pipe";
import { AddressDto, UpdatePreferencesDto, UpdateSettingsDto } from "../dto/customer.dto";
import { CustomerAccountService } from "../services/customer-account.service";
import { CustomerAddressesService } from "../services/customer-addresses.service";
import { CustomerDashboardService } from "../services/customer-dashboard.service";

@ApiTags("Customer")
@ApiBearerAuth()
@Controller({ path: "customer", version: ["1", VERSION_NEUTRAL] })
export class CustomerController {
  constructor(
    private readonly dashboardService: CustomerDashboardService,
    private readonly addressesService: CustomerAddressesService,
    private readonly accountService: CustomerAccountService,
    private readonly storageService: StorageService,
  ) {}

  @Get("dashboard")
  getDashboard(@CurrentUser() user: AuthenticatedUser) {
    return this.dashboardService.getDashboard(user.id);
  }

  @Get("addresses")
  listAddresses(@CurrentUser() user: AuthenticatedUser) {
    return this.addressesService.list(user.id);
  }

  @Post("addresses")
  createAddress(@CurrentUser() user: AuthenticatedUser, @Body() dto: AddressDto) {
    return this.addressesService.create(user.id, dto);
  }

  @Patch("addresses/:id")
  updateAddress(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string, @Body() dto: AddressDto) {
    return this.addressesService.update(user.id, id, dto);
  }

  @Delete("addresses/:id")
  deleteAddress(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.addressesService.remove(user.id, id);
  }

  @Post("addresses/:id/default")
  setDefaultAddress(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.addressesService.setDefault(user.id, id);
  }

  @Get("notifications")
  getNotifications(@CurrentUser() user: AuthenticatedUser) {
    return this.accountService.getNotifications(user.id);
  }

  @Patch("notifications/:id/read")
  markNotificationRead(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.accountService.markRead(user.id, id);
  }

  @Get("preferences")
  getPreferences(@CurrentUser() user: AuthenticatedUser) {
    return this.accountService.getPreferences(user.id);
  }

  @Patch("preferences")
  updatePreferences(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdatePreferencesDto) {
    return this.accountService.updatePreferences(user.id, dto);
  }

  @Get("settings")
  getSettings(@CurrentUser() user: AuthenticatedUser) {
    return this.accountService.getSettings(user.id);
  }

  @Patch("settings")
  updateSettings(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateSettingsDto) {
    return this.accountService.updateSettings(user.id, dto);
  }

  @Get("payments")
  getPayments(@CurrentUser() user: AuthenticatedUser) {
    return this.accountService.getPayments(user.id);
  }

  @Post("avatar")
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("file", { limits: { fileSize: 5 * 1024 * 1024 } }))
  async uploadAvatar(@CurrentUser() user: AuthenticatedUser, @UploadedFile(FileValidationPipe) file: Express.Multer.File) {
    const upload = await this.storageService.uploadBuffer(file, `novaex/avatars/${user.id}`);
    return this.accountService.updateAvatar(user.id, upload.secureUrl);
  }

  @Delete("account")
  deleteAccount(@CurrentUser() user: AuthenticatedUser) {
    return this.accountService.deleteAccount(user.id);
  }
}
