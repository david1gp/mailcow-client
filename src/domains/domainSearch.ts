import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import type { MailcowSearchResult } from "../client/mailcowSearchResult.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { DomainDetails } from "./domainDetails.js"
import type { DomainSearchOptions } from "./domainSearchOptionsSchema.js"
import { domainSearchOptionsSchema } from "./domainSearchOptionsSchema.js"

/**
 * `POST /search/domain`. Raw JSON body is the DataTables SSP object itself
 * (`SSP::simple($requestDecoded, ...)`, `json_api.php:1581-1626`). `columns`
 * is required live (`count()` on missing columns fatals in `ssp.class.php`),
 * and only real DB columns may be searchable — dummy SSP columns (e.g.
 * `stats`) reference nonexistent fields and blank the whole response. Rows
 * are `domain_details` (`domain_name`, not `domain`).
 */
export async function domainSearch(options: DomainSearchOptions): PromiseResult<MailcowSearchResult<DomainDetails>> {
  const op = "domainSearch"
  const parsed = a.safeParse(domainSearchOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, draw, start, length, search, order, columns } = parsed.output
  return mailcowRequest<MailcowSearchResult<DomainDetails>>({
    config,
    method: "POST",
    path: mailcowPathApi("/search/domain"),
    body: bodyOmitUndefined({ draw, start, length, search, order, columns }),
  })
}
