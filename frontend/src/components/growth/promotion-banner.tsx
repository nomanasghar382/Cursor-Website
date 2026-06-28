import Link from "next/link";

export function PromotionBanner({
  title,
  imageUrl,
  targetUrl,
  placement,
}: {
  title: string;
  imageUrl: string;
  targetUrl?: string | null;
  placement?: string;
}) {
  const content = (
    <div className="relative overflow-hidden rounded-[1.5rem] border border-border/60">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageUrl} alt={title} className="h-40 w-full object-cover md:h-52" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-5">
        {placement ? <p className="text-xs uppercase tracking-[0.18em] text-primary">{placement}</p> : null}
        <p className="font-display text-xl font-semibold">{title}</p>
      </div>
    </div>
  );

  if (targetUrl) {
    return (
      <Link href={targetUrl} className="block transition hover:scale-[1.01]">
        {content}
      </Link>
    );
  }

  return content;
}
