import { db } from "@/db";
import { categories } from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function AdminCategoriesPage() {
  const rows = db.select().from(categories).all();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Categories ({rows.length})</h1>
      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Href</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead>Kind</TableHead>
              <TableHead>Nav</TableHead>
              <TableHead>Order</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-mono text-xs">{row.id}</TableCell>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{row.slug}</TableCell>
                <TableCell className="text-xs text-muted-foreground max-w-48 truncate">{row.href}</TableCell>
                <TableCell>{row.gender}</TableCell>
                <TableCell className="text-xs">{row.parentId ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={row.kind === "filter" ? "secondary" : "outline"}>{row.kind}</Badge>
                </TableCell>
                <TableCell>{row.nav ? "✓" : "—"}</TableCell>
                <TableCell className="text-xs">{row.navOrder}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
