export default function CheckoutLoading() {
  return (
    <div className="min-h-screen bg-obsidian px-4 py-10">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="flex items-center gap-4">
          <div className="h-8 w-20 bg-white/10 rounded animate-pulse" />
          <div className="h-px flex-1 bg-gold/10" />
        </div>
        <div className="h-48 bg-charcoal/50 rounded-3xl border border-white/10 animate-pulse" />
        <div className="h-80 bg-charcoal/50 rounded-3xl border border-white/10 animate-pulse" />
      </div>
    </div>
  );
}