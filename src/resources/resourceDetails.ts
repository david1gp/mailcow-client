/** Resource details row (`mailbox get resource_details`, `functions.mailbox.inc.php:5423-`). */
export type ResourceDetails = {
  name: string
  domain?: string
  kind?: string
  description?: string
  active?: number
  multiple_bookings?: number
}
