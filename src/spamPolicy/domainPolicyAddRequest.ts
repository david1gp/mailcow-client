/** Attr fields for `POST /add/domain-policy` (`functions.policy.inc.php:2-`). */
export type DomainPolicyAddRequest = {
  domain: string
  object_from: string
  object_list: "wl" | "bl"
}
