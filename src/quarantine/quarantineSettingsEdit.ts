import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { QuarantineSettingsEditOptions } from "./quarantineSettingsEditOptionsSchema.js"
import { quarantineSettingsEditOptionsSchema } from "./quarantineSettingsEditOptionsSchema.js"

/**
 * `POST /edit/quarantine` — the global (admin) quarantine settings edit,
 * distinct from the per-item {@link qitemEdit}. The router passes attr
 * straight through (`quarantine('edit', $attr)`), and the handler only runs
 * the settings branch when `action` is `'settings'`
 * (`functions.quarantine.inc.php:288`), so this op injects
 * `action: "settings"` itself — without it the server would silently do
 * nothing. Raw JSON body is `{attr}`.
 */
export async function quarantineSettingsEdit(options: QuarantineSettingsEditOptions): PromiseResult<string[]> {
  const op = "quarantineSettingsEdit"
  const parsed = a.safeParse(quarantineSettingsEditOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/edit/quarantine"),
    body: { attr: { ...bodyOmitUndefined(attr), action: "settings" } },
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
