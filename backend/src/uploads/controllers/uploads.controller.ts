import { Controller, Post, UploadedFile, UseInterceptors, VERSION_NEUTRAL } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiConsumes, ApiTags } from "@nestjs/swagger";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { StorageService } from "../../modules/storage/services/storage.service";
import { FileValidationPipe } from "../pipes/file-validation.pipe";

@ApiTags("Uploads")
@ApiBearerAuth()
@Controller({ path: "uploads", version: ["1", VERSION_NEUTRAL] })
export class UploadsController {
  constructor(private readonly storageService: StorageService) {}

  @Post("media")
  @Permissions("products:write")
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("file", { limits: { fileSize: 25 * 1024 * 1024 } }))
  uploadMedia(@UploadedFile(FileValidationPipe) file: Express.Multer.File) {
    return this.storageService.uploadBuffer(file, "novaex/uploads");
  }
}
