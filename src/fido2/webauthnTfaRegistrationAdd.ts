import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import { fido2ResultSchema } from "./fido2ResultSchema.js"
import type { WebauthnTfaRegistrationAddOptions } from "./webauthnTfaRegistrationAddOptionsSchema.js"
import { webauthnTfaRegistrationAddOptionsSchema } from "./webauthnTfaRegistrationAddOptionsSchema.js"

/**
 * `POST /add/webauthn-tfa-registration`. The router reads the raw JSON body
 * (`clientDataJSON`, `attestationObject`, plus `tfa_method`, `key_id`,
 * `confirm_password`), NOT `{attr, items}` (`json_api.php:189-233`), and
 * answers bare `{success, msg?}` JSON — never an envelope. `success: false`
 * maps to a `ResultErr`. Session-only: requires a UI session cookie, an API
 * key is unusable.
 */
export async function webauthnTfaRegistrationAdd(options: WebauthnTfaRegistrationAddOptions): PromiseResult<true> {
  const op = "webauthnTfaRegistrationAdd"
  const parsed = a.safeParse(webauthnTfaRegistrationAddOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...registration } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/add/webauthn-tfa-registration"),
    body: bodyOmitUndefined(registration),
  })
  if (!requested.success) return requested
  const resultParsed = a.safeParse(fido2ResultSchema, requested.data)
  if (!resultParsed.success) {
    return createResultError(op, `Invalid fido2 result: ${a.summarize(resultParsed.issues)}`)
  }
  if (!resultParsed.output.success) {
    const msg =
      typeof resultParsed.output.msg === "string" ? resultParsed.output.msg : JSON.stringify(resultParsed.output.msg)
    return createResultError(op, msg ?? "webauthn tfa registration failed")
  }
  return createResult(true as const)
}
