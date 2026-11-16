import { asc } from "drizzle-orm";
import { db } from "@/db/client";
import { projects as projectsTable } from "@/db/schema";
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
import { createProject, deleteProject, updateProject } from "./actions";

type ProjectRow = typeof projectsTable.$inferSelect;
type ProjectLink = { kind: "website" | "source" | "apiDocs"; href: string };
type Technology = { name: string; icon?: string };

function linkHref(links: unknown, kind: ProjectLink["kind"]) {
  return (links as ProjectLink[] | null)?.find((link) => link.kind === kind)?.href ?? "";
}

function technologiesText(technologies: unknown) {
  return ((technologies as Technology[] | null) ?? [])
    .map((tech) => (tech.icon ? `${tech.name}|${tech.icon}` : tech.name))
    .join("\n");
}

function imagesText(images: unknown) {
  return ((images as string[] | null) ?? []).join("\n");
}

function ProjectFields({ project }: { project?: ProjectRow }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="col-span-2 space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required defaultValue={project?.title} />
      </div>
      <div className="col-span-2 space-y-2">
        <Label htmlFor="href">Project URL</Label>
        <Input id="href" name="href" type="url" defaultValue={project?.href ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="datesFr">Dates (FR)</Label>
        <Input id="datesFr" name="datesFr" required defaultValue={project?.datesFr} placeholder="Oct. 2026 - Aujourd'hui" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="datesEn">Dates (EN)</Label>
        <Input id="datesEn" name="datesEn" required defaultValue={project?.datesEn} placeholder="Oct 2026 - Today" />
      </div>
      <div className="col-span-2 space-y-2">
        <Label htmlFor="descriptionFr">Description (FR)</Label>
        <Textarea id="descriptionFr" name="descriptionFr" required defaultValue={project?.descriptionFr} rows={3} />
      </div>
      <div className="col-span-2 space-y-2">
        <Label htmlFor="descriptionEn">Description (EN)</Label>
        <Textarea id="descriptionEn" name="descriptionEn" required defaultValue={project?.descriptionEn} rows={3} />
      </div>
      <div className="col-span-2 space-y-2">
        <Label htmlFor="technologiesText">Technologies (one per line, &quot;Name&quot; or &quot;Name|icon-key&quot;)</Label>
        <Textarea
          id="technologiesText"
          name="technologiesText"
          rows={4}
          defaultValue={project ? technologiesText(project.technologies) : ""}
          placeholder={"Laravel 13|laravel\nInertia.js"}
        />
      </div>
      <div className="col-span-2 space-y-2">
        <Label htmlFor="imagesText">Gallery images (one URL per line)</Label>
        <Textarea
          id="imagesText"
          name="imagesText"
          rows={3}
          defaultValue={project ? imagesText(project.images) : ""}
          placeholder="/my-project.webp"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="linkWebsite">Website link</Label>
        <Input id="linkWebsite" name="linkWebsite" type="url" defaultValue={project ? linkHref(project.links, "website") : ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="linkSource">Source link</Label>
        <Input id="linkSource" name="linkSource" type="url" defaultValue={project ? linkHref(project.links, "source") : ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="linkApiDocs">API docs link</Label>
        <Input id="linkApiDocs" name="linkApiDocs" type="url" defaultValue={project ? linkHref(project.links, "apiDocs") : ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="sortOrder">Sort order</Label>
        <Input id="sortOrder" name="sortOrder" type="number" defaultValue={project?.sortOrder ?? 0} />
      </div>
      <div className="col-span-2 flex items-center gap-2">
        <input
          id="active"
          name="active"
          type="checkbox"
          defaultChecked={project?.active ?? true}
          className="size-4 rounded border-input"
        />
        <Label htmlFor="active">Active (shown as ongoing)</Label>
      </div>
    </div>
  );
}

export default async function AdminProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q = "", page: pageParam } = await searchParams;
  const allProjectRows = await db.select().from(projectsTable).orderBy(asc(projectsTable.sortOrder));

  const needle = q.trim().toLowerCase();
  const filteredRows = needle
    ? allProjectRows.filter(
        (project) => project.title.toLowerCase().includes(needle) || project.datesFr.toLowerCase().includes(needle)
      )
    : allProjectRows;
  const { items: projectRows, page, totalPages } = paginate(filteredRows, Number(pageParam) || 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
        <div className="flex flex-wrap items-center gap-3 sm:flex-row-reverse">
          <EntityDialog
            trigger="New project"
            title="New project"
            action={createProject}
            contentClassName="sm:max-w-2xl max-h-[85vh] overflow-y-auto"
          >
            <ProjectFields />
          </EntityDialog>
          <ListSearch placeholder="Search projects…" />
        </div>
      </div>
      <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead className="hidden sm:table-cell">Dates</TableHead>
            <TableHead className="hidden md:table-cell">Active</TableHead>
            <TableHead className="hidden md:table-cell">Order</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projectRows.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                No projects match your search.
              </TableCell>
            </TableRow>
          )}
          {projectRows.map((project) => (
            <TableRow key={project.id}>
              <TableCell>{project.title}</TableCell>
              <TableCell className="hidden sm:table-cell">{project.datesFr}</TableCell>
              <TableCell className="hidden md:table-cell">{project.active ? "Yes" : "No"}</TableCell>
              <TableCell className="hidden md:table-cell">{project.sortOrder}</TableCell>
              <TableCell className="flex justify-end gap-2 text-right">
                <EntityDialog
                  trigger="Edit"
                  triggerVariant="outline"
                  title="Edit project"
                  action={updateProject.bind(null, project.id)}
                  contentClassName="sm:max-w-2xl max-h-[85vh] overflow-y-auto"
                >
                  <ProjectFields project={project} />
                </EntityDialog>
                <DeleteButton action={deleteProject.bind(null, project.id)} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ListPagination basePath="/admin/projects" page={page} totalPages={totalPages} query={{ q }} />
      </Card>
    </div>
  );
}
