import { ApiClient, ApiError } from "../lib/api.js";
import type { Config } from "../config.js";

export interface InitOptions {
  title?: string;
  description?: string;
}

export async function initCommand(name: string, opts: InitOptions, config: Config) {
  const api = new ApiClient(config);

  try {
    const dataset = await api.createDataset(name, opts);
    console.log(`Created dataset '${dataset.projectName}' in publication '${config.publication}'.`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 400) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
    throw err;
  }
}
