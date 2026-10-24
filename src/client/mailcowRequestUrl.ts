import type { MailcowRequestOptions } from "./mailcowRequestOptions.js"
import { mailcowRequestQueryString } from "./mailcowRequestQueryString.js"

export function mailcowRequestUrl(baseUrl: string, path: string, query?: MailcowRequestOptions["query"]): string {
  return `${baseUrl}${path}${mailcowRequestQueryString(query)}`
}
