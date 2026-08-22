"use client";

import Image from "next/image";
import { useActionState } from "react";
import type { AvatarId } from "@/lib/auth/avatars";

type Result = { ok: true } | { ok: false; error: string };
type Props = { action: (formData: FormData) => Promise<Result>; displayName: string; avatarId: AvatarId; avatars: { id: AvatarId; src: string }[] };

export default function ProfileForm({ action, displayName, avatarId, avatars }: Props) {
  const [state, formAction, pending] = useActionState<Result | null, FormData>(async (_previous, formData) => action(formData), null);
  return (
    <form className="account-form profile-form" action={formAction}>
      <div className="form-field">
        <label htmlFor="display-name">Display name</label>
        <input id="display-name" name="display_name" defaultValue={displayName} maxLength={80} required />
      </div>
      <fieldset className="avatar-picker">
        <legend>Choose an avatar</legend>
        <div className="avatar-picker__grid">
          {avatars.map((avatar) => (
            <label className="avatar-option" key={avatar.id}>
              <input type="radio" name="avatar_id" value={avatar.id} defaultChecked={avatar.id === avatarId} />
              <Image src={avatar.src} alt={`Avatar ${avatar.id.slice(-2)}`} width={64} height={64} />
            </label>
          ))}
        </div>
      </fieldset>
      <button className="button button--primary" type="submit" disabled={pending}>{pending ? "Saving…" : "Save profile"}</button>
      {state?.ok ? <p className="form-status is-visible is-success" role="status">Profile saved.</p> : null}
      {state && !state.ok ? <p className="form-status is-visible is-error" role="alert">{state.error}</p> : null}
    </form>
  );
}
