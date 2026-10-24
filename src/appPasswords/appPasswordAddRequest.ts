import type { AppPasswordProtocol } from "./appPasswordProtocol.js"

/** Attr fields for `POST /add/app-passwd` (`functions.app_passwd.inc.php:24-`). */
export type AppPasswordAddRequest = {
  username: string
  app_name: string
  app_passwd: string
  app_passwd2: string
  active?: string | number
  protocols?: AppPasswordProtocol[]
}
