import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import type { MailcowSearchResult } from "../client/mailcowSearchResult.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { MailboxDetails } from "./mailboxDetails.js"
import type { MailboxSearchOptions } from "./mailboxSearchOptionsSchema.js"
import { mailboxSearchOptionsSchema } from "./mailboxSearchOptionsSchema.js"

/**
 * `POST /search/mailbox`. Raw JSON body is the DataTables SSP object itself
 * (`json_api.php:1628-1673`). `columns` is required live (`count()` on
 * missing columns fatals in `ssp.class.php`), and only real DB columns may
 * be searchable — dummy SSP columns blank the whole response.
 */
export async function mailboxSearch(options: MailboxSearchOptions): PromiseResult<MailcowSearchResult<MailboxDetails>> {
  const op = "mailboxSearch"
  const parsed = a.safeParse(mailboxSearchOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, draw, start, length, search, order, columns } = parsed.output
  return mailcowRequest<MailcowSearchResult<MailboxDetails>>({
    config,
    method: "POST",
    path: mailcowPathApi("/search/mailbox"),
    body: bodyOmitUndefined({ draw, start, length, search, order, columns }),
  })
}
