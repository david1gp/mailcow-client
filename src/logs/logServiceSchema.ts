import * as a from "valibot"

export const logServiceSchema = a.picklist([
  "dovecot",
  "ratelimited",
  "netfilter",
  "cron",
  "postfix",
  "autodiscover",
  "sogo",
  "ui",
  "sasl",
  "watchdog",
  "acme",
  "api",
  "rspamd-history",
])

export type LogService = a.InferInput<typeof logServiceSchema>
