import { BadRequestException } from "@nestjs/common";
import { FileValidationPipe } from "./file-validation.pipe";

describe("FileValidationPipe", () => {
  const pipe = new FileValidationPipe();

  it("rejects missing files", () => {
    expect(() => pipe.transform(undefined)).toThrow(BadRequestException);
  });

  it("rejects oversized files", () => {
    expect(() =>
      pipe.transform({
        size: 26 * 1024 * 1024,
        mimetype: "image/png",
        originalname: "large.png",
      } as Express.Multer.File),
    ).toThrow("file exceeds 25MB.");
  });

  it("rejects disallowed mime types", () => {
    expect(() =>
      pipe.transform({
        size: 100,
        mimetype: "application/x-msdownload",
        originalname: "malware.exe",
      } as Express.Multer.File),
    ).toThrow("file type is not allowed.");
  });

  it("rejects disallowed extensions", () => {
    expect(() =>
      pipe.transform({
        size: 100,
        mimetype: "image/png",
        originalname: "avatar.svg",
      } as Express.Multer.File),
    ).toThrow("file extension is not allowed.");
  });

  it("accepts valid image uploads", () => {
    const file = pipe.transform({
      size: 100,
      mimetype: "image/png",
      originalname: "avatar.png",
    } as Express.Multer.File);

    expect(file.originalname).toBe("avatar.png");
  });
});
