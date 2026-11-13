/**
 * Extracts only the tech icons referenced in src/data/resume.tsx from
 * `tech-stack-icons` (an 8 MB module with every icon inlined) into static
 * files under public/icons/, plus a small manifest. Re-run after adding a
 * skill or technology:  npm run icons
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const outDir = path.join(root, "public", "icons");
const manifestPath = path.join(root, "src", "data", "tech-icons.json");
// Icons above this size embed raster data; they are converted to small WebP.
const MAX_SVG_BYTES = 40_000;

const lib = fs.readFileSync(
  path.join(root, "node_modules", "tech-stack-icons", "dist", "index.js"),
  "utf8"
);
const start = lib.indexOf("var f=") + "var f=".length;
const end = lib.indexOf(";var h=f;");
if (start < 6 || end < 0) throw new Error("Unexpected tech-stack-icons bundle format");
const icons = new Function(`return ${lib.slice(start, end)}`)();

const resume = fs.readFileSync(path.join(root, "src", "data", "resume.tsx"), "utf8");
const names = [...new Set([...resume.matchAll(/icon: "([a-z0-9]+)"/g)].map((m) => m[1]))].sort();

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

async function write(name, variant, svg) {
  const base = variant === "dark" ? `${name}-dark` : name;
  if (Buffer.byteLength(svg) <= MAX_SVG_BYTES) {
    fs.writeFileSync(path.join(outDir, `${base}.svg`), svg);
    return `/icons/${base}.svg`;
  }
  await sharp(Buffer.from(svg), { density: 144 })
    .resize(64, 64)
    .webp({ quality: 90 })
    .toFile(path.join(outDir, `${base}.webp`));
  return `/icons/${base}.webp`;
}

const manifest = {};
for (const name of names) {
  const icon = icons[name];
  if (!icon) {
    console.warn(`! icon "${name}" not found in tech-stack-icons`);
    continue;
  }
  const { light, dark } = icon.svg;
  manifest[name] = { light: await write(name, "light", light) };
  if (dark && dark !== light) manifest[name].dark = await write(name, "dark", dark);
}

fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`✓ ${Object.keys(manifest).length} icons → public/icons, manifest → src/data/tech-icons.json`);
