"use client";

import { ImagePlus, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { AiRecommendationCarousel } from "@/components/ai/ai-recommendation-carousel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { aiApi } from "@/lib/api/ai";
import { useAuthStore } from "@/stores/auth-store";
import type { AiImageSearchResponse } from "@/types/ai";
import type { ProductCard } from "@/types/catalog";
import { toast } from "sonner";

export function AiImageSearchUpload() {
  const token = useAuthStore((state) => state.accessToken);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiImageSearchResponse | null>(null);

  async function handleFile(file: File) {
    setLoading(true);
    try {
      const response = await aiApi.imageSearch(file, token);
      setResult(response);
      toast.success(`Found ${response.matches.length} visual matches`);
    } catch {
      toast.error("Image search failed");
    } finally {
      setLoading(false);
    }
  }

  const matchedProducts: ProductCard[] =
    result?.matches.map((match) => ({
      id: match.product.id,
      slug: match.product.slug,
      name: match.product.name,
      category: match.product.category,
      categorySlug: match.product.categorySlug,
      brand: match.product.brand,
      price: match.product.price,
      rating: 4.8,
      reviewCount: 0,
      stock: match.product.stock,
      badge: "Visual match",
      badges: ["Visual match"],
      aiMatch: match.product.aiMatch,
      description: match.product.description,
      gradient: "from-slate-300 via-slate-500 to-slate-700",
      imageUrl: match.product.imageUrl,
      colors: [],
      createdAt: match.product.createdAt,
    })) ?? [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="icon" aria-label="Search by image">
          <ImagePlus />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl rounded-[2rem]">
        <DialogHeader>
          <DialogTitle>Visual product search</DialogTitle>
          <DialogDescription>Upload a product photo to find visually similar catalog items.</DialogDescription>
        </DialogHeader>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />

        <div className="rounded-[1.5rem] border border-dashed border-border/70 p-8 text-center">
          {loading ? (
            <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              Analyzing image and matching products...
            </div>
          ) : (
            <>
              <ImagePlus className="mx-auto mb-3 h-8 w-8 text-primary" />
              <p className="mb-4 text-sm text-muted-foreground">JPEG, PNG, or WebP up to 25MB</p>
              <Button type="button" variant="gradient" onClick={() => inputRef.current?.click()}>
                Choose image
              </Button>
            </>
          )}
        </div>

        {result ? (
          <div className="space-y-4">
            {result.detectedLabels.length > 0 ? (
              <p className="text-sm text-muted-foreground">Detected: {result.detectedLabels.join(", ")}</p>
            ) : null}
            <AiRecommendationCarousel title="Visual matches" products={matchedProducts} compact />
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
