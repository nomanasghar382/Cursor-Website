"use client";

import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { ProductDetail } from "@/types/catalog";
import { cn } from "@/lib/utils";

export function ProductReviews({ product }: { product: ProductDetail }) {
  if (product.reviews.length === 0) {
    return (
      <section className="rounded-[1.5rem] border border-border/60 p-6">
        <h2 className="font-display text-2xl font-semibold">Verified reviews</h2>
        <p className="mt-2 text-sm text-muted-foreground">No reviews yet. Be the first to share your experience.</p>
      </section>
    );
  }

  return (
    <section className="space-y-6" aria-labelledby="reviews-heading">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="reviews-heading" className="font-display text-2xl font-semibold">
            Verified reviews
          </h2>
          <p className="text-sm text-muted-foreground">
            {product.reviewCount} reviews · {product.rating} average rating
          </p>
        </div>
        <div className="inline-flex items-center gap-1 text-amber-300">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              className={cn("h-4 w-4", index < Math.round(product.rating) ? "fill-current" : "text-muted-foreground")}
            />
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {product.reviews.map((review) => (
          <Card key={review.id} className="border-border/60 bg-card/40">
            <CardContent className="space-y-3 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">{review.author}</p>
                  <p className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  {review.verified ? <Badge variant="success">Verified purchase</Badge> : null}
                  <Badge variant="secondary">{review.rating}/5</Badge>
                </div>
              </div>
              {review.title ? <p className="font-medium">{review.title}</p> : null}
              <p className="text-sm text-muted-foreground">{review.body}</p>
              {review.images.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {review.images.map((image) => (
                    <div key={image} className="h-20 w-20 overflow-hidden rounded-xl border border-border/60">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={image} alt="Customer review" className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
