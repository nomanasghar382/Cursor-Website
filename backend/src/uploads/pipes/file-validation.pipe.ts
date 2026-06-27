import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "model/gltf-binary", "application/octet-stream"]);
const MAX_BYTES = 25 * 1024 * 1024;

@Injectable()
export class FileValidationPipe implements PipeTransform<Express.Multer.File | undefined, Express.Multer.File> {
  transform(file?: Express.Multer.File): Express.Multer.File {
    if (!file) {
      throw new BadRequestException("file is required.");
    }

    if (file.size > MAX_BYTES) {
      throw new BadRequestException("file exceeds 25MB.");
    }

    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException("file type is not allowed.");
    }

    return file;
  }
}
