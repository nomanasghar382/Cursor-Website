import Link from "next/link";
import { ArrowUpRight, Sparkles, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProductCard } from "@/types/catalog";
import { formatCurrency, cn } from "@/lib/utils";

export function ProductCardView({ product }: { product: ProductCard }) {
  return (
    <Card className="group overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-glow)]">
      <CardHeader className="space-y-4">
        <div
          className={cn(
            "relative flex h-44 items-end overflow-hidden rounded-[1.5rem] bg-gradient-to-br p-5",
            product.gradient,
          )}
        >
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.imageUrl} alt={product.name} className="absolute inset-0 h-full w-full object-cover" />
          ) : null}
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative space-y-2">
            <Badge variant="accent">{product.badge}</Badge>
            <CardTitle className="text-white">{product.name}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
        <div className="flex items-center justify-between text-sm">
          <div className="inline-flex items-center gap-1 text-amber-300">
            <Star className="h-4 w-4 fill-current" />
            {product.rating}
          </div>
          <div className="inline-flex items-center gap-1 text-primary">
            <Sparkles className="h-4 w-4" />
            {product.aiMatch}% match
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{product.category}</p>
          <p className="font-display text-2xl font-semibold">{formatCurrency(product.price)}</p>
        </div>
        <Button asChild variant="glass">
          <Link href={`/products/${product.id}`}>
            View
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
