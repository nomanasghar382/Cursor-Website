import { Body, Controller, Delete, Get, Param, Patch, Post, Query, VERSION_NEUTRAL } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Permissions } from "../../../common/decorators/permissions.decorator";
import {
  BulkProductActionDto,
  CreateBrandDto,
  CreateCategoryDto,
  CreateProductDto,
  PaginationQueryDto,
  UpdateProductDto,
} from "../dto/admin.dto";
import { AdminCatalogService } from "../services/admin-domain.service";

@ApiTags("Admin Catalog")
@ApiBearerAuth()
@Controller({ path: "admin/catalog", version: ["1", VERSION_NEUTRAL] })
export class AdminCatalogController {
  constructor(private readonly catalogService: AdminCatalogService) {}

  @Get("products")
  @Permissions("products:read")
  listProducts(@Query() query: PaginationQueryDto) {
    return this.catalogService.listProducts(query);
  }

  @Get("products/:id")
  @Permissions("products:read")
  getProduct(@Param("id") id: string) {
    return this.catalogService.getProduct(id);
  }

  @Post("products")
  @Permissions("products:write")
  createProduct(@Body() dto: CreateProductDto) {
    return this.catalogService.createProduct(dto);
  }

  @Patch("products/:id")
  @Permissions("products:write")
  updateProduct(@Param("id") id: string, @Body() dto: UpdateProductDto) {
    return this.catalogService.updateProduct(id, dto);
  }

  @Delete("products/:id")
  @Permissions("products:write")
  deleteProduct(@Param("id") id: string) {
    return this.catalogService.deleteProduct(id);
  }

  @Post("products/bulk")
  @Permissions("products:write")
  bulkAction(@Body() dto: BulkProductActionDto) {
    return this.catalogService.bulkProductAction(dto);
  }

  @Get("categories")
  @Permissions("products:read")
  listCategories() {
    return this.catalogService.listCategories();
  }

  @Post("categories")
  @Permissions("products:write")
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.catalogService.createCategory(dto);
  }

  @Get("brands")
  @Permissions("products:read")
  listBrands() {
    return this.catalogService.listBrands();
  }

  @Post("brands")
  @Permissions("products:write")
  createBrand(@Body() dto: CreateBrandDto) {
    return this.catalogService.createBrand(dto);
  }

  @Get("collections")
  @Permissions("products:read")
  listCollections() {
    return this.catalogService.listCollections();
  }

  @Get("inventory")
  @Permissions("products:read")
  listInventory(@Query() query: PaginationQueryDto) {
    return this.catalogService.listInventory(query);
  }
}
