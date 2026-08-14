"""Server-side storage boundary for public media and private product files.

No provider is connected by default. Replace UnavailableStorage with a configured provider
implementation without exposing storage credentials to frontend code.
"""

class StorageUnavailable(Exception):
    pass


class UnavailableStorage:
    configured = False

    def status(self):
        return {"name": "Storage", "status": "not_configured", "configured": False}

    def upload(self, *_args, **_kwargs):
        raise StorageUnavailable("Storage provider is not connected.")

    def metadata(self, *_args, **_kwargs):
        raise StorageUnavailable("Storage provider is not connected.")

    def archive(self, *_args, **_kwargs):
        raise StorageUnavailable("Storage provider is not connected.")

    def authorized_download(self, *_args, **_kwargs):
        raise StorageUnavailable("Storage provider is not connected.")


def get_storage_provider():
    return UnavailableStorage()
