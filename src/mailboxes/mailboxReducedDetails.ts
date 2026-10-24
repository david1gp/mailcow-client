/** Slim mailbox projection from `GET /get/mailbox/reduced` (skips rl/quota/acl enrichment). */
export type MailboxReducedDetails = {
  username: string
  domain?: string
  local_part?: string
  name?: string
  quota?: string
  active?: number
  created?: string
  modified?: string
  tags?: string[]
}
