"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Product {
  productId: string;
  name: string;
  description?: string | null;
  category?: string | null;
  price?: number | null;
  rating?: string | null;
  reviewCount?: number | null;
  gender: string;
  categoryId?: number | null;
  material?: string | null;
  colors: string;
  colorChips: string;
  sizes: string;
  gallery: string;
  aiReview?: string | null;
  productDescription: string;
  breadcrumbs: string;
  availability: string;
}

function ColorChip({ name, image }: { name: string; image: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <img src={image} alt={name} className="size-10 rounded-full border border-border object-cover" />
      <span className="text-[10px] text-muted-foreground">{name}</span>
    </div>
  );
}

function ProductDetail({ product }: { product: Product }) {
  const colors = JSON.parse(product.colors || "[]");
  const colorChips = JSON.parse(product.colorChips || "[]");
  const sizes = JSON.parse(product.sizes || "[]");
  const gallery = JSON.parse(product.gallery || "[]");
  const breadcrumbs = JSON.parse(product.breadcrumbs || "[]");
  const availability = JSON.parse(product.availability || "{}");
  const productDesc = JSON.parse(product.productDescription || "[]");

  return (
    <div className="bg-muted/30 border-t border-border">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
        {/* Colors */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Colors ({colors.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {colorChips.length > 0
                ? colorChips.map((c: any) => (
                    <ColorChip key={c.name} name={c.name} image={c.image} />
                  ))
                : colors.map((c: any) => (
                    <Badge key={c.name} variant="outline">{c.name}</Badge>
                  ))}
            </div>
          </CardContent>
        </Card>

        {/* Sizes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Sizes ({sizes.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {sizes.map((s: string) => (
                <Badge key={s} variant="secondary">{s}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Gallery */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Gallery ({gallery.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {gallery.slice(0, 8).map((g: any, i: number) => (
                <img key={i} src={g.url} alt="" className="size-16 object-cover rounded-md border border-border" />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stock */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Stock</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <div>
              <span className="text-sm text-muted-foreground">In stock</span>
              <p className="text-2xl font-bold text-green-600">{availability.inStock ?? "?"}</p>
            </div>
            <Separator orientation="vertical" className="h-10" />
            <div>
              <span className="text-sm text-muted-foreground">Out of stock</span>
              <p className="text-2xl font-bold text-red-600">{availability.outOfStock ?? "?"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Material */}
        {product.material && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm">Material</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{product.material}</p>
            </CardContent>
          </Card>
        )}

        {/* AI Review */}
        {product.aiReview && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm">AI Review</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">{product.aiReview}</p>
            </CardContent>
          </Card>
        )}

        {/* Product Description */}
        {productDesc.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm">Product Description</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {productDesc.map((sec: any, i: number) => (
                <div key={i}>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">{sec.section}</h4>
                  {sec.pairs ? (
                    <div className="grid grid-cols-2 gap-4">
                      {sec.pairs.map((pair: any, j: number) => (
                        <div key={j} className="flex gap-3">
                          {pair.image && (
                            <img src={pair.image} alt="" className="size-12 object-cover rounded border border-border" />
                          )}
                          <p className="text-xs text-muted-foreground">
                            {Array.isArray(pair.text)
                              ? pair.text.map((t: any, k: number) =>
                                  t.href ? (
                                    <span key={k} className="text-primary underline">{t.content}</span>
                                  ) : (
                                    <span key={k}>{t.content}</span>
                                  )
                                )
                              : pair.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground whitespace-pre-line">{sec.text}</p>
                  )}
                  {i < productDesc.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm">Breadcrumbs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1 items-center text-xs text-muted-foreground">
                {breadcrumbs.map((b: any, i: number) => (
                  <span key={i}>
                    {i > 0 && <span className="mx-1">/</span>}
                    {b.name}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export function ProductRow({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);
  const avail = JSON.parse(product.availability || "{}");
  const inStock = avail.inStock ?? 0;
  const outStock = avail.outOfStock ?? 0;

  return (
    <>
      <TableRow
        className="cursor-pointer hover:bg-muted/50"
        onClick={() => setOpen(!open)}
      >
        <TableCell className="w-8">
          {open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        </TableCell>
        <TableCell className="font-mono text-xs">{product.productId}</TableCell>
        <TableCell className="font-medium max-w-56 truncate">{product.name}</TableCell>
        <TableCell>¥{product.price?.toLocaleString()}</TableCell>
        <TableCell>
          <div className="flex items-center gap-1">
            <span>{product.rating}</span>
            <span className="text-[10px] text-muted-foreground">★</span>
          </div>
        </TableCell>
        <TableCell className="text-xs">{product.reviewCount}</TableCell>
        <TableCell className="text-xs">{product.gender}</TableCell>
        <TableCell className="text-xs max-w-40 truncate">{product.category}</TableCell>
        <TableCell>
          {inStock > 0 ? (
            <Badge variant="outline" className="text-green-600 border-green-600">
              {inStock} in stock
            </Badge>
          ) : (
            <Badge variant="outline" className="text-red-600 border-red-600">
              out
            </Badge>
          )}
        </TableCell>
      </TableRow>
      {open && (
        <TableRow>
          <TableCell colSpan={9} className="p-0">
            <ProductDetail product={product} />
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
