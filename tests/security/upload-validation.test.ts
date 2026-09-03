import { describe, it, expect } from "vitest";

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "model/gltf-binary"]);
function validateUpload(file: { mimeType: string; size: number; filename: string }) {
  if (!ALLOWED_MIME.has(file.mimeType)) return { valid: false, reason: "INVALID_MIME" };
  if (file.size > 20 * 1024 * 1024) return { valid: false, reason: "TOO_LARGE" };
  if (file.filename.includes("..") || file.filename.includes("/")) return { valid: false, reason: "INVALID_FILENAME" };
  return { valid: true };
}

describe("File Upload Security", () => {
  it("allows safe files", () => {
    expect(validateUpload({ mimeType: "image/jpeg", size: 1000, filename: "test.jpg" }).valid).toBe(true);
  });
  it("rejects dangerous files", () => {
    expect(validateUpload({ mimeType: "application/x-httpd-php", size: 1000, filename: "shell.php" }).valid).toBe(false);
  });
  it("rejects path traversal", () => {
    expect(validateUpload({ mimeType: "image/jpeg", size: 1000, filename: "../etc/passwd" }).valid).toBe(false);
  });
});
