import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "node:stream";

@Injectable()
export class StorageService {
  constructor(configService: ConfigService) {
    cloudinary.config({
      cloud_name: configService.getOrThrow<string>("cloudinary.cloudName"),
      api_key: configService.getOrThrow<string>("cloudinary.apiKey"),
      api_secret: configService.getOrThrow<string>("cloudinary.apiSecret"),
      secure: true,
    });
  }

  uploadBuffer(file: Express.Multer.File, folder: string) {
    return new Promise<{ publicId: string; secureUrl: string; bytes: number; format: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "auto",
          use_filename: false,
          unique_filename: true,
          overwrite: false,
          transformation: file.mimetype.startsWith("image/")
            ? [{ quality: "auto", fetch_format: "auto" }]
            : undefined,
        },
        (error, result) => {
          if (error || !result) {
            reject(error ?? new Error("Cloudinary upload failed."));
            return;
          }

          resolve({
            publicId: result.public_id,
            secureUrl: result.secure_url,
            bytes: result.bytes,
            format: result.format,
          });
        },
      );

      Readable.from(file.buffer).pipe(uploadStream);
    });
  }
}
