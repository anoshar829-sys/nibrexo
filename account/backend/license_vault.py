"""Server-side secure license key storage with versioned Fernet key support.

LICENSE_ENCRYPTION_KEY is the active key. LICENSE_ENCRYPTION_KEY_VERSION labels it.
LICENSE_ENCRYPTION_PREVIOUS_KEYS may contain a JSON object of prior key versions to
support controlled rotation. All key material remains server-side only.
"""
import hashlib
import json
import os
import secrets

from cryptography.fernet import Fernet, InvalidToken


class LicenseVaultUnavailable(Exception):
    pass


class LicenseVault:
    def __init__(self):
        self.active_version = str(os.environ.get("LICENSE_ENCRYPTION_KEY_VERSION", "fernet-v1")).strip() or "fernet-v1"
        self._keys = {}
        self._load_key(self.active_version, os.environ.get("LICENSE_ENCRYPTION_KEY"))
        try:
            previous = json.loads(os.environ.get("LICENSE_ENCRYPTION_PREVIOUS_KEYS", "{}"))
        except (TypeError, json.JSONDecodeError):
            previous = {}
        if isinstance(previous, dict):
            for version, key in previous.items():
                normalized_version = str(version).strip()
                # The active version may not be silently overwritten by a previous key.
                if normalized_version and normalized_version != self.active_version:
                    self._load_key(normalized_version, key)

    def _load_key(self, version, key):
        if not key:
            return
        try:
            self._keys[version] = Fernet(str(key).encode("utf-8"))
        except (ValueError, TypeError):
            return

    @property
    def configured(self):
        return self.active_version in self._keys

    def issue(self):
        fernet = self._keys.get(self.active_version)
        if not fernet:
            raise LicenseVaultUnavailable("License encryption is not configured.")
        plaintext = f"LIC-{secrets.token_urlsafe(32)}"
        return {
            "plaintext": plaintext,
            "hash": hashlib.sha256(plaintext.encode("utf-8")).hexdigest(),
            "ciphertext": fernet.encrypt(plaintext.encode("utf-8")).decode("utf-8"),
            "version": self.active_version,
        }

    def reveal(self, ciphertext, version=None):
        key_version = version or self.active_version
        fernet = self._keys.get(key_version)
        if not fernet:
            raise LicenseVaultUnavailable("License encryption key is not available for this license version.")
        try:
            return fernet.decrypt(ciphertext.encode("utf-8")).decode("utf-8")
        except (InvalidToken, AttributeError, TypeError):
            raise LicenseVaultUnavailable("License key cannot be decrypted.")


def get_license_vault():
    return LicenseVault()
