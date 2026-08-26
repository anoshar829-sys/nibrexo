"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useId, useRef, useState } from "react";
import { AccountIcon } from "@/components/ui/Icons";

type Result =
  | { ok: true; displayName: string; avatarPath: string | null; avatarUrl: string | null }
  | { ok: false; error: string };

type Props = {
  action: (formData: FormData) => Promise<Result>;
  displayName: string;
  avatarUrl: string | null;
};

export default function ProfileForm({ action, displayName, avatarUrl }: Props) {
  const router = useRouter();
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [fileLabel, setFileLabel] = useState("No file selected");
  const [savedAvatarUrl, setSavedAvatarUrl] = useState<string | null>(null);
  const [state, formAction, pending] = useActionState<Result | null, FormData>(
    async (_previous, formData) => action(formData),
    null,
  );

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // When the server re-renders with a fresh avatarUrl (after router.refresh), drop the blob preview.
  useEffect(() => {
    if (!avatarUrl || !previewUrl) {
      return;
    }
    URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setFileLabel("No file selected");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [avatarUrl, previewUrl]);

  useEffect(() => {
    if (!state?.ok) {
      return;
    }

    setRemovePhoto(false);
    setSavedAvatarUrl(state.avatarUrl);
    setFileLabel("No file selected");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // Keep any local blob preview until server props catch up; refresh headers/menu identity.
    router.refresh();
  }, [state, router]);

  const effectiveAvatarUrl = savedAvatarUrl ?? avatarUrl;
  const shownUrl = removePhoto ? null : previewUrl ?? effectiveAvatarUrl;
  const hasSavedPhoto = Boolean(effectiveAvatarUrl) && !removePhoto;

  function clearFileSelection() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setFileLabel("No file selected");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function onFileChange(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) {
      clearFileSelection();
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(URL.createObjectURL(file));
    setFileLabel(file.name);
    setRemovePhoto(false);
    setSavedAvatarUrl(null);
  }

  return (
    <form className="account-form profile-form" action={formAction}>
      <div className="form-field">
        <label htmlFor="display-name">Display name</label>
        <input id="display-name" name="display_name" defaultValue={displayName} maxLength={80} required key={displayName} />
      </div>

      <fieldset className="profile-photo">
        <legend>Profile photo</legend>
        <div className="profile-photo__row">
          <div className="profile-photo__preview" aria-hidden={shownUrl ? undefined : true}>
            {shownUrl ? (
              // User-supplied photo URLs (blob preview or Supabase public object).
              // eslint-disable-next-line @next/next/no-img-element
              <img src={shownUrl} alt="" width={96} height={96} />
            ) : (
              <span className="profile-photo__fallback">
                <AccountIcon />
              </span>
            )}
          </div>
          <div className="profile-photo__controls">
            <p className="profile-photo__hint">JPEG, PNG, or WebP · max 5 MB</p>
            <input
              ref={fileInputRef}
              id={fileInputId}
              className="profile-photo__input"
              type="file"
              name="photo"
              accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
              onChange={(event) => onFileChange(event.target.files)}
            />
            <div className="profile-photo__actions">
              <label className="button button--outline profile-photo__upload" htmlFor={fileInputId}>
                {hasSavedPhoto || previewUrl ? "Change photo" : "Upload photo"}
              </label>
              {previewUrl || hasSavedPhoto ? (
                <button
                  className="button button--outline"
                  type="button"
                  onClick={() => {
                    clearFileSelection();
                    setSavedAvatarUrl(null);
                    if (hasSavedPhoto || avatarUrl || effectiveAvatarUrl) {
                      setRemovePhoto(true);
                    }
                  }}
                >
                  Remove photo
                </button>
              ) : null}
            </div>
            <p className="profile-photo__file" aria-live="polite">
              {removePhoto ? "Photo will be removed when you save." : fileLabel}
            </p>
          </div>
        </div>
        <input type="hidden" name="remove_photo" value={removePhoto ? "1" : "0"} />
      </fieldset>

      <button className="button button--primary" type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save profile"}
      </button>
      {state?.ok ? (
        <p className="form-status is-visible is-success" role="status">
          Profile saved.
        </p>
      ) : null}
      {state && !state.ok ? (
        <p className="form-status is-visible is-error" role="alert">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
