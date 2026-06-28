"use client";

import dynamic from "next/dynamic";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { Expand, Maximize2, RotateCcw, View } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ProductDetail } from "@/types/catalog";
import { cn } from "@/lib/utils";

const Product3DViewer = dynamic(
  () => import("@/components/product/product-3d-viewer").then((mod) => mod.Product3DViewer),
  { ssr: false, loading: () => <div className="h-full min-h-[360px] animate-pulse rounded-[1.5rem] bg-muted/40" /> },
);

type ProductGalleryProps = {
  product: ProductDetail;
};

export function ProductGallery({ product }: ProductGalleryProps) {
  const prefersReducedMotion = useReducedMotion();
  const images = product.images.length > 0 ? product.images : [{ id: "fallback", url: "", altText: product.name, isPrimary: true }];
  const [activeIndex, setActiveIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [viewerMode, setViewerMode] = useState<"gallery" | "360" | "3d">("gallery");
  const activeImage = images[activeIndex] ?? images[0];

  const rotate360 = useCallback(() => {
    if (product.assets360.length === 0) return;
    setViewerMode("360");
  }, [product.assets360.length]);

  useEffect(() => {
    if (viewerMode !== "360" || product.assets360.length === 0 || prefersReducedMotion) return;
    let frame = 0;
    const interval = window.setInterval(() => {
      frame = (frame + 1) % Math.max(product.assets360[0]?.frameCount ?? 24, 24);
      setActiveIndex(frame % images.length);
    }, 120);
    return () => window.clearInterval(interval);
  }, [viewerMode, product.assets360, images.length, prefersReducedMotion]);

  const media = useMemo(() => {
    if (viewerMode === "3d" && product.model3dUrl) {
      return <Product3DViewer modelUrl={product.model3dUrl} />;
    }

    const source = activeImage?.url;
    return (
      <div
        className={cn(
          "relative h-full min-h-[420px] overflow-hidden rounded-[2rem]",
          !source && cn("bg-gradient-to-br", product.gradient),
        )}
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
      >
        {source ? (
          <motion.div
            className="h-full w-full"
            animate={zoomed && !prefersReducedMotion ? { scale: 1.12 } : { scale: 1 }}
            transition={{ duration: 0.35 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={source} alt={activeImage.altText ?? product.name} className="h-full w-full object-cover" />
          </motion.div>
        ) : null}
        {viewerMode === "360" ? (
          <Badge className="absolute left-4 top-4" variant="accent">
            360° viewer
          </Badge>
        ) : null}
      </div>
    );
  }, [viewerMode, product, activeImage, zoomed, prefersReducedMotion]);

  return (
    <div className="space-y-4">
      <Tabs value={viewerMode} onValueChange={(value) => setViewerMode(value as typeof viewerMode)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
          <TabsTrigger value="360" disabled={product.assets360.length === 0}>
            360°
          </TabsTrigger>
          <TabsTrigger value="3d" disabled={!product.model3dUrl}>
            3D
          </TabsTrigger>
        </TabsList>
        <TabsContent value={viewerMode} className="mt-4">
          <div className="relative">
            {media}
            <div className="absolute right-4 top-4 flex gap-2">
              <Button size="icon" variant="glass" aria-label="Zoom image" onClick={() => setZoomed((value) => !value)}>
                <Expand className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="glass" aria-label="Fullscreen gallery" onClick={() => setFullscreen(true)}>
                <Maximize2 className="h-4 w-4" />
              </Button>
              {product.assets360.length > 0 ? (
                <Button size="icon" variant="glass" aria-label="360 degree view" onClick={rotate360}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              ) : null}
              {product.arModelUrl ? (
                <Button size="icon" variant="glass" aria-label="AR model available" title="AR-ready">
                  <View className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex gap-3 overflow-x-auto pb-1">
        <AnimatePresence mode="popLayout">
          {images.map((image, index) => (
            <motion.button
              key={image.id}
              type="button"
              layout
              className={cn(
                "relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition",
                index === activeIndex ? "border-primary" : "border-transparent opacity-70 hover:opacity-100",
              )}
              onClick={() => {
                setViewerMode("gallery");
                setActiveIndex(index);
              }}
              aria-label={`Show image ${index + 1}`}
            >
              {image.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image.url} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className={cn("h-full w-full bg-gradient-to-br", product.gradient)} />
              )}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {product.arModelUrl ? (
        <p className="text-xs text-muted-foreground">
          AR model available at{" "}
          <a href={product.arModelUrl} className="text-primary underline-offset-4 hover:underline">
            {product.arModelUrl}
          </a>
        </p>
      ) : null}

      <Dialog open={fullscreen} onOpenChange={setFullscreen}>
        <DialogContent className="max-h-[92vh] max-w-5xl overflow-hidden p-2">
          <Suspense fallback={null}>{media}</Suspense>
        </DialogContent>
      </Dialog>
    </div>
  );
}
