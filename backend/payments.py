"""Server-side payment boundary.

No payment provider is selected or connected. A provider adapter must implement these
operations server-side and verify signed provider callbacks before an order can be paid.
"""

class PaymentUnavailable(Exception):
    pass


class UnavailablePaymentProvider:
    configured = False

    def status(self):
        return {"name": "Payment", "status": "not_configured", "configured": False}

    def create_payment(self, *_args, **_kwargs):
        raise PaymentUnavailable("Payment provider is not connected.")

    def verify_webhook(self, *_args, **_kwargs):
        raise PaymentUnavailable("Payment provider is not connected.")

    def refund(self, *_args, **_kwargs):
        raise PaymentUnavailable("Payment provider is not connected.")


def get_payment_provider():
    return UnavailablePaymentProvider()
