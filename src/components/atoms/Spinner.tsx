export function Spinner() {
  return (
    <div role="status" aria-label="Loading" className="flex justify-center p-8">
      <div className="size-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
    </div>
  );
}
