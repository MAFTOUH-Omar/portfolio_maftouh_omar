import { asc } from "drizzle-orm";
import { db } from "@/db/client";
import { education as educationTable } from "@/db/schema";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EntityDialog } from "@/components/admin/entity-dialog";
import { DeleteButton } from "@/components/admin/delete-button";
import { ListSearch } from "@/components/admin/list-search";
import { ListPagination } from "@/components/admin/list-pagination";
import { paginate } from "@/lib/paginate";
import { createEducation, deleteEducation, updateEducation } from "./actions";

type EducationRow = typeof educationTable.$inferSelect;

function EducationFields({ entry }: { entry?: EducationRow }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="col-span-2 space-y-2">
        <Label htmlFor="school">School</Label>
        <Input id="school" name="school" required defaultValue={entry?.school} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="degreeFr">Degree (FR)</Label>
        <Input id="degreeFr" name="degreeFr" required defaultValue={entry?.degreeFr} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="degreeEn">Degree (EN)</Label>
        <Input id="degreeEn" name="degreeEn" required defaultValue={entry?.degreeEn} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="start">Start year</Label>
        <Input id="start" name="start" required defaultValue={entry?.start} placeholder="2025" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="end">End year</Label>
        <Input id="end" name="end" defaultValue={entry?.end ?? ""} placeholder="2027" />
      </div>
      <div className="col-span-2 space-y-2">
        <Label htmlFor="href">Link (optional)</Label>
        <Input id="href" name="href" type="url" defaultValue={entry?.href ?? ""} />
      </div>
      <div className="col-span-2 space-y-2">
        <Label htmlFor="logoUrl">Logo URL</Label>
        <Input id="logoUrl" name="logoUrl" defaultValue={entry?.logoUrl ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="sortOrder">Sort order</Label>
        <Input id="sortOrder" name="sortOrder" type="number" defaultValue={entry?.sortOrder ?? 0} />
      </div>
    </div>
  );
}

export default async function AdminEducationPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q = "", page: pageParam } = await searchParams;
  const allRows = await db.select().from(educationTable).orderBy(asc(educationTable.sortOrder));

  const needle = q.trim().toLowerCase();
  const filteredRows = needle
    ? allRows.filter(
        (entry) => entry.school.toLowerCase().includes(needle) || entry.degreeFr.toLowerCase().includes(needle)
      )
    : allRows;
  const { items: rows, page, totalPages } = paginate(filteredRows, Number(pageParam) || 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Education</h1>
        <div className="flex flex-wrap items-center gap-3 sm:flex-row-reverse">
          <EntityDialog
            trigger="New entry"
            title="New education entry"
            action={createEducation}
            contentClassName="sm:max-w-xl"
          >
            <EducationFields />
          </EntityDialog>
          <ListSearch placeholder="Search education…" />
        </div>
      </div>
      <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>School</TableHead>
            <TableHead>Degree</TableHead>
            <TableHead>Years</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                No entries match your search.
              </TableCell>
            </TableRow>
          )}
          {rows.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell>{entry.school}</TableCell>
              <TableCell>{entry.degreeFr}</TableCell>
              <TableCell>
                {entry.start} – {entry.end}
              </TableCell>
              <TableCell className="flex justify-end gap-2 text-right">
                <EntityDialog
                  trigger="Edit"
                  triggerVariant="outline"
                  title="Edit education entry"
                  action={updateEducation.bind(null, entry.id)}
                  contentClassName="sm:max-w-xl"
                >
                  <EducationFields entry={entry} />
                </EntityDialog>
                <DeleteButton action={deleteEducation.bind(null, entry.id)} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ListPagination basePath="/admin/education" page={page} totalPages={totalPages} query={{ q }} />
      </Card>
    </div>
  );
}
