import { asc } from "drizzle-orm";
import { db } from "@/db/client";
import { skills as skillsTable } from "@/db/schema";
import icons from "@/data/tech-icons.json";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TechIcon } from "@/components/tech-icon";
import { EntityDialog } from "@/components/admin/entity-dialog";
import { DeleteButton } from "@/components/admin/delete-button";
import { createSkill, deleteSkill, updateSkill } from "./actions";

const ICON_NAMES = Object.keys(icons).sort();

function IconSelect({ defaultValue }: { defaultValue?: string }) {
  return (
    <select
      name="icon"
      defaultValue={defaultValue}
      required
      className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <option value="" disabled>
        Choose an icon…
      </option>
      {ICON_NAMES.map((name) => (
        <option key={name} value={name}>
          {name}
        </option>
      ))}
    </select>
  );
}

function SkillFields({ skill }: { skill?: { name: string; icon: string; sortOrder: number } }) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required defaultValue={skill?.name} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="icon">Icon</Label>
        <IconSelect defaultValue={skill?.icon} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="sortOrder">Sort order</Label>
        <Input id="sortOrder" name="sortOrder" type="number" defaultValue={skill?.sortOrder ?? 0} />
      </div>
    </>
  );
}

export default async function AdminSkillsPage() {
  const skills = await db.select().from(skillsTable).orderBy(asc(skillsTable.sortOrder));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Skills</h1>
        <EntityDialog trigger="New skill" title="New skill" action={createSkill}>
          <SkillFields />
        </EntityDialog>
      </div>
      <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Icon</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Order</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {skills.map((skill) => (
            <TableRow key={skill.id}>
              <TableCell>
                <TechIcon name={skill.icon} className="size-5" />
              </TableCell>
              <TableCell>{skill.name}</TableCell>
              <TableCell>{skill.sortOrder}</TableCell>
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
      </Card>
    </div>
  );
}
