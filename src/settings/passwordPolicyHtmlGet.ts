import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { PasswordPolicyHtmlGetOptions } from "./passwordPolicyHtmlGetOptionsSchema.js"
import { passwordPolicyHtmlGetOptionsSchema } from "./passwordPolicyHtmlGetOptionsSchema.js"

/**
 * `GET /get/passwordpolicy/html`. Returns an HTML fragment
 * (`password_complexity('html')`), NOT JSON — read as text.
 */
export async function passwordPolicyHtmlGet(options: PasswordPolicyHtmlGetOptions): PromiseResult<string> {
  const op = "passwordPolicyHtmlGet"
  const parsed = a.safeParse(passwordPolicyHtmlGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config } = parsed.output
  return mailcowRequest({
    config,
    method: "GET",
    path: mailcowPathApi("/get/passwordpolicy/html"),
    responseType: "text",
  })
}
