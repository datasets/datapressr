import { ApiClient } from "../lib/api.js";
import type { Config } from "../config.js";

export async function deleteCommand(name: string, config: Config) {
  const api = new ApiClient(config);
  await api.deleteDataset(name);
  console.log(`Deleted dataset '${name}' from publication '${config.publication}'.`);
}
