"use client";

import { useEffect, useMemo, useState } from "react";
import { GitCompare, Heart, Share2, ShoppingCart, Sparkles, Truck } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useHomeStore } from "@/stores/home-store";
import type { ProductDetail, ProductVariantView } from "@/types/catalog";
import { cn, formatCurrency } from "@/lib/utils";

type ProductBuyBoxProps = {
  product: ProductDetail;
};

export function ProductBuyBox({ product }: ProductBuyBoxProps) {
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0]?.id);
  const [quantity, setQuantity] = useState(1);
  const [postalCode, setPostalCode] = useState("");
  const [shippingEstimate, setShippingEstimate] = useState<string | null>(null);
  const toggleWishlist = useHomeStore((state) => state.toggleWishlist);
  const addToCart = useHomeStore((state) => state.addToCart);
  const toggleCompare = useHomeStore((state) => state.toggleCompare);
  const wishlist = useHomeStore((state) => state.wishlist);
  const isWishlisted = wishlist.includes(product.id);

  const selectedVariant = useMemo(
    () => product.variants.find((variant) => variant.id === selectedVariantId) ?? product.variants[0],
    [product.variants, selectedVariantId],
  );

  const colors = [...new Set(product.variants.map((variant) => variant.color).filter(Boolean))] as string[];
  const sizes = [...new Set(product.variants.map((variant) => variant.size).filter(Boolean))] as string[];
  const materials = [...new Set(product.variants.map((variant) => variant.material).filter(Boolean))] as string[];

  const price = selectedVariant?.price ?? product.price;
  const compareAt = selectedVariant?.compareAtPrice ?? product.compareAtPrice;
  const stock = selectedVariant?.stock ?? product.stock;
  const discountPercent =
    compareAt && compareAt > price ? Math.round(((compareAt - price) / compareAt) * 100) : product.discountPercent;

  useEffect(() => {
    if (!postalCode || postalCode.length < 5) {
      setShippingEstimate(null);
      return;
    }
    const days = product.estimatedDeliveryDays + (Number(postalCode.slice(-1)) % 3);
    setShippingEstimate(`Estimated delivery in ${days} business days to ${postalCode.toUpperCase()}`);
  }, [postalCode, product.estimatedDeliveryDays]);

  const selectByAttribute = (key: keyof ProductVariantView, value: string) => {
    const match = product.variants.find((variant) => variant[key] === value);
    if (match) setSelectedVariantId(match.id);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: product.name, text: product.description, url });
      return;
    }
    await navigator.clipboard.writeText(url);
    toast.success("Product link copied");
  };

  return (
    <div className="space-y-6 rounded-[2rem] border border-border/60 bg-card/40 p-6 backdrop-blur-xl lg:sticky lg:top-28">
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {product.badges.map((badge) => (
            <Badge key={badge} variant={badge.includes("AI") ? "accent" : "secondary"}>
              {badge}
            </Badge>
          ))}
        </div>
        <p className="text-sm uppercase tracking-[0.24em] text-primary">
          {product.brand ?? product.category}
        </p>
        <h1 className="font-display text-4xl font-semibold md:text-5xl">{product.name}</h1>
        <p className="text-lg text-muted-foreground">{product.description}</p>
      </div>

      <div className="space-y-2">
        {compareAt && compareAt > price ? (
          <p className="text-sm text-muted-foreground line-through">{formatCurrency(compareAt)}</p>
        ) : null}
        <p className="font-display text-4xl font-semibold">{formatCurrency(price)}</p>
        {discountPercent ? <p className="text-sm font-medium text-emerald-400">You save {discountPercent}%</p> : null}
      </div>

      <VariantPicker title="Color" options={colors} active={selectedVariant?.color} onSelect={(value) => selectByAttribute("color", value)} />
      <VariantPicker title="Size" options={sizes} active={selectedVariant?.size} onSelect={(value) => selectByAttribute("size", value)} />
      <VariantPicker
        title="Material"
        options={materials}
        active={selectedVariant?.material}
        onSelect={(value) => selectByAttribute("material", value)}
      />

      <div className="space-y-2">
        <Label htmlFor="quantity">Quantity</Label>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Decrease quantity"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
          >
            -
          </Button>
          <Input
            id="quantity"
            type="number"
            min={1}
            max={stock}
            value={quantity}
            onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
            className="w-20 text-center"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Increase quantity"
            onClick={() => setQuantity((value) => Math.min(stock || 1, value + 1))}
          >
            +
          </Button>
        </div>
        <Badge variant={stock > 0 ? "success" : "secondary"}>
          {stock > 0 ? `${stock} available` : "Currently unavailable"}
        </Badge>
      </div>

      <div className="space-y-2">
        <Label htmlFor="shipping-postal">Shipping calculator</Label>
        <Input
          id="shipping-postal"
          placeholder="Enter postal code"
          value={postalCode}
          onChange={(event) => setPostalCode(event.target.value)}
        />
        {shippingEstimate ? (
          <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Truck className="h-4 w-4 text-primary" />
            {shippingEstimate}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Standard delivery in {product.estimatedDeliveryDays} business days
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          variant="gradient"
          size="lg"
          className="flex-1"
          disabled={stock <= 0}
          onClick={() => {
            addToCart(product.id, quantity);
            toast.success("Added to cart");
          }}
        >
          <ShoppingCart className="h-4 w-4" />
          Add to cart
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => {
            toggleWishlist(product.id);
            toast.message(isWishlisted ? "Removed from wishlist" : "Saved for later");
          }}
        >
          <Heart className={cn("h-4 w-4", isWishlisted && "fill-current text-rose-400")} />
          {isWishlisted ? "Saved" : "Wishlist"}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="ghost" size="sm" onClick={() => toggleCompare(product.id)}>
          <GitCompare className="h-4 w-4" />
          Compare
        </Button>
        <Button variant="ghost" size="sm" onClick={handleShare}>
          <Share2 className="h-4 w-4" />
          Share
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            toggleWishlist(product.id);
            toast.message("Saved for later");
          }}
        >
          <Sparkles className="h-4 w-4" />
          Save for later
        </Button>
      </div>
    </div>
  );
}

function VariantPicker({
  title,
  options,
  active,
  onSelect,
}: {
  title: string;
  options: string[];
  active?: string;
  onSelect: (value: string) => void;
}) {
  if (options.length === 0) return null;
  return (
    <div className="space-y-2">
      <Label>{title}</Label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <Button
            key={option}
            type="button"
            size="sm"
            variant={active === option ? "gradient" : "outline"}
            onClick={() => onSelect(option)}
            aria-pressed={active === option}
          >
            {option}
          </Button>
        ))}
      </div>
    </div>
  );
}
