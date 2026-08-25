export const PROFILE_PHOTO_BUCKET = "profile-photos" as const;
export const PROFILE_PHOTO_MAX_BYTES = 5 * 1024 * 1024;

export const PROFILE_PHOTO_KINDS = ["jpeg", "png", "webp"] as const;
export type ProfilePhotoKind = (typeof PROFILE_PHOTO_KINDS)[number];

const KIND_META: Record<ProfilePhotoKind, { ext: string; mime: string }> = {
  jpeg: { ext: "jpg", mime: "image/jpeg" },
  png: { ext: "png", mime: "image/png" },
  webp: { ext: "webp", mime: "image/webp" },
};

export type ProfilePhotoValidation =
  | { ok: true; kind: ProfilePhotoKind; ext: string; mime: string; bytes: Uint8Array }
  | { ok: false; error: string };

export function detectProfilePhotoKind(bytes: Uint8Array): ProfilePhotoKind | null {
  if (bytes.length < 12) {
    return null;
  }

  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "jpeg";
  }

  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return "png";
  }

  const isRiff = bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46;
  const isWebp = bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;
  if (isRiff && isWebp) {
    return "webp";
  }

  return null;
}

export function profilePhotoObjectPath(userId: string, ext: string) {
  const safeUserId = userId.replace(/[^a-zA-Z0-9-]/g, "");
  const safeExt = ext.replace(/[^a-z0-9]/g, "");
  if (!safeUserId || !safeExt) {
    throw new Error("Invalid profile photo path.");
  }
  return `${safeUserId}/profile.${safeExt}`;
}

export function isOwnedProfilePhotoPath(userId: string, path: string | null | undefined): path is string {
  if (typeof path !== "string" || !path) {
    return false;
  }
  const safeUserId = userId.replace(/[^a-zA-Z0-9-]/g, "");
  if (!safeUserId || path.includes("..") || path.startsWith("/")) {
    return false;
  }
  return (
    path === `${safeUserId}/profile.jpg`
    || path === `${safeUserId}/profile.png`
    || path === `${safeUserId}/profile.webp`
  );
}

export function profilePhotoPublicUrl(supabaseUrl: string, path: string | null | undefined): string | null {
  if (typeof path !== "string" || !path || path.includes("..") || path.startsWith("/")) {
    return null;
  }

  const base = supabaseUrl.trim().replace(/\/$/, "");
  if (!base) {
    return null;
  }

  return `${base}/storage/v1/object/public/${PROFILE_PHOTO_BUCKET}/${path}`;
}

export async function validateProfilePhotoFile(file: File): Promise<ProfilePhotoValidation> {
  if (!(file instanceof File) || file.size <= 0) {
    return { ok: false, error: "Choose a profile photo to upload." };
  }

  if (file.size > PROFILE_PHOTO_MAX_BYTES) {
    return { ok: false, error: "Profile photos must be 5 MB or smaller." };
  }

  const buffer = new Uint8Array(await file.arrayBuffer());
  const kind = detectProfilePhotoKind(buffer);
  if (!kind) {
    return { ok: false, error: "Use a JPEG, PNG, or WebP image." };
  }

  const meta = KIND_META[kind];
  return { ok: true, kind, ext: meta.ext, mime: meta.mime, bytes: buffer };
}

/**
 * After a failed profile DB update, only roll back storage when the upload wrote a
 * brand-new object path. Same-path upserts must not delete the object the DB still references.
 */
export function shouldRollbackUploadedPhoto(
  uploadedPath: string | null | undefined,
  previousPath: string | null | undefined,
): uploadedPath is string {
  return Boolean(uploadedPath) && uploadedPath !== previousPath;
}
