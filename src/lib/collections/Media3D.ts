import path from "path";
import { fileURLToPath } from "url";
import type { CollectionConfig, CollectionBeforeChangeHook } from "payload";
import { adminOnlyAccess } from "@/lib/collections/base-fields";
import appConfig from "@/lib/core/config";
import { CollectionName } from "@/lib/core/types/types";

const GLB_MAX_BYTES = 20 * 1024 * 1024;
const ALLOWED_GLB_MIME = new Set([
  "model/gltf-binary",
  "application/octet-stream",
]);

const validateGlbUpload: CollectionBeforeChangeHook = async ({ req, data }) => {
  const file = (req as any).file;
  if (!file) return data;

  const filename = file.filename || "";
  if (!filename.toLowerCase().endsWith(".glb")) {
    throw new Error("Only .glb files are allowed for 3D models.");
  }

  if (file.mimetype && !ALLOWED_GLB_MIME.has(file.mimetype)) {
    throw new Error(`Unsupported file type: ${file.mimetype}. Only .glb is allowed.`);
  }

  if (typeof file.size === "number" && file.size > GLB_MAX_BYTES) {
    throw new Error("3D model exceeds the 20MB size limit.");
  }

  if (file.data && file.data.length >= 4) {
    const magic = file.data.subarray(0, 4).toString("ascii");
    if (magic !== "glTF") {
      throw new Error("File content does not look like a valid .glb file.");
    }
  }

  return data;
};

export const Media3D: CollectionConfig = {
  slug: CollectionName.media3d,
  admin: { group: "المحتوى" },
  access: {
    ...adminOnlyAccess,
    read: () => true,
  },
  hooks: {
    beforeChange: [validateGlbUpload],
  },
  fields: [{ name: "alt", type: "text", required: true }],
  upload: {
    mimeTypes: ["model/gltf-binary", "application/octet-stream"],
    staticDir: Boolean(appConfig.BLOB_TOKEN)
      ? undefined
      : path.resolve(
          path.dirname(fileURLToPath(import.meta.url)),
          "../../../public/media3d",
        ),
  },
};