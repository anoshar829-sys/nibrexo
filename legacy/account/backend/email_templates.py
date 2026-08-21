"""Reusable event template metadata. Delivery is delegated to the configured email provider."""

TEMPLATES = {
    "account.welcome": {"subject": "Welcome to Nibrexo", "transactional": True},
    "account.password_reset": {"subject": "Reset your Nibrexo password", "transactional": True},
    "order.created": {"subject": "Your Nibrexo order is pending", "transactional": True},
    "payment.verified": {"subject": "Your Nibrexo payment is confirmed", "transactional": True},
    "license.available": {"subject": "Your Nibrexo license is available", "transactional": True},
    "download.available": {"subject": "Your Nibrexo download is available", "transactional": True},
    "support.updated": {"subject": "Your Nibrexo support ticket was updated", "transactional": True},
    "admin.notification": {"subject": "Nibrexo admin notification", "transactional": True},
}
