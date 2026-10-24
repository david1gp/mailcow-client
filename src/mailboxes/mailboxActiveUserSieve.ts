/** One active sieve script entry from `GET /get/active-user-sieve/{mailbox}` (list of `script_data`). */
export type MailboxActiveUserSieve = {
  script_data?: string
  script_name?: string
}
