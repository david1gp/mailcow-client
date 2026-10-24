import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { PasswordPolicyDetails } from "./passwordPolicyDetails.js"
import type { PasswordPolicyGetOptions } from "./passwordPolicyGetOptionsSchema.js"
import { passwordPolicyGetOptionsSchema } from "./passwordPolicyGetOptionsSchema.js"

/**
 * `GET /get/passwordpolicy`. Empty echoes `'{}'` (returned as-is).
 */
export async function passwordPolicyGet(options: PasswordPolicyGetOptions): PromiseResult<PasswordPolicyDetails> {
  const op = "passwordPolicyGet"
  const parsed = a.safeParse(passwordPolicyGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config } = parsed.output
  return mailcowRequest<PasswordPolicyDetails>({
    config,
    method: "GET",
    path: mailcowPathApi("/get/passwordpolicy"),
  })
}
