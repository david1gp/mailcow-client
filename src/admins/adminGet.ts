import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { AdminDetails } from "./adminDetails.js"
import type { AdminGetOptions } from "./adminGetOptionsSchema.js"
import { adminGetOptionsSchema } from "./adminGetOptionsSchema.js"

/** `GET /get/admin/{username}`. */
export async function adminGet(options: AdminGetOptions): PromiseResult<AdminDetails> {
  const op = "adminGet"
  const parsed = a.safeParse(adminGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, username } = parsed.output
  return mailcowRequest<AdminDetails>({
    config,
    method: "GET",
    path: mailcowPathApi(`/get/admin/${encodeURIComponent(username)}`),
  })
}
