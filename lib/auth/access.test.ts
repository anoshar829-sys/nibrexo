import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canOpenAccount,
  canOpenAdmin,
  classifyAccess,
  publicAuthError,
  roleFromProfile,
  signupUserMetadata,
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
