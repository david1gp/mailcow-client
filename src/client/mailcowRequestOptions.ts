import type { MailcowClientConfig } from "./mailcowClientConfigSchema.js"

export type MailcowRequestOptions = {
  config: MailcowClientConfig
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  path: string
  query?: Record<string, string | number | boolean | readonly string[] | undefined | null>
  body?: unknown
  /** "json" (default) | "bytes" | "text" | "void" */
  responseType?: "json" | "bytes" | "text" | "void"
  headers?: Record<string, string>
}
