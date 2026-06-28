import { Body, Controller, Get, Param, Patch, Query, VERSION_NEUTRAL } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Permissions } from "../../../common/decorators/permissions.decorator";
import { PaginationQueryDto, UpdateCustomerStatusDto, UpdateOrderStatusDto, UpdateVendorStatusDto } from "../dto/admin.dto";
import { AdminOperationsService } from "../services/admin-domain.service";

@ApiTags("Admin Operations")
@ApiBearerAuth()
@Controller({ path: "admin", version: ["1", VERSION_NEUTRAL] })
export class AdminOperationsController {
  constructor(private readonly operationsService: AdminOperationsService) {}

  @Get("orders")
  @Permissions("orders:read")
  listOrders(@Query() query: PaginationQueryDto) {
    return this.operationsService.listOrders(query);
  }

  @Get("orders/:id")
  @Permissions("orders:read")
  getOrder(@Param("id") id: string) {
    return this.operationsService.getOrder(id);
  }

  @Patch("orders/:id/status")
  @Permissions("orders:write")
  updateOrderStatus(@Param("id") id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.operationsService.updateOrderStatus(id, dto);
  }

  @Get("customers")
  @Permissions("users:read")
  listCustomers(@Query() query: PaginationQueryDto) {
    return this.operationsService.listCustomers(query);
  }

  @Get("customers/:id")
  @Permissions("users:read")
  getCustomer(@Param("id") id: string) {
    return this.operationsService.getCustomer(id);
  }

  @Patch("customers/:id/status")
  @Permissions("users:write")
  updateCustomerStatus(@Param("id") id: string, @Body() dto: UpdateCustomerStatusDto) {
    return this.operationsService.updateCustomerStatus(id, dto);
  }

  @Get("vendors")
  @Permissions("vendors:read")
  listVendors(@Query() query: PaginationQueryDto) {
    return this.operationsService.listVendors(query);
  }

  @Get("vendors/:id")
  @Permissions("vendors:read")
  getVendor(@Param("id") id: string) {
    return this.operationsService.getVendor(id);
  }

  @Patch("vendors/:id/status")
  @Permissions("vendors:write")
  updateVendorStatus(@Param("id") id: string, @Body() dto: UpdateVendorStatusDto) {
    return this.operationsService.updateVendorStatus(id, dto);
  }
}
