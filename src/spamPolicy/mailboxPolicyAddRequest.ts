/** Attr fields for `POST /add/mailbox-policy` (`functions.policy.inc.php:2-`). */
export type MailboxPolicyAddRequest = {
  username: string
  object_from: string
  object_list: "wl" | "bl"
}
