import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { StatusContainerDetails } from "./statusContainerDetails.js"
import type { StatusContainersListOptions } from "./statusContainersListOptionsSchema.js"
import { statusContainersListOptionsSchema } from "./statusContainersListOptionsSchema.js"

/**
 * `GET /get/status/containers`. Admin-only in the router
 * (`$_SESSION['mailcow_cc_role'] == "admin"`, `json_api.php:1461`); API keys
 * are admin-scoped, so this works with an rw/ro key. Returns an object keyed
 * by container name, not an array.
 */
export async function statusContainersList(
  options: StatusContainersListOptions,
): PromiseResult<Record<string, StatusContainerDetails>> {
  const op = "statusContainersList"
  const parsed = a.safeParse(statusContainersListOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config } = parsed.output
  return mailcowRequest<Record<string, StatusContainerDetails>>({
    config,
    method: "GET",
    path: mailcowPathApi("/get/status/containers"),
  })
}
