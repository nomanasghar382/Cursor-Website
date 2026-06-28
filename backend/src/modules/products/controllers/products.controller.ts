import { Controller, Get, Param, Query, VERSION_NEUTRAL } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../../../common/decorators/public.decorator";
import { ProductQueryDto } from "../dto/product-query.dto";
import { ProductsService } from "../services/products.service";

@ApiTags("Products")
@Controller({ path: "products", version: ["1", VERSION_NEUTRAL] })
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Public()
  @Get()
  list(@Query() query: ProductQueryDto) {
    return this.productsService.list(query);
  }

  @Public()
  @Get(":id")
  getById(@Param("id") id: string) {
    return this.productsService.getById(id);
  }
}
