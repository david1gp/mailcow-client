import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { RatelimitDetails } from "./ratelimitDetails.js"
import type { RatelimitMailboxGetOptions } from "./ratelimitMailboxGetOptionsSchema.js"
import { ratelimitMailboxGetOptionsSchema } from "./ratelimitMailboxGetOptionsSchema.js"

/** `GET /get/rl-mbox/{mailbox}`. */
export async function ratelimitMailboxGet(options: RatelimitMailboxGetOptions): PromiseResult<RatelimitDetails> {
  const op = "ratelimitMailboxGet"
  const parsed = a.safeParse(ratelimitMailboxGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, mailbox } = parsed.output
  return mailcowRequest<RatelimitDetails>({
    config,
    method: "GET",
    path: mailcowPathApi(`/get/rl-mbox/${encodeURIComponent(mailbox)}`),
  })
}
