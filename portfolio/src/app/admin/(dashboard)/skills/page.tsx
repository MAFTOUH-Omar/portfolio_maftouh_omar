import { asc } from "drizzle-orm";
import { db } from "@/db/client";
import { skills as skillsTable } from "@/db/schema";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TechIcon } from "@/components/tech-icon";
import { EntityDialog } from "@/components/admin/entity-dialog";
import { DeleteButton } from "@/components/admin/delete-button";
import { IconPicker } from "@/components/admin/icon-picker";
import { ListSearch } from "@/components/admin/list-search";
import { ListPagination } from "@/components/admin/list-pagination";
import { paginate } from "@/lib/paginate";
import { createSkill, deleteSkill, updateSkill } from "./actions";

function SkillFields({ skill }: { skill?: { name: string; icon: string; sortOrder: number } }) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required defaultValue={skill?.name} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="icon">Icon</Label>
        <IconPicker name="icon" defaultValue={skill?.icon} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="sortOrder">Sort order</Label>
        <Input id="sortOrder" name="sortOrder" type="number" defaultValue={skill?.sortOrder ?? 0} />
      </div>
    </>
  );
}

export default async function AdminSkillsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q = "", page: pageParam } = await searchParams;
  const allSkills = await db.select().from(skillsTable).orderBy(asc(skillsTable.sortOrder));

  const needle = q.trim().toLowerCase();
  const filtered = needle ? allSkills.filter((skill) => skill.name.toLowerCase().includes(needle)) : allSkills;
  const { items: skills, page, totalPages } = paginate(filtered, Number(pageParam) || 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Skills</h1>
        <div className="flex flex-wrap items-center gap-3 sm:flex-row-reverse">
          <EntityDialog trigger="New skill" title="New skill" action={createSkill}>
            <SkillFields />
          </EntityDialog>
          <ListSearch placeholder="Search skills…" />
        </div>
      </div>
      <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Icon</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="hidden sm:table-cell">Order</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {skills.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                No skills match your search.
              </TableCell>
            </TableRow>
          )}
          {skills.map((skill) => (
            <TableRow key={skill.id}>
              <TableCell>
                <TechIcon name={skill.icon} className="size-5" />
              </TableCell>
              <TableCell>{skill.name}</TableCell>
              <TableCell className="hidden sm:table-cell">{skill.sortOrder}</TableCell>
              <TableCell className="flex justify-end gap-2 text-right">
                <EntityDialog
                  trigger="Edit"
                  triggerVariant="outline"
                  title="Edit skill"
                  action={updateSkill.bind(null, skill.id)}
                >
                  <SkillFields skill={skill} />
                </EntityDialog>
                <DeleteButton action={deleteSkill.bind(null, skill.id)} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ListPagination basePath="/admin/skills" page={page} totalPages={totalPages} query={{ q }} />
      </Card>
    </div>
  );
}
