import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canOpenAccount,
  canOpenAdmin,
  classifyAccess,
  publicAuthError,
  roleFromProfile,
  signupUserMetadata,
  validateDisplayName,
  validateSignInInput,
  validateSignUpInput,
  type AccessProfile,
} from "./policy.ts";

const customer: AccessProfile = { id: "u1", email: "c@example.com", role: "customer" };
const owner: AccessProfile = { id: "u2", email: "o@example.com", role: "owner" };
const admin: AccessProfile = { id: "u3", email: "a@example.com", role: "admin" };

describe("register/login validation", () => {
  it("rejects empty or invalid sign-in without calling Supabase", () => {
    assert.equal(validateSignInInput("", "secret").ok, false);
    assert.equal(validateSignInInput("not-email", "secret").ok, false);
    assert.equal(validateSignInInput("user@example.com", "").ok, false);
    assert.equal(validateSignInInput("user@example.com", "secret").ok, true);
  });

  it("rejects incomplete registration without calling Supabase", () => {
    assert.equal(
      validateSignUpInput({ name: "", email: "a@b.co", password: "password1", confirm: "password1", terms: "on" }).ok,
      false,
    );
    assert.equal(
      validateSignUpInput({ name: "A", email: "bad", password: "password1", confirm: "password1", terms: "on" }).ok,
      false,
    );
    assert.equal(
      validateSignUpInput({ name: "A", email: "a@b.co", password: "short", confirm: "short", terms: "on" }).ok,
      false,
    );
    assert.equal(
      validateSignUpInput({ name: "A", email: "a@b.co", password: "password1", confirm: "other", terms: "on" }).ok,
      false,
    );
    assert.equal(
      validateSignUpInput({ name: "A", email: "a@b.co", password: "password1", confirm: "password1", terms: "" }).ok,
      false,
    );
    assert.equal(
      validateSignUpInput({ name: "A", email: "a@b.co", password: "password1", confirm: "password1", terms: "on" }).ok,
      true,
    );
  });

  it("never includes a client-supplied role in signup metadata", () => {
    const metadata = signupUserMetadata("Owner Name");
    assert.deepEqual(metadata, { name: "Owner Name" });
    assert.equal("role" in metadata, false);
  });
});

describe("profile identity validation", () => {
  it("accepts a valid display name and rejects blank or oversized names", () => {
    assert.equal(validateDisplayName("  Nibrexo Member  ").ok, true);
    assert.equal(validateDisplayName("   ").ok, false);
    assert.equal(validateDisplayName("x".repeat(81)).ok, false);
  });

  it("accepts jpeg/png/webp bytes and rejects other payloads", async () => {
    const {
      detectProfilePhotoKind,
      isOwnedProfilePhotoPath,
      profilePhotoObjectPath,
      profilePhotoPublicUrl,
      PROFILE_PHOTO_MAX_BYTES,
    } = await import("./profile-photo.ts");

    const jpeg = Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
    const png = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x00]);
    const webp = Uint8Array.from([0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50]);
    const gif = Uint8Array.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);

    assert.equal(detectProfilePhotoKind(jpeg), "jpeg");
    assert.equal(detectProfilePhotoKind(png), "png");
    assert.equal(detectProfilePhotoKind(webp), "webp");
    assert.equal(detectProfilePhotoKind(gif), null);
    assert.equal(detectProfilePhotoKind(new Uint8Array([1, 2, 3])), null);

    assert.equal(profilePhotoObjectPath("user-123", "jpg"), "user-123/profile.jpg");
    assert.equal(isOwnedProfilePhotoPath("user-123", "user-123/profile.jpg"), true);
    assert.equal(isOwnedProfilePhotoPath("user-123", "other-user/profile.jpg"), false);
    assert.equal(isOwnedProfilePhotoPath("user-123", "../user-123/profile.jpg"), false);
    assert.equal(
      profilePhotoPublicUrl("https://example.supabase.co", "user-123/profile.jpg"),
      "https://example.supabase.co/storage/v1/object/public/profile-photos/user-123/profile.jpg",
    );
    assert.equal(profilePhotoPublicUrl("", "user-123/profile.jpg"), null);
    assert.equal(PROFILE_PHOTO_MAX_BYTES, 5 * 1024 * 1024);
  });

  it("does not roll back same-path uploads after a failed profile save", async () => {
    const { shouldRollbackUploadedPhoto } = await import("./profile-photo.ts");

    // Same-extension replace: object already overwrote previousPath; do not delete it.
    assert.equal(
      shouldRollbackUploadedPhoto("user-123/profile.jpg", "user-123/profile.jpg"),
      false,
    );
    // New upload or different-extension replace: safe to remove the orphan object.
    assert.equal(shouldRollbackUploadedPhoto("user-123/profile.png", "user-123/profile.jpg"), true);
    assert.equal(shouldRollbackUploadedPhoto("user-123/profile.jpg", null), true);
    assert.equal(shouldRollbackUploadedPhoto(null, "user-123/profile.jpg"), false);
    assert.equal(shouldRollbackUploadedPhoto(null, null), false);
  });

  it("does not expose role as profile-edit input", () => {
    const profileInput = { display_name: "Member", avatar_path: "user-1/profile.jpg", remove_photo: "0" };
    assert.equal("role" in profileInput, false);
  });
});

describe("server-side authorization", () => {
  it("treats missing or expired identity as guest", () => {
    assert.equal(classifyAccess(null).status, "guest");
    assert.equal(canOpenAccount(null), false);
    assert.equal(canOpenAdmin(null), false);
  });

  it("allows customers into /account and denies /admin", () => {
    assert.equal(classifyAccess(customer).status, "customer");
    assert.equal(canOpenAccount(customer), true);
    assert.equal(canOpenAdmin(customer), false);
  });

  it("allows owner and admin into /admin", () => {
    assert.equal(canOpenAdmin(owner), true);
    assert.equal(canOpenAdmin(admin), true);
  });

  it("ignores unknown or client-shaped role values", () => {
    assert.equal(roleFromProfile("owner"), "owner");
    assert.equal(roleFromProfile("admin"), "admin");
    assert.equal(roleFromProfile("customer"), "customer");
    assert.equal(roleFromProfile("superadmin"), "customer");
    assert.equal(roleFromProfile({ role: "owner" }), "customer");
    assert.equal(roleFromProfile(undefined), "customer");
  });
});

describe("auth error mapping", () => {
  it("does not leak raw provider messages for invalid sessions", () => {
    assert.equal(publicAuthError({ code: "invalid_credentials" }), "Invalid email or password.");
    assert.equal(publicAuthError({ message: "Invalid login credentials" }), "Invalid email or password.");
    assert.equal(publicAuthError({ code: "email_not_confirmed" }), "Confirm your email before signing in.");
    assert.match(publicAuthError({ message: "unexpected jwt explode token=abc" }), /unavailable/i);
  });
});
