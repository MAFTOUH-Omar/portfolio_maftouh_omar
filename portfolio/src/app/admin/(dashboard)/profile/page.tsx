import { db } from "@/db/client";
import { profile as profileTable } from "@/db/schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ProfileForm } from "./profile-form";

type StoredSocial = Record<string, { url: string; navbar: boolean }>;

export default async function AdminProfilePage() {
  const [row] = await db.select().from(profileTable).limit(1);
  if (!row) {
    return <p className="text-sm text-destructive">Profile is not seeded yet.</p>;
  }
  const social = row.social as StoredSocial;

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold">Profile</h1>
      <ProfileForm>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Display name</Label>
            <Input id="name" name="name" required defaultValue={row.name} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" name="fullName" required defaultValue={row.fullName} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="givenName">Given name</Label>
            <Input id="givenName" name="givenName" required defaultValue={row.givenName} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="familyName">Family name</Label>
            <Input id="familyName" name="familyName" required defaultValue={row.familyName} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="initials">Initials</Label>
            <Input id="initials" name="initials" required defaultValue={row.initials} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="avatarUrl">Avatar URL</Label>
            <Input id="avatarUrl" name="avatarUrl" required defaultValue={row.avatarUrl} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="roleFr">Role (FR)</Label>
            <Input id="roleFr" name="roleFr" required defaultValue={row.roleFr} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="roleEn">Role (EN)</Label>
            <Input id="roleEn" name="roleEn" required defaultValue={row.roleEn} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="descriptionFr">Description (FR)</Label>
          <Textarea id="descriptionFr" name="descriptionFr" required rows={2} defaultValue={row.descriptionFr} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="descriptionEn">Description (EN)</Label>
          <Textarea id="descriptionEn" name="descriptionEn" required rows={2} defaultValue={row.descriptionEn} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="summaryFr">Summary (FR)</Label>
          <Textarea id="summaryFr" name="summaryFr" required rows={4} defaultValue={row.summaryFr} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="summaryEn">Summary (EN)</Label>
          <Textarea id="summaryEn" name="summaryEn" required rows={4} defaultValue={row.summaryEn} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="locationFr">Location (FR)</Label>
            <Input id="locationFr" name="locationFr" required defaultValue={row.locationFr} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="locationEn">Location (EN)</Label>
            <Input id="locationEn" name="locationEn" required defaultValue={row.locationEn} />
          </div>
          <div className="col-span-2 space-y-2">
            <Label htmlFor="locationLink">Location link</Label>
            <Input id="locationLink" name="locationLink" required defaultValue={row.locationLink} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="addressLocality">City</Label>
            <Input id="addressLocality" name="addressLocality" required defaultValue={row.addressLocality} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="addressRegion">Region</Label>
            <Input id="addressRegion" name="addressRegion" required defaultValue={row.addressRegion} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="addressCountry">Country code</Label>
            <Input id="addressCountry" name="addressCountry" required defaultValue={row.addressCountry} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactEmail">Contact email</Label>
            <Input id="contactEmail" name="contactEmail" type="email" required defaultValue={row.contactEmail} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactTel">Contact phone</Label>
            <Input id="contactTel" name="contactTel" defaultValue={row.contactTel ?? ""} />
          </div>
        </div>

        <div className="space-y-3 rounded-lg border p-4">
          <p className="text-sm font-medium">Social links</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="githubUrl">GitHub URL</Label>
              <Input id="githubUrl" name="githubUrl" defaultValue={social.GitHub?.url ?? ""} />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                id="githubNavbar"
                name="githubNavbar"
                type="checkbox"
                defaultChecked={social.GitHub?.navbar ?? true}
                className="size-4 rounded border-input"
              />
              <Label htmlFor="githubNavbar">Show in navbar</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
              <Input id="linkedinUrl" name="linkedinUrl" defaultValue={social.LinkedIn?.url ?? ""} />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                id="linkedinNavbar"
                name="linkedinNavbar"
                type="checkbox"
                defaultChecked={social.LinkedIn?.navbar ?? true}
                className="size-4 rounded border-input"
              />
              <Label htmlFor="linkedinNavbar">Show in navbar</Label>
            </div>
          </div>
        </div>
      </ProfileForm>
    </div>
  );
}
