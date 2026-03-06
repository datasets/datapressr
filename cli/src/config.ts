export interface Config {
  apiUrl: string;
  apiToken: string;
  publication: string;
}

export function loadConfig(): Config {
  const apiUrl = process.env.DATAHUB_API_URL;
  const apiToken = process.env.DATAHUB_API_TOKEN;
  const publication = process.env.DATAHUB_PUBLICATION;

  if (!apiUrl) throw new Error("DATAHUB_API_URL is not set");
  if (!apiToken) throw new Error("DATAHUB_API_TOKEN is not set");
  if (!publication) throw new Error("DATAHUB_PUBLICATION is not set");

  return { apiUrl: apiUrl.replace(/\/$/, ""), apiToken, publication };
}
