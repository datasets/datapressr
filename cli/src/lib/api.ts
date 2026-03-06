import type { Config } from "../config.js";

export class ApiClient {
  constructor(private config: Config) {}

  private get authHeaders() {
    return { Authorization: `Bearer ${this.config.apiToken}` };
  }

  private get jsonHeaders() {
    return { ...this.authHeaders, "Content-Type": "application/json" };
  }

  private base(path: string) {
    return `${this.config.apiUrl}/api/v1/publications/${this.config.publication}${path}`;
  }

  async createDataset(name: string, opts?: { title?: string; description?: string }) {
    const res = await fetch(this.base("/datasets"), {
      method: "POST",
      headers: this.jsonHeaders,
      body: JSON.stringify({ name, ...opts }),
    });
    const body = await res.json();
    if (!res.ok) throw new ApiError(res.status, body);
    return body as { id: string; projectName: string };
  }

  async deleteDataset(name: string) {
    const res = await fetch(this.base(`/datasets/${name}`), {
      method: "DELETE",
      headers: this.authHeaders,
    });
    if (!res.ok && res.status !== 404) {
      throw new ApiError(res.status, await res.json().catch(() => ({})));
    }
  }

  async registerFile(
    datasetName: string,
    filePath: string,
    size: number,
    contentType: string,
    content?: string,
  ): Promise<string> {
    const body: Record<string, unknown> = { path: filePath, size, contentType };
    if (content !== undefined) body.content = content;

    const res = await fetch(this.base(`/datasets/${datasetName}/files`), {
      method: "POST",
      headers: this.jsonHeaders,
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) throw new ApiError(res.status, json);
    return (json as { uploadUrl: string }).uploadUrl;
  }

  async deleteFile(datasetName: string, filePath: string) {
    const res = await fetch(this.base(`/datasets/${datasetName}/files/${filePath}`), {
      method: "DELETE",
      headers: this.authHeaders,
    });
    if (!res.ok && res.status !== 404) {
      throw new ApiError(res.status, await res.json().catch(() => ({})));
    }
  }
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
  ) {
    const detail = typeof body === "object" && body !== null && "error" in body
      ? (body as { error: string }).error
      : JSON.stringify(body);
    super(`API ${status}: ${detail}`);
  }
}
