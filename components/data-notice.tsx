export function DataNotice({ children }: { children: string }) {
  return (
    <p className="border border-outline bg-surface-dim px-4 py-3 text-sm leading-6 text-on-variant">
      {children}
    </p>
  );
}
