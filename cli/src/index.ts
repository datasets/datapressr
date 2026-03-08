#!/usr/bin/env node
import { Command } from "commander";
import { initCommand } from "./commands/init.js";

const program = new Command();

program
  .name("datapressr")
  .description("Tools for preparing and scaffolding datasets")
  .version("0.1.0");

program
  .command("init <name>")
  .description("Scaffold a new dataset directory with datapackage.json and data/")
  .option("-t, --title <title>", "Dataset title")
  .option("-d, --description <desc>", "Dataset description")
  .action(async (name: string, opts) => {
    try {
      await initCommand(name, opts);
    } catch (err) {
      console.error("Error:", err instanceof Error ? err.message : err);
      process.exit(1);
    }
  });

program.parse();
