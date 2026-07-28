import { db } from "@/db";
import { products } from "@/db/schema";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductRow } from "@/components/admin/products/product-row";

export default async function AdminProductsPage() {
  const rows = db.select().from(products).all();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Products ({rows.length})</h1>
      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead>Product ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Reviews</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Stock</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <ProductRow key={row.productId} product={row as any} />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
