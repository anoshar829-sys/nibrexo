export const AVATAR_IDS = ["av-01", "av-02", "av-03", "av-04", "av-05", "av-06", "av-07", "av-08", "av-09", "av-10"] as const;
export type AvatarId = (typeof AVATAR_IDS)[number];
export const DEFAULT_AVATAR_ID: AvatarId = "av-01";
export function isAvatarId(value: unknown): value is AvatarId {
  return typeof value === "string" && (AVATAR_IDS as readonly string[]).includes(value);
}
export function avatarSrc(id: AvatarId) {
  return `/assets/avatars/${id}.svg`;
}
