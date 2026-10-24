import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { Fido2RegistrationAddOptions } from "./fido2RegistrationAddOptionsSchema.js"
import { fido2RegistrationAddOptionsSchema } from "./fido2RegistrationAddOptionsSchema.js"
import { fido2ResultSchema } from "./fido2ResultSchema.js"

/**
 * `POST /add/fido2-registration`. The router reads the raw JSON body
 * (`clientDataJSON`, `attestationObject`), NOT `{attr, items}`
 * (`json_api.php:155-187`), and answers bare `{success, msg?}` JSON — never
 * an envelope. `success: false` maps to a `ResultErr`. Session-only:
 * requires a UI session cookie, an API key is unusable.
 */
export async function fido2RegistrationAdd(options: Fido2RegistrationAddOptions): PromiseResult<true> {
  const op = "fido2RegistrationAdd"
  const parsed = a.safeParse(fido2RegistrationAddOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, clientDataJSON, attestationObject } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/add/fido2-registration"),
    body: { clientDataJSON, attestationObject },
  })
  if (!requested.success) return requested
  const resultParsed = a.safeParse(fido2ResultSchema, requested.data)
  if (!resultParsed.success) {
    return createResultError(op, `Invalid fido2 result: ${a.summarize(resultParsed.issues)}`)
  }
  if (!resultParsed.output.success) {
    const msg =
      typeof resultParsed.output.msg === "string" ? resultParsed.output.msg : JSON.stringify(resultParsed.output.msg)
    return createResultError(op, msg ?? "fido2 registration failed")
  }
  return createResult(true as const)
}
