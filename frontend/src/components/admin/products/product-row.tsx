"use client"

import { formatPrice } from "@/lib/utils"
import { ChevronDown, ChevronRight } from "lucide-react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { TableCell, TableRow } from "@/components/ui/table"
import type { Product } from "@/db"

interface Variant {
  sku: string
  color: string
  size: string
  image: string
  price: number | null
  currency: string
  inStock: boolean
}

function ColorChip({ name, image }: { name: string; image: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <img
        src={image}
        alt={name}
        className="size-10 rounded-full border border-border object-cover"
      />
      <span className="text-[10px] text-muted-foreground">{name}</span>
    </div>
  )
}

function ProductDetail({ product }: { product: Product }) {
  const colors = JSON.parse(product.colors || "[]")
  const colorChips = JSON.parse(product.colorChips || "[]")
  const sizes = JSON.parse(product.sizes || "[]")
  const variants: Variant[] = JSON.parse(product.variants || "[]")
  const gallery = JSON.parse(product.gallery || "[]")
  const productDesc = JSON.parse(product.productDescription || "[]")
  const inStock = variants.filter((v) => v.inStock).length

  return (
    <div className="bg-muted/30 border-t border-border">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
        {/* Brand & Category */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Info</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Brand:</span> {product.brand}
            </div>
            <div>
              <span className="text-muted-foreground">Section:</span> {product.section || "—"}
            </div>
            <div>
              <span className="text-muted-foreground">Category:</span> {product.category || "—"}
            </div>
            <div>
              <span className="text-muted-foreground">Subcategory:</span>{" "}
              {product.subcategory || "—"}
            </div>
          </CardContent>
        </Card>

        {/* Stock summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Stock</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <div>
              <span className="text-sm text-muted-foreground">In stock</span>
              <p className="text-2xl font-bold text-green-600">{inStock}</p>
            </div>
            <Separator orientation="vertical" className="h-10" />
            <div>
              <span className="text-sm text-muted-foreground">Out of stock</span>
              <p className="text-2xl font-bold text-red-600">{variants.length - inStock}</p>
            </div>
            <Separator orientation="vertical" className="h-10" />
            <div>
              <span className="text-sm text-muted-foreground">Total variants</span>
              <p className="text-2xl font-bold">{variants.length}</p>
            </div>
          </CardContent>
        </Card>

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
                    <Badge key={c.name} variant="outline">
                      {c.name}
                    </Badge>
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
                <Badge key={s} variant="secondary">
                  {s}
                </Badge>
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
                <img
                  key={i}
                  src={g.url}
                  alt=""
                  className="size-16 object-cover rounded-md border border-border"
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Variants table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Variants ({variants.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-48 overflow-y-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-muted-foreground border-b border-border">
                    <th className="text-left py-1">Color</th>
                    <th className="text-left py-1">Size</th>
                    <th className="text-right py-1">Price</th>
                    <th className="text-right py-1">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((v, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="py-1">{v.color}</td>
                      <td className="py-1">{v.size}</td>
											<td className="py-1 text-right">¥{formatPrice(v.price ?? 0)}</td>
                      <td className="py-1 text-right">
                        {v.inStock ? (
                          <Badge variant="outline" className="text-green-600 text-[10px]">
                            in
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-red-600 text-[10px]">
                            out
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                    {sec.section}
                  </h4>
                  {sec.pairs ? (
                    <div className="grid grid-cols-2 gap-4">
                      {sec.pairs.map((pair: any, j: number) => (
                        <div key={j} className="flex gap-3">
                          {pair.image && (
                            <img
                              src={pair.image}
                              alt=""
                              className="size-12 object-cover rounded border border-border"
                            />
                          )}
                          <p className="text-xs text-muted-foreground">
                            {Array.isArray(pair.text)
                              ? pair.text.map((t: any, k: number) =>
                                  t.href ? (
                                    <span key={k} className="text-primary underline">
                                      {t.content}
                                    </span>
                                  ) : (
                                    <span key={k}>{t.content}</span>
                                  ),
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
      </div>
    </div>
  )
}

export function ProductRow({ product }: { product: Product }) {
  const [open, setOpen] = useState(false)
  const variants: Variant[] = JSON.parse(product.variants || "[]")
  const inStock = variants.filter((v) => v.inStock).length

  return (
    <>
      <TableRow className="cursor-pointer hover:bg-muted/50" onClick={() => setOpen(!open)}>
        <TableCell className="w-8">
          {open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        </TableCell>
        <TableCell className="font-mono text-xs">{product.productId}</TableCell>
        <TableCell className="font-medium max-w-56 truncate">{product.name}</TableCell>
				<TableCell>¥{formatPrice(product.price ?? 0)}</TableCell>
        <TableCell>
          <span>{product.rating}</span>
          <span className="text-[10px] text-muted-foreground">★</span>
        </TableCell>
        <TableCell className="text-xs">{product.reviewCount}</TableCell>
        <TableCell className="text-xs">{product.gender}</TableCell>
        <TableCell className="text-xs max-w-40 truncate">
          {[product.section, product.category, product.subcategory].filter(Boolean).join(" / ")}
        </TableCell>
        <TableCell>
          {product.inStock ? (
            <Badge variant="outline" className="text-green-600 border-green-600">
              {inStock}/{variants.length}
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
  )
}
