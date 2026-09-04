// Stand-in for actions whose destination admin page is not built yet.
// Renders as a visibly disabled control instead of a dead link or 404.

export function PlannedAdminLink({
  label,
  hint,
}: Readonly<{
  label: string;
  hint: string;
}>) {
  return (
    <span className="admin-planned-action" aria-disabled="true" title={hint}>
      {label} <span aria-hidden="true">→</span>
      <span className="admin-planned-action__tag">Soon</span>
      <span className="sr-only">{hint}</span>
    </span>
  );
}
