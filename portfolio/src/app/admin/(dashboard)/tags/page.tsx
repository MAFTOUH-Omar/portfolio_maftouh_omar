import { asc } from "drizzle-orm";
import { db } from "@/db/client";
import { tags as tagsTable } from "@/db/schema";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EntityDialog } from "@/components/admin/entity-dialog";
import { DeleteButton } from "@/components/admin/delete-button";
import { ListSearch } from "@/components/admin/list-search";
import { ListPagination } from "@/components/admin/list-pagination";
import { paginate } from "@/lib/paginate";
import { createTag, deleteTag, updateTag } from "./actions";

type TagRow = typeof tagsTable.$inferSelect;

function TagFields({ tag }: { tag?: TagRow }) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" name="slug" required defaultValue={tag?.slug} placeholder="nextjs" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="nameFr">Name (FR)</Label>
        <Input id="nameFr" name="nameFr" required defaultValue={tag?.nameFr} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="nameEn">Name (EN)</Label>
        <Input id="nameEn" name="nameEn" required defaultValue={tag?.nameEn} />
      </div>
    </>
  );
}

export default async function AdminTagsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q = "", page: pageParam } = await searchParams;
  const allRows = await db.select().from(tagsTable).orderBy(asc(tagsTable.nameEn));

  const needle = q.trim().toLowerCase();
  const filteredRows = needle
    ? allRows.filter(
        (tag) =>
          tag.slug.toLowerCase().includes(needle) ||
          tag.nameFr.toLowerCase().includes(needle) ||
          tag.nameEn.toLowerCase().includes(needle)
      )
    : allRows;
  const { items: rows, page, totalPages } = paginate(filteredRows, Number(pageParam) || 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Tags</h1>
        <div className="flex flex-wrap items-center gap-3 sm:flex-row-reverse">
          <EntityDialog trigger="New tag" title="New tag" action={createTag}>
            <TagFields />
          </EntityDialog>
          <ListSearch placeholder="Search tags…" />
        </div>
      </div>
      <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Slug</TableHead>
            <TableHead>Name (FR)</TableHead>
            <TableHead className="hidden sm:table-cell">Name (EN)</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                No tags match your search.
              </TableCell>
            </TableRow>
          )}
          {rows.map((tag) => (
            <TableRow key={tag.id}>
              <TableCell>{tag.slug}</TableCell>
              <TableCell>{tag.nameFr}</TableCell>
              <TableCell className="hidden sm:table-cell">{tag.nameEn}</TableCell>
              <TableCell className="flex justify-end gap-2 text-right">
                <EntityDialog
                  trigger="Edit"
                  triggerVariant="outline"
                  title="Edit tag"
                  action={updateTag.bind(null, tag.id)}
                >
                  <TagFields tag={tag} />
                </EntityDialog>
                <DeleteButton action={deleteTag.bind(null, tag.id)} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ListPagination basePath="/admin/tags" page={page} totalPages={totalPages} query={{ q }} />
      </Card>
    </div>
  );
}
