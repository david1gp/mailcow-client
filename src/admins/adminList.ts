import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { mailcowListNormalize } from "../client/mailcowListNormalize.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { AdminDetails } from "./adminDetails.js"
import type { AdminListOptions } from "./adminListOptionsSchema.js"
import { adminListOptionsSchema } from "./adminListOptionsSchema.js"

/** `GET /get/admin/all`. Empty lists echo `{}` — normalized to `[]`. */
export async function adminList(options: AdminListOptions): PromiseResult<AdminDetails[]> {
  const op = "adminList"
  const parsed = a.safeParse(adminListOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config } = parsed.output
  const requested = await mailcowRequest<unknown>({
    config,
    method: "GET",
    path: mailcowPathApi("/get/admin/all"),
  })
  if (!requested.success) return requested
  return createResult(mailcowListNormalize<AdminDetails>(requested.data))
}
