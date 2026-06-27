import { Controller, Get, VERSION_NEUTRAL } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "./common/decorators/public.decorator";

@ApiTags("App")
@Controller({ path: "", version: VERSION_NEUTRAL })
export class AppController {
  @Public()
  @Get()
  root() {
    return {
      name: "NOVAEX API",
      status: "ready",
      documentation: "/api/docs",
    };
  }
}
