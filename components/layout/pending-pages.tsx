import { PendingPage } from "@/components/layout/PendingPage";
import { pendingPages, routes } from "@/lib/site";

export function StorePendingPage() {
  return <PendingPage {...pendingPages[routes.store]} />;
}

export function CartPendingPage() {
  return <PendingPage {...pendingPages[routes.cart]} />;
}

export function ServicesPendingPage() {
  return <PendingPage {...pendingPages[routes.services]} />;
}

export function ResourcesPendingPage() {
  return <PendingPage {...pendingPages[routes.resources]} />;
}

export function AboutPendingPage() {
  return <PendingPage {...pendingPages[routes.about]} />;
}

export function LegalPendingPage() {
  return <PendingPage {...pendingPages[routes.legal]} />;
}

export function LoginPendingPage() {
  return <PendingPage {...pendingPages[routes.login]} />;
}
