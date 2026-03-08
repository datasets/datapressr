import { mkdir, writeFile, access } from "node:fs/promises";
import { join, resolve } from "node:path";

export interface InitOptions {
  title?: string;
  description?: string;
}

export async function initCommand(name: string, opts: InitOptions) {
  const dir = resolve(name);

  // Refuse to overwrite an existing directory
  try {
    await access(dir);
    console.error(`Error: directory '${name}' already exists`);
    process.exit(1);
  } catch {
    // expected — directory doesn't exist yet
  }

  await mkdir(join(dir, "data"), { recursive: true });

  const datapackage: Record<string, string> = { name };
  if (opts.title) datapackage.title = opts.title;
  if (opts.description) datapackage.description = opts.description;

  await writeFile(
    join(dir, "datapackage.json"),
    JSON.stringify(datapackage, null, 2) + "\n",
  );

  await writeFile(join(dir, ".datahubignore"), "");

  console.log(`Created dataset '${name}' at ./${name}/`);
  console.log(`  datapackage.json`);
  console.log(`  data/`);
}
