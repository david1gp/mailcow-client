# mailcow REST API Inventory (from source)

- Upstream: `~/opensource/mailcow`, tag `2026-10`, commit `55982ac7`
- Router: `data/web/json_api.php` (2094 lines — read fully)
- Schemas cross-checked: `data/web/api/openapi.yaml` (66 path keys, 96 operations)
- Handlers: `data/web/inc/functions.*.inc.php` (bodies opened for every cited claim)
- Base path: `/api/v1/{add,get,edit,delete,search}/...`
- Transport: `add`/`edit`/`delete`/`search` accept ONLY `POST` (`json_api.php:145-152,1567-1574,1717-1724,1873-1880`);
  `get` accepts ONLY `GET` (`json_api.php:358-365`). Wrong method → `405 {"type":"error","msg":"only ... method is allowed"}`.
- POST bodies: form-encoded `attr`/`items` JSON strings, or raw `application/json`
  (`add` → `$_POST['attr']`, `edit` → `attr`+`items`, `delete` → `items`; `json_api.php:65-99`).
- Auth legend: `key[rw]` = API key with rw access (ro key → `403 API read/write access denied`,
  `json_api.php:110,1685,1839`); `key[ro+]` = any active API key (ro included) or logged-in session;
  `admin` = `mailcow_cc_role == admin` enforced in router; `session` = session-cookie ceremony, no API key use.
  API keys always assume `role=admin` (`inc/sessions.inc.php:61-62`); session cookies keep real
  `user`/`domainadmin`/`admin` roles with handler-level scoping (`hasMailboxObjectAccess`, `hasDomainAccess`).
- Response legend: `env` = `[{"type":"success|danger|...","msg":[...]}]` envelope (`json_api.php:118-133`);
  `obj` = single JSON object or `{}` when empty; `list` = JSON array or `{}`/`[]` when empty
  (`process_get_return`, `json_api.php:348-356`). `msg` is string or `[key, detail]` array.

## 1. Domains

| Method+Path | Auth | Request (attr) | Response |
|---|---|---|---|
| POST `/add/domain` | key[rw] | `domain` string FQDN req; `description`,`aliases`,`mailboxes`,`defquota`,`maxquota`,`quota` MiB ints, `backupmx`,`gal`,`relay_all_recipients`,`relay_unknown_only`,`active` 0/1, `tags`[], `rl_value` int+`rl_frame` s/m/h/d, `dkim_selector`,`key_size`, `restart_sogo` int (`functions.mailbox.inc.php:502-671`, yaml `/add/domain`) | env, `msg:[domain_added,...]` |
| POST `/add/domain/template` | key[rw] | `template` name req + same fields as add/domain, stored as JSON (`functions.mailbox.inc.php:1648-1718`) | env |
| GET `/get/domain/all[?tags=a,b]` | key[ro+] | query `tags` optional CSV filter | list of domain_details |
| GET `/get/domain/template/all` | key[ro+] | — | list of `{id,template,attributes:{...}}` |
| GET `/get/domain/template/{id}` | key[ro+] | — | obj `{id,template,attributes}` (`functions.mailbox.inc.php:5164`) |
| GET `/get/domain/{domain}` | key[ro+] | — | obj domain_details: `domain,description,aliases,mailboxes,maxquota,quota,defquota,backupmx,gal,relay_*,active,tags_domain[],relayhost,quota_used,bytes_total,msgs_total,...` (SQL `functions.mailbox.inc.php:5033-5164`) |
| POST `/edit/domain` | key[rw] | items:[domains] + attr: any of `description,aliases,mailboxes,quota,maxquota,defquota,active,backupmx,gal,relay_*,tags[],relayhost` (`functions.mailbox.inc.php:2839-3050`) | env |
| POST `/edit/domain/template` | key[rw] | items:[ids] + attr template fields (`functions.mailbox.inc.php:3058-`) | env |
| POST `/edit/domain/footer` | key[rw] | items:[domains] + attr `html,plain,mbox_exclude,alias_domain_exclude,skip_replies` (cols `functions.mailbox.inc.php:4263`) | env |
| POST `/delete/domain` | key[rw] | items:[domains] (`functions.mailbox.inc.php:5836-`) | env |
| POST `/delete/domain/template` | key[rw] | items:[ids] | env |
| POST `/delete/domain/tag/{domain}` | key[rw] | items:[tag names] (`json_api.php:1773-1774`) | env |
| POST `/search/domain` | key[ro+] admin/domainadmin only | DataTables SSP JSON (`draw,start,length,search,order,columns`); role-scoped (`json_api.php:1581-1626`, `inc/lib/ssp.class.php`) | `{draw,recordsTotal,recordsFiltered,data:[domain_details...]}` |

## 2. Mailboxes

| Method+Path | Auth | Request | Response |
|---|---|---|---|
| POST `/add/mailbox` | key[rw] | `local_part`,`domain`,`password`,`password2` req; `name`,`quota` MiB,`active`,`force_pw_update`,`force_tfa`,`tls_enforce_in/out`,`sogo_access`,`imap_access`,`pop3_access`,`smtp_access`,`sieve_access`,`eas_access`,`dav_access` 0/1, `relayhost` 0/1, `quarantine_notification` (hourly/daily/weekly/never),`quarantine_category`, `tags`[], `protocol_access`, `attribute_hash`, `rl_value/rl_frame`, `authsource` (mailcow/ldap/keycloak...), `template` (`functions.mailbox.inc.php:1049-1450`, yaml) | env |
| POST `/add/mailbox/template` | key[rw] | `template` name + mailbox fields (`functions.mailbox.inc.php:1718-`) | env |
| GET `/get/mailbox/all[/{domains}][?tags=]` | key[ro+] | optional comma domains, `?tags=` CSV | list of mailbox_details |
| GET `/get/mailbox/reduced[/{domains}]` | key[ro+] | same scoping, slim projection (`json_api.php:966-990`, `mailbox_details` `$object=reduced`) | list, reduced fields |
| GET `/get/mailbox/template/all`, `/get/mailbox/template/{id}` | key[ro+] | — | list / obj `{id,template,attributes}` |
| GET `/get/mailbox/{id}` | key[ro+] | id = address, or domain + `?tags=` for per-domain listing (`json_api.php:1001-1019`) | obj mailbox_details: `username,domain,local_part,name,quota,active,created,modified,attributes{...},tags_mailbox[],quota_used/percent,last_mail_login,messages,...` (SQL `functions.mailbox.inc.php:5201-5370`) |
| POST `/edit/mailbox` | key[rw] | items:[usernames] + attr: `name,password/password2,quota,active,force_pw_update,force_tfa,*_access(8),relayhost,tags[],sender_acl[],extended_sender_acl,authsource,pw_recovery_email,attribute_hash,protocol_access` + sub-edits below (`functions.mailbox.inc.php:3148-3800`) | env |
| POST `/edit/mailbox/template` | key[rw] | items:[ids] + attr | env |
| POST `/edit/mailbox/custom-attribute` | key[rw] | items:[mailboxes] + attr custom key/values (`functions.mailbox.inc.php:3920-`) | env |
| POST `/edit/rename-mbox` | key[rw] | items (old mbox) + attr `new_local_part` (+`domain`,`create_alias`; `functions.mailbox.inc.php:3420-3600`) | env |
| POST `/edit/user-acl` | key[rw] | items:[usernames] + attr `user_acl` map incl `spam_alias,syncjobs,filters,app_passwds,pushover,eas_reset,sogo_profile_reset,pw_reset,quarantine[_attachments],spam_score,spam_policy,delimiter_action,tls_policy,sender_acl,tag_handling,...` (`functions.acl.inc.php`, yaml) | env |
| POST `/edit/spam-score` | key[rw] | items:[mailboxes] + attr `spam_score` int, `tagged_mail_handler` (subject/tag_header), `spam_policy` (`functions.mailbox.inc.php:2081-,3148-`) | env |
| GET `/get/spam-score/{mailbox}` | key[ro+] | — | obj `{score}` whitespace-stripped (`json_api.php:1529-1534`) |
| POST `/edit/delimiter_action` | key[rw] | items + attr `tagged_mail_handler` (`functions.mailbox.inc.php:2209-`) | env |
| POST `/edit/tls_policy` | key[rw] | items + attr `tls_policy` (`functions.mailbox.inc.php:1909-`) | env |
| POST `/edit/quarantine_notification` | key[rw] | items + attr `quarantine_notification` (`functions.mailbox.inc.php:1963-`) | env |
| POST `/edit/quarantine_category` | key[rw] | items + attr `quarantine_category` (`functions.mailbox.inc.php:2022-`) | env |
| POST `/edit/pushover` | key[rw] | items:[usernames] + attr `key,token,title,text,sound,senders,senders_regex,only_x_prio,evaluate_x_prio,active` (`functions.pushover.inc.php`) | env |
| POST `/edit/pushover-test` | key[rw] | items + attr `title,text` | env (test push) |
| GET `/get/active-user-sieve/{mailbox}` | key[ro+] | — | list with sieve `script_data` (`functions.mailbox.inc.php:4574-`) |
| GET `/get/bcc-destination-options` | key[ro+] | — | obj `{domains[],mailboxes{...},alias_domains[]}` (`json_api.php:1022-1048`) |
| GET `/get/last-login/{user}[/{days}]` | key[ro+] | days int default 7 (`json_api.php:703-713`) | obj `{sasl:[{real_rip,datetime,service,app_password_name,location?}], ui_logins?...}` (SQL `functions.inc.php:323-`) |
| GET `/get/reset-last-login/{user}` | key[ro+] | — (router Todo: move to delete; `json_api.php:716-722`; the `get`-action method gate enforces GET, `json_api.php:358-365`, so POST answers 405) | env-ish via `process_get_return` |
| POST `/delete/mailbox` | key[rw] | items:[usernames] | env |
| POST `/delete/mailbox/template` | key[rw] | items:[ids] | env |
| POST `/delete/mailbox/tag/{mailbox}` | key[rw] | items:[tags], extra=mailbox (`json_api.php:1788-1789`) | env |
| POST `/delete/eas_cache` | key[rw] | items:[usernames] (purge SOGo EAS cache) | env |
| POST `/delete/sogo_profile` | key[rw] | items:[usernames] (wipe SOGo profile) | env |
| POST `/search/mailbox` | key[ro+] admin/domainadmin | DataTables SSP JSON, kind-filtered (`json_api.php:1628-1673`) | `{draw,...,data:[mailbox_details...]}` |

## 3. Aliases (incl. time-limited / spam aliases)

| Method+Path | Auth | Request | Response |
|---|---|---|---|
| POST `/add/alias` | key[rw] | `address`,`goto` (CSV) req; `active`,`goto_spam/goto_ham/goto_null` 0/1 (only one goto_*), `sogo_visible`,`private_comment`,`public_comment` (`functions.mailbox.inc.php:700-920`, yaml) | env `msg:[alias_added,address]` |
| GET `/get/alias/all[/{domains}]` | key[ro+] | optional comma domains | list alias_details |
| GET `/get/alias/{address}` | key[ro+] | — | obj `address,goto,active,domain,created,modified,private_comment,public_comment,sogo_visible,sender_allowed,...` (`functions.mailbox.inc.php:4866-4920`) |
| POST `/edit/alias` | key[rw] | items:[ids] + attr alias fields | env |
| POST `/delete/alias` | key[rw] | items:[ids] | env |
| POST `/add/time_limited_alias` | key[rw] | `username`,`domain` req; `validity` hours 1-87600, `permanent` bool, `description` (row: `address,description,goto,validity,permanent`; `functions.mailbox.inc.php:19-90`, yaml) | env |
| GET `/get/time_limited_aliases/{mailbox}` | key[ro+] | — | list (`functions.mailbox.inc.php:4736-`) |
| POST `/edit/time_limited_alias` | key[rw] | items:[addresses] + attr `validity,permanent,tagged_mail_handler` (`functions.mailbox.inc.php:2156-2290`) | env |
| POST `/delete/time_limited_alias` | key[rw] | items:[addresses] | env |

## 4. Alias domains

| Method+Path | Auth | Request | Response |
|---|---|---|---|
| POST `/add/alias-domain` | key[rw] | `alias_domain`,`target_domain` req; `active`,`rl_value/rl_frame`,`key_size`,`dkim_selector` (`functions.mailbox.inc.php:921-1048`) | env |
| GET `/get/alias-domain/all` | key[ro+] | — | list alias_domain_details |
| GET `/get/alias-domain/{domain}` | key[ro+] | — | obj `alias_domain,target_domain,active,created,modified,...` (`functions.mailbox.inc.php:4920-4986`) |
| POST `/edit/alias-domain` | key[rw] | items:[alias_domains] + attr `target_domain,active` (`functions.mailbox.inc.php:1852-`) | env |
| POST `/delete/alias-domain` | key[rw] | items:[alias_domains] (`functions.mailbox.inc.php:5917-`) | env |

## 5. Resources (meeting rooms/equipment)

| Method+Path | Auth | Request | Response |
|---|---|---|---|
| POST `/add/resource` | key[rw] | `name`?/`domain`,`kind`,`description` req-ish; `active`,`multiple_bookings` (+`multiple_bookings_custom/select`) (yaml; `functions.mailbox.inc.php:1533-1648`) | env |
| GET `/get/resource/all` | key[ro+] | — | list resource_details |
| GET `/get/resource/{name}` | key[ro+] | — | obj (`functions.mailbox.inc.php:5423-`) |
| POST `/edit/resource` | key[rw] | items:[names] + attr `description,active,kind,multiple_bookings,...` (`functions.mailbox.inc.php:4095-4290`) | env |
| POST `/delete/resource` | key[rw] | items:[names] (`functions.mailbox.inc.php:6209-`) | env |

## 6. Domain admins (+SSO)

| Method+Path | Auth | Request | Response |
|---|---|---|---|
| POST `/add/domain-admin` | key[rw] | `username`,`password`,`password2`,`domains`[] req; `active` (`functions.domain_admin.inc.php:2-`, yaml) | env `msg:[domain_admin_added,...]` |
| GET `/get/domain-admin/all` | key[ro+] | — | list `{username,active,domains[]}` |
| GET `/get/domain-admin/{username}` | key[ro+] | — | obj details |
| POST `/edit/domain-admin` | key[rw] | items:[usernames] + attr `active,password/password2,domains[],username_new,disable_tfa,force_pw_update,force_tfa` (`functions.domain_admin.inc.php`) | env |
| POST `/edit/da-acl` | key[rw] | items:[username] + attr `da_acl` map (`functions.acl.inc.php`, yaml) | env |
| POST `/edit/self` (as domainadmin) | session domainadmin | attr `password/user_new_pass/user_new_pass2/user_old_pass,disable_tfa,...` (`json_api.php:2044-2047`) | env |
| POST `/add/sso/domain-admin` | key[rw] | attr `username`; issues single-use 30s token row in `da_sso` (`functions.domain_admin.inc.php:451-498`) | bare JSON (token payload), NOT env (`json_api.php:304-314`) |
| POST `/delete/domain-admin` | key[rw] | items:[usernames] | env |

## 7. Admins (superadmins)

| Method+Path | Auth | Request | Response |
|---|---|---|---|
| POST `/add/admin` | key[rw] admin-only via handler | `username,password,password2` req; `active` (`functions.admin.inc.php:2-68`) | env |
| GET `/get/admin/all`, `/get/admin/{username}` | key[ro+] | — | list / obj `{username,active,superadmin,created,...}` |
| POST `/edit/admin` | key[rw] | items:[usernames] + attr `active,username_new,password/password2` (`functions.admin.inc.php:69-`) | env |
| POST `/delete/admin` | key[rw] | items:[usernames] | env |
| POST `/edit/self` (as admin) | session admin | n/a — `self` only branches domainadmin/user (`json_api.php:2044-2051`); admins edit via `/edit/admin` | — |
| API-key mgmt | UI-only | `admin_api()` (`functions.inc.php:2057-2130`, cols `api_key,skip_ip_check,active,allow_from,access`) is called from `edit.php`, NOT routed in `json_api.php` | — (no REST endpoint) |

## 8. Sieve filters

| Method+Path | Auth | Request | Response |
|---|---|---|---|
| POST `/add/filter` | key[rw] | `username`,`filter_type` (block/..., cf presets),`script_data` (sieve source),`script_desc`,`active` 0/1 (`functions.mailbox.inc.php:206-305`) | env |
| POST `/add/global-filter` | key[rw] admin | `filter_type` = `prefilter`\|`postfilter`, `script_data` sieve; validated via sieve parser, written to `/global_sieve/before\|after`, dovecot restarted (`functions.mailbox.inc.php:96-205`) | env `msg:global_filter_written` |
| GET `/get/filters/all`, `/get/filters/{mailbox}` | key[ro+] | — | list filter_details `{id,username,filter_type,script_desc,script_data,active,...}` (`functions.mailbox.inc.php:4527-4574`) |
| GET `/get/global_filters/all\|/prefilter\|/postfilter` | key[ro+] | — | obj `{prefilter,postfilter}` raw sieve text (`functions.mailbox.inc.php:4545-4553`) |
| GET `/get/active-user-sieve/{mailbox}` | key[ro+] | — | active sieve script (see §2) |
| GET `/get/presets/sieve` | key[ro+] | — | sieve preset templates (`functions.presets.inc.php:2-38`) |
| GET `/get/presets/rspamd` | key[ro+] | — | rspamd preset/settings list |
| POST `/edit/filter` | key[rw] | items:[ids] + attr `active,script_desc,script_data,filter_type` (`functions.mailbox.inc.php:2497-`) | env |
| POST `/delete/filter` | key[rw] | items:[ids] | env |

## 9. Sync jobs (imapsync, per mailbox)

| Method+Path | Auth | Request | Response |
|---|---|---|---|
| POST `/add/syncjob` | key[rw] | `host1,port1,user1,password1,enc1` (TLS),`mins_interval`,`subfolder2`,`maxage`,`maxbytespersecond`,`timeout1/2`,`exclude`,`custom_params`,`delete1/delete2/delete2duplicates,automap,skipcrossduplicates,subscribeall,dry`,`active` (yaml; `functions.mailbox.inc.php:305-`) | env |
| GET `/get/syncjobs/all` | key[ro+] | — | list syncjob_details (passwords omitted unless `with_password` in extra fields; `json_api.php:1049-1106`, `functions.mailbox.inc.php:4606-4650`) |
| GET `/get/syncjobs/{mailbox}[/{fields}]` | key[ro+] | extra = CSV field subset incl `with_password` | list, optionally filtered |
| POST `/edit/syncjob` | key[rw] | items:[ids] + attr add-fields + `last_run,success` (`functions.mailbox.inc.php:2290-2420`) | env |
| POST `/delete/syncjob` | key[rw] | items:[ids] | env |

## 10. App passwords

| Method+Path | Auth | Request | Response |
|---|---|---|---|
| POST `/add/app-passwd` | key[rw] | `username,app_name,app_passwd,app_passwd2` req; `active`,`protocols[]` ⊂ imap/smtp/pop3/eas/dav/sieve (`functions.app_passwd.inc.php:2-60`, yaml) | env (cleartext pw hashed server-side) |
| GET `/get/app-passwd/all[/{mailbox}]` | key[ro+] | — | list of details `{id,username,name,created,modified,active,protocols...}` |
| GET `/get/app-passwd/{id}` | key[ro+] | ⚠️ router passes `$object['id']` (string offset) — effectively broken, use `/all` (`json_api.php:555-558`) | obj |
| POST `/edit/app-passwd` | key[rw] | items:[ids] + attr `name,active,protocols[]` (`functions.app_passwd.inc.php:87-`) | env |
| POST `/delete/app-passwd` | key[rw] | items:[ids] | env |

## 11. OAuth2 clients

| Method+Path | Auth | Request | Response |
|---|---|---|---|
| POST `/add/oauth2-client` | key[rw] | `redirect_uri` (+`scope`; grant fixed `authorization_code`, `functions.oauth2.inc.php:2-`) | env (+ client_id/secret in log/msg) |
| GET `/get/oauth2-client/all`, `/get/oauth2-client/{id}` | key[ro+] | — | list / row of `oauth_clients` (`functions.oauth2.inc.php:230-238`) |
| POST `/edit/oauth2-client` | key[rw] | items:[ids] + attr `redirect_uri,scope,renew_secret,revoke_tokens,grant_type,access_token,refresh_token` | env |
| POST `/delete/oauth2-client` | key[rw] | items:[ids] | env |

## 12. Spam policy / Rspamd

| Method+Path | Auth | Request | Response |
|---|---|---|---|
| POST `/add/domain-policy`, `/add/mailbox-policy` | key[rw] | `domain`\|`username` + `object_from` (addr/wildcard) + `object_list` (spamfilter rows) (yaml; `functions.policy.inc.php:2-`) | env |
| GET `/get/policy_wl_domain/{d}`, `/get/policy_bl_domain/{d}`, `/get/policy_wl_mailbox/{m}`, `/get/policy_bl_mailbox/{m}` | key[ro+] | — | list of `{object,value,prefid}` from `filterconf` (`functions.policy.inc.php:284-310`, `json_api.php:1237-1268`) |
| POST `/delete/domain-policy`, `/delete/mailbox-policy` | key[rw] | items:[prefids] | env |
| GET `/get/rspamd/actions` | key[ro+] | — | obj of rspamd actions (`functions.rspamd.inc.php:196-220`) |
| POST `/edit/rspamd-map` | key[rw] | items:[map name] + attr `rspamd_map_data` content (`functions.rspamd.inc.php:130-`) | env |
| POST `/add/rsetting` | key[rw] | `content,desc,active` (rspamd settings record; yaml) | env |
| GET `/get/rsetting/all`, `/get/rsetting/{id}` | key[ro+] | — | list / obj (`functions.rspamd.inc.php:2-130`) |
| POST `/edit/rsetting`, `/delete/rsetting` | key[rw] | items + attr / items:[ids] | env |

## 13. TLS (outbound policy, MTA-STS)

| Method+Path | Auth | Request | Response |
|---|---|---|---|
| POST `/add/tls-policy-map` | key[rw] | `dest`,`policy` (none/may/encrypt/dane/...),`parameters`,`active` (yaml; `functions.tls_policy_maps.inc.php`) | env |
| GET `/get/tls-policy-map/all`, `/get/tls-policy-map/{id}` | key[ro+] | — | list / obj |
| POST `/edit/tls-policy-map`, `/delete/tls-policy-map` | key[rw] | items:[ids] + attr / items | env |
| POST `/edit/tls_policy` (per mailbox) | key[rw] | see §2 | env |
| POST `/add/mta-sts` | key[rw] | `domain,mode,enforce?/max_age,mx[],version,active` (`functions.mailbox.inc.php:1459-1533`) | env |
| GET `/get/mta-sts/{domain}` | key[ro+] | — (router `json_api.php` has NO get/mta-sts case → 404; read via mailbox_details) | n/a |
| POST `/edit/mta-sts` | key[rw] | items:[domains as `domains`] + attr `mode,max_age,mx,version,active` (`functions.mailbox.inc.php:3976-4095`) | env |

## 14. Routing / address rewriting

| Method+Path | Auth | Request | Response |
|---|---|---|---|
| POST `/add/relayhost` | key[rw] | `hostname` (host:port),`username`,`password` (`functions.transports.inc.php:2-179`) | env (id in msg) |
| GET `/get/relayhost/all`, `/get/relayhost/{id}` | key[ro+] | — | list / obj |
| POST `/edit/relayhost`, `/delete/relayhost` | key[rw] | items:[ids]+attr / items | env |
| POST `/add/transport` | key[rw] | `destination,nexthop,username,password,is_mx_based,active` (yaml) | env |
| GET `/get/transport/all`, `/get/transport/{id}` | key[ro+] | — | list / obj |
| POST `/edit/transport`, `/delete/transport` | key[rw] | items+attr / items | env |
| POST `/add/recipient_map` | key[rw] | `recipient_map_old,recipient_map_new,active` (yaml) | env |
| GET `/get/recipient_map/all`, `/get/recipient_map/{id}` | key[ro+] | — | list / obj |
| POST `/edit/recipient_map`, `/delete/recipient_map` | key[rw] | items+attr / items | env |
| POST `/add/bcc` | key[rw] | `type` sender\|rcpt, `local_dest`,`bcc_dest`,`active` (yaml; `functions.address_rewriting.inc.php:2-`) | env |
| GET `/get/bcc/all`, `/get/bcc/{id}` | key[ro+] | — | list / obj |
| POST `/edit/bcc`, `/delete/bcc` | key[rw] | items:[ids]+attr / items | env |
| POST `/add/fwdhost` | key[rw] | `hostname`,`filter_spam`,`keep_spam` (`functions.fwdhost.inc.php`) | env |
| GET `/get/fwdhost/all`, `/get/fwdhost/{hostname}` | key[ro+] | — | list (`fwdhost('get')`) / obj details |
| POST `/edit/fwdhost` | key[rw] | items fwdhost + attr `hostname,filter_spam,keep_spam` | env |
| POST `/delete/fwdhost` | key[rw] | items:[forwardinghost] | env |

## 15. Mail queue (Postfix)

| Method+Path | Auth | Request | Response |
|---|---|---|---|
| GET `/get/mailq/all` | key[ro+] | — | raw queue JSON string passthrough from postfix container (`mailq('get')`, `json_api.php:562-574`, `functions.mailq.inc.php:48-`) |
| GET `/get/postcat/{qid}` | key[ro+] | — | RAW message bytes (NOT JSON) of queued mail (`mailq('cat')` returns docker output verbatim; `functions.mailq.inc.php:11-24,91-100`) |
| POST `/edit/mailq` | key[rw] | attr `action` ∈ hold/unhold/deliver (per-qid via items) or flush (whole queue) (`functions.mailq.inc.php:102-118`, yaml) | env `msg:queue_command_success` |
| POST `/delete/mailq` | key[rw] | attr `action` = `super_delete` (whole queue) OR items:[qids] for per-message delete (`functions.mailq.inc.php:80-89`, yaml) | env |

## 16. Quarantine (rspamd)

| Method+Path | Auth | Request | Response |
|---|---|---|---|
| GET `/get/quarantine/all` | key[ro+] | — | list (no per-item details; `json_api.php:1325-1335`) |
| GET `/get/quarantine/{id}` | key[ro+] | — | obj = full `quarantine` row (`SELECT *`, `functions.quarantine.inc.php:811-817`) |
| POST `/edit/qitem` | key[rw] | items:[qids] + attr `action` ∈ release/learnham/learnspam (+`release_format`) (`functions.quarantine.inc.php:364,618`) | env `msg:[learned_ham,...]` etc. |
| POST `/edit/quarantine` | key[rw] admin | attr global settings: `sender,subject,html_tmpl,retention_size,max_size,max_age,max_score,release_format,bcc,redirect,exclude_domains` (`functions.quarantine.inc.php` field grep) | env |
| POST `/delete/qitem` | key[rw] | items:[qids] (`functions.quarantine.inc.php:229-`) | env |

## 17. DKIM

| Method+Path | Auth | Request | Response |
|---|---|---|---|
| POST `/add/dkim` | key[rw] | `domains` (CSV),`dkim_selector` default dkim,`key_size` ∈ 1024/2048/3072/4096 (yaml; `functions.dkim.inc.php:2-`) | env + key generated into redis `DKIM_PUB_KEYS` |
| POST `/add/dkim_duplicate` | key[rw] | `from_domain`,`to_domain` | env (copies key between domains) |
| POST `/add/dkim_import` | key[rw] | `domain`,`private_key_file` (+`overwrite_existing`) (`functions.dkim.inc.php:143-`) | env |
| GET `/get/dkim/{domain}` | key[ro+] | — | obj `{pubkey,length,dkim_txt,...}` from redis (`functions.dkim.inc.php:233-258`) |
| POST `/delete/dkim` | key[rw] | items:[domains] | env |

## 18. Ratelimits

| Method+Path | Auth | Request | Response |
|---|---|---|---|
| GET `/get/rl-domain/all`, `/get/rl-domain/{domain}` | key[ro+] | — | obj `{rl_value,rl_frame,domain?}` (`functions.ratelimit.inc.php`, `json_api.php:615-641`) |
| GET `/get/rl-mbox/all`, `/get/rl-mbox/{mailbox}` | key[ro+] | — | obj `{rl_value,rl_frame,mailbox?}` (`json_api.php:643-674`) |
| POST `/edit/rl-domain`, `/edit/rl-mbox` | key[rw] | items:[objects] + attr `rl_value,rl_frame` | env |
| POST `/delete/rlhash` | key[rw] | items = rl hash string (imploded) — clears redis rl hash (`json_api.php:1822-1824`) | raw `ratelimit('delete')` echo |

## 19. Fail2ban / netfilter

| Method+Path | Auth | Request | Response |
|---|---|---|---|
| GET `/get/fail2ban` | key[ro+] | object segment ignored | obj `{regex,whitelist,blacklist,active_bans[],perm_bans[],ban_time,...}` (`functions.fail2ban.inc.php:6-85`) |
| POST `/edit/fail2ban` | key[rw] | items:[network] + attr `ban_time,ban_time_increment,max_ban_time,netban_ipv4/6,max_attempts,retry_window,whitelist,blacklist,regex,manage_external` (`functions.fail2ban.inc.php:87-270`) | env |
| POST `/edit/fail2ban/banlist` | key[rw] | items = banlist_id; refreshes id (`functions.fail2ban.inc.php:335-379`) | env |
| GET `/get/logs/netfilter/{count}` | key[ro+] | see §20 | list |

## 20. Logs (read-only, redis/container)

| Method+Path | Auth | Request | Response |
|---|---|---|---|
| GET `/get/logs/{svc}[/{count}]` | key[ro+] | svc ∈ dovecot,ratelimited,netfilter,cron,postfix,autodiscover,sogo,ui,sasl,watchdog,acme,api,rspamd-history; count = lines (`json_api.php:805-962`, `functions.inc.php:3612 get_logs`) | list of log lines or `{}` |
| GET `/get/logs/rspamd-stats` | key[ro+] | — | obj rspamd stats |

## 21. Status (admin-only in router)

| Method+Path | Auth | Request | Response |
|---|---|---|---|
| GET `/get/status/containers` | admin | — (`json_api.php:1461`) | obj per container `{type,container,state,started_at,image}` (`json_api.php:1463-1478`, `functions.docker.inc.php`) |
| GET `/get/status/container/{name}` | admin | extra = service name | obj container stats (`docker('container_stats')`) |
| GET `/get/status/vmail` | admin | — | obj `{type,disk,used,total,used_percent}` (`json_api.php:1484-1495`) |
| GET `/get/status/host` | admin | — | obj host stats (`docker('host_stats')`) |
| GET `/get/status/host/ip` | admin | — | obj `{ipv4,ipv6}` public IPs |
| GET `/get/status/version` | admin | — | obj `{version}` = `$MAILCOW_GIT_VERSION` |
| GET `/get/identity-provider` | admin | — | obj `$iam_settings` or null (`json_api.php:1535-1541`) |

## 22. Branding / settings / misc config

| Method+Path | Auth | Request | Response |
|---|---|---|---|
| POST `/edit/app_links` | key[rw] admin | attr `app[],href[],user_href[],hide[]` (`functions.customize.inc.php:122-153`) | env |
| POST `/edit/ui_texts` | key[rw] admin | attr `title_name,main_name,apps_name,help_text,ui_footer,ui_announcement_text/type/active` (`functions.customize.inc.php:154-188`) | env |
| POST `/edit/ip_check` | key[rw] admin | attr `ip_check_opt_in` 0/1 | env |
| POST `/edit/custom_login` | key[rw] admin | attr `hide_*_quicklink,force_sso` 0/1 (`functions.customize.inc.php:207-`) | env |
| POST `/edit/ui_theme` | key[rw] admin | attr `ui_theme` | env |
| POST `/edit/passwordpolicy` | key[rw] admin | attr password-complexity rule set (`functions.inc.php:161-`, yaml implied) | env |
| GET `/get/passwordpolicy[/html]` | key[ro+] | — | obj rules / HTML fragment |
| POST `/edit/quota_notification` | key[rw] admin | attr `sender,subject,html_tmpl,active` (`functions.quota_notification.inc.php:2-`) | env |
| POST `/edit/quota_notification_bcc` | key[rw] admin | attr `bcc_rcpt` | env |
| POST `/edit/cors` | key[rw] admin | attr `allowed_origins[],allowed_methods[]` ⊂ GET/POST/PUT/DELETE (`functions.inc.php:2317-`, yaml) | env |
| POST `/edit/identity-provider` | key[rw] admin | attr IdP/LDAP-OIDC settings: `host,port,basedn,binddn,bindpass,filter,attribute_field,authsource,client_id/secret,authorize_url,login_provisioning,import_users,...` (`functions.inc.php:2477-`) | env |
| POST `/edit/identity-provider-test` | key[rw] admin | attr connection test params | env (test result) |
| POST `/edit/reset-password-notification` | key[rw] admin | attr notification template (`reset_password('edit_notification')`, `functions.inc.php:3162-`) | env |
| POST `/edit/fido2-fn` | key[rw] session user | attr `fido2_attrs` (friendly-name edit; `json_api.php:1909-1911`, `functions.inc.php:1440-`) | env |
| POST `/edit/self` (as user) | session user | attr `user_old_pass,user_new_pass,user_new_pass2,pw_recovery_email` (`functions.inc.php:1057-1160`) | env |

## 23. FIDO2 / WebAuthn ceremonies (session-only, NOT API-key usable)

| Method+Path | Auth | Request | Response |
|---|---|---|---|
| GET `/get/fido2-registration`, `/get/webauthn-tfa-registration` | session | — | WebAuthn `getCreateArgs` JSON + server challenge (`json_api.php:368-423`) |
| GET `/get/fido2-get-args`, `/get/webauthn-tfa-get-args` | session/pending-TFA | — | `getGetArgs` JSON (`json_api.php:382-447`) |
| POST `/add/fido2-registration`, `/add/webauthn-tfa-registration` | session | raw WebAuthn `clientDataJSON,attestationObject` (+`tfa_method,key_id,confirm_password`) | `{success:true,msg?}` bare JSON, NOT env (`json_api.php:156-232`) |

---

## Totals

- Router URL patterns: add 31 + get 93 + search 2 + delete 32 + edit 56 = **214**
  (leaf `case` recount, review 2026-10-24; see `coverage.md` for the convention —
  the previous headline said 217/`get` 96, overcounting `get` by 3).
- `openapi.yaml` documents **66** path keys / **96** operations (review 2026-10-24:
  all present in the router modulo notation — bare URLs served by `default:`
  branches, trailing slashes, and `$extra` variants such as
  `get/syncjobs/all/no_log` and `status/host/ip`; see api-notes for gaps).
- Undocumented-but-routed: **118** patterns (nearly all GET details/lists, search, most edit/delete, FIDO2, self, status extras, logs).

## Coverage checklist (context | routed endpoints | in openapi.yaml | count)

| Context | Routed | In openapi.yaml |
|---|---|---|
| Domains (+templates,tags,footer,search) | 13 | add/domain, delete/domain(+tag), edit/domain(+footer), get/domain/{id} (5) |
| Mailboxes (+templates,tags,acl,spam-score,self) | 24 | add/edit/delete mailbox(+tag), edit mailbox/custom-attribute, edit user-acl/spam-score/pushover/quarantine_notification, get mailbox/{id}+all, get spam-score, edit syncjob (13) |
| Aliases (+time-limited) | 9 | add/edit/delete alias, add time_limited_alias, get alias/{id}+time_limited_aliases (6) |
| Alias domains | 5 | 0 |
| Resources | 5 | add/delete/get-all (3) |
| Domain admins (+sso,acl) | 8 | add/edit/delete/get-all domain-admin, add sso, edit da-acl (6) |
| Admins | 4 | 0 |
| Sieve filters (+global,presets) | 9 | 0 |
| Sync jobs | 5 | add/edit/delete syncjob, get syncjobs/all (4) |
| App passwords | 5 | add/delete app-passwd, get all (3) |
| OAuth2 clients | 4 | add/delete oauth2-client, get one (3) |
| Spam policy/rspamd/rsettings | 8 | add/delete domain-policy, get policy_wl/bl_domain (4) |
| TLS/mta-sts | 7 | add tls-policy-map, get one, delete transport(!) (3, partly mismatched tags) |
| Routing (relayhost,transport,rmap,bcc,fwdhost) | 16 | add relayhost/transport/recipient_map/bcc/fwdhost + deletes + get relayhost/transport/recipient_map/bcc/fwdhost-all (12) |
| Mail queue | 4 | edit+delete mailq, get mailq/all (3) |
| Quarantine | 5 | delete+edit qitem, get quarantine/all (3) |
| DKIM | 5 | add/dkim(+duplicate), delete dkim, get dkim (4) |
| Ratelimits | 7 | edit rl-mbox/rl-domain, get rl-mbox/rl-domain (4) |
| Fail2ban | 3 | get+edit fail2ban (2) |
| Logs | 14 | 10 of 14 services |
| Status (+identity-provider get) | 7 | containers, vmail, version (3) |
| Branding/settings/misc | 15 | edit cors, edit identity-provider (2) |
| FIDO2/WebAuthn | 6 | 0 |
| **Total** | **217** | **96** |



