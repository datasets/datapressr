#!/usr/bin/env node
import { Command } from "commander";
import { loadConfig } from "./config.js";
import { pushCommand } from "./commands/push.js";
import { initCommand } from "./commands/init.js";
import { deleteCommand } from "./commands/delete.js";

const program = new Command();

program
  .name("datapressr")
  .description("Push datasets to DataHub Cloud")
  .version("0.1.0");

program
  .command("push <dir>")
  .description("Push a local directory as a dataset")
  .option("-n, --name <name>", "Dataset name (defaults to datapackage.json name or directory name)")
  .option("-t, --title <title>", "Dataset title")
  .option("-d, --description <desc>", "Dataset description")
  .action(async (dir: string, opts) => {
    try {
      await pushCommand(dir, opts, loadConfig());
    } catch (err) {
      console.error("Error:", err instanceof Error ? err.message : err);
      process.exit(1);
    }
  });

program
  .command("init <name>")
  .description("Create an empty dataset in the configured publication")
  .option("-t, --title <title>", "Dataset title")
  .option("-d, --description <desc>", "Dataset description")
  .action(async (name: string, opts) => {
    try {
      await initCommand(name, opts, loadConfig());
    } catch (err) {
      console.error("Error:", err instanceof Error ? err.message : err);
      process.exit(1);
    }
  });

program
  .command("delete <name>")
  .description("Delete a dataset from the configured publication")
  .action(async (name: string) => {
    try {
      await deleteCommand(name, loadConfig());
    } catch (err) {
      console.error("Error:", err instanceof Error ? err.message : err);
      process.exit(1);
    }
  });

program.parse();
