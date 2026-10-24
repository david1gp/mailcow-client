/** Attr fields for `POST /add/filter` (`functions.mailbox.inc.php:206-`). */
export type FilterAddRequest = {
  username: string
  filter_type: "prefilter" | "postfilter"
  script_data: string
  script_desc?: string
  active?: string | number
}
