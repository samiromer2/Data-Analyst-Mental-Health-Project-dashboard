export function EmptyState({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="flex min-h-48 flex-col justify-center border border-dashed border-outline bg-surface-dim px-6 py-8">
      <h3 className="text-base font-semibold text-charcoal">{title}</h3>
      <p className="mt-2 max-w-xl text-sm leading-6 text-slate">{body}</p>
    </div>
  );
}
