import { asc } from "drizzle-orm";
import { db } from "@/db/client";
import { workExperiences as workTable } from "@/db/schema";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EntityDialog } from "@/components/admin/entity-dialog";
import { DeleteButton } from "@/components/admin/delete-button";
import { ListSearch } from "@/components/admin/list-search";
import { ListPagination } from "@/components/admin/list-pagination";
import { paginate } from "@/lib/paginate";
import { createWorkExperience, deleteWorkExperience, updateWorkExperience } from "./actions";

type WorkRow = typeof workTable.$inferSelect;

function WorkFields({ work }: { work?: WorkRow }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="col-span-2 space-y-2">
        <Label htmlFor="company">Company</Label>
        <Input id="company" name="company" required defaultValue={work?.company} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="titleFr">Title (FR)</Label>
        <Input id="titleFr" name="titleFr" required defaultValue={work?.titleFr} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="titleEn">Title (EN)</Label>
        <Input id="titleEn" name="titleEn" required defaultValue={work?.titleEn} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="locationFr">Location (FR)</Label>
        <Input id="locationFr" name="locationFr" required defaultValue={work?.locationFr} placeholder="Temps plein" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="locationEn">Location (EN)</Label>
        <Input id="locationEn" name="locationEn" required defaultValue={work?.locationEn} placeholder="Full time" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="startFr">Start (FR)</Label>
        <Input id="startFr" name="startFr" required defaultValue={work?.startFr} placeholder="Mai 2024" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="startEn">Start (EN)</Label>
        <Input id="startEn" name="startEn" required defaultValue={work?.startEn} placeholder="May 2024" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="endFr">End (FR)</Label>
        <Input id="endFr" name="endFr" required defaultValue={work?.endFr} placeholder="Aujourd'hui" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="endEn">End (EN)</Label>
        <Input id="endEn" name="endEn" required defaultValue={work?.endEn} placeholder="Today" />
      </div>
      <div className="col-span-2 space-y-2">
        <Label htmlFor="href">Link (optional)</Label>
        <Input id="href" name="href" type="url" defaultValue={work?.href ?? ""} />
      </div>
      <div className="col-span-2 space-y-2">
        <Label htmlFor="logoUrl">Logo URL</Label>
        <Input id="logoUrl" name="logoUrl" defaultValue={work?.logoUrl ?? ""} />
      </div>
      <div className="col-span-2 space-y-2">
        <Label htmlFor="descriptionFr">Description (FR)</Label>
        <Textarea id="descriptionFr" name="descriptionFr" required rows={3} defaultValue={work?.descriptionFr} />
      </div>
      <div className="col-span-2 space-y-2">
        <Label htmlFor="descriptionEn">Description (EN)</Label>
        <Textarea id="descriptionEn" name="descriptionEn" required rows={3} defaultValue={work?.descriptionEn} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="sortOrder">Sort order</Label>
        <Input id="sortOrder" name="sortOrder" type="number" defaultValue={work?.sortOrder ?? 0} />
      </div>
    </div>
  );
}

export default async function AdminWorkPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q = "", page: pageParam } = await searchParams;
  const allWorkRows = await db.select().from(workTable).orderBy(asc(workTable.sortOrder));

  const needle = q.trim().toLowerCase();
  const filteredRows = needle
    ? allWorkRows.filter(
        (work) => work.company.toLowerCase().includes(needle) || work.titleFr.toLowerCase().includes(needle)
      )
    : allWorkRows;
  const { items: workRows, page, totalPages } = paginate(filteredRows, Number(pageParam) || 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Work experience</h1>
        <div className="flex flex-wrap items-center gap-3 sm:flex-row-reverse">
          <EntityDialog
            trigger="New experience"
            title="New work experience"
            action={createWorkExperience}
            contentClassName="sm:max-w-2xl max-h-[85vh] overflow-y-auto"
          >
            <WorkFields />
          </EntityDialog>
          <ListSearch placeholder="Search work experience…" />
        </div>
      </div>
      <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Period</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workRows.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                No entries match your search.
              </TableCell>
            </TableRow>
          )}
          {workRows.map((work) => (
            <TableRow key={work.id}>
              <TableCell>{work.company}</TableCell>
              <TableCell>{work.titleFr}</TableCell>
              <TableCell>
                {work.startFr} – {work.endFr}
              </TableCell>
              <TableCell className="flex justify-end gap-2 text-right">
                <EntityDialog
                  trigger="Edit"
                  triggerVariant="outline"
                  title="Edit work experience"
                  action={updateWorkExperience.bind(null, work.id)}
                  contentClassName="sm:max-w-2xl max-h-[85vh] overflow-y-auto"
                >
                  <WorkFields work={work} />
                </EntityDialog>
                <DeleteButton action={deleteWorkExperience.bind(null, work.id)} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ListPagination basePath="/admin/work" page={page} totalPages={totalPages} query={{ q }} />
      </Card>
    </div>
  );
}
