import { buildApplication, buildRouteMap } from "@stricli/core"
import { adminCommands } from "../admins/cli/adminCommands.js"
import { aliasCommands } from "../aliases/cli/aliasCommands.js"
import { aliasDomainCommands } from "../aliasDomains/cli/aliasDomainCommands.js"
import { appPasswordCommands } from "../appPasswords/cli/appPasswordCommands.js"
import { PACKAGE_VERSION } from "../client/PACKAGE_VERSION.js"
import { dkimCommands } from "../dkim/cli/dkimCommands.js"
import { domainAdminCommands } from "../domainAdmins/cli/domainAdminCommands.js"
import { domainCommands } from "../domains/cli/domainCommands.js"
import { mailboxCommands } from "../mailboxes/cli/mailboxCommands.js"
import { oauth2ClientCommands } from "../oauth2Clients/cli/oauth2ClientCommands.js"
import { quarantineCommands } from "../quarantine/cli/quarantineCommands.js"
import { queueCommands } from "../queue/cli/queueCommands.js"
import { resourceCommands } from "../resources/cli/resourceCommands.js"
import { routingCommands } from "../routing/cli/routingCommands.js"
import { sieveFilterCommands } from "../sieveFilters/cli/sieveFilterCommands.js"
import { spamPolicyCommands } from "../spamPolicy/cli/spamPolicyCommands.js"
import { syncJobCommands } from "../syncJobs/cli/syncJobCommands.js"
import { tlsCommands } from "../tls/cli/tlsCommands.js"
import { fail2banCommands } from "../fail2ban/cli/fail2banCommands.js"
import { fido2Commands } from "../fido2/cli/fido2Commands.js"
import { logsCommands } from "../logs/cli/logsCommands.js"
import { ratelimitCommands } from "../ratelimits/cli/ratelimitCommands.js"
import { settingsCommands } from "../settings/cli/settingsCommands.js"
import { statusCommands } from "../status/cli/statusCommands.js"
import { versionCommand } from "./versionCommand.js"

const routes = buildRouteMap({
  routes: {
    version: versionCommand,
    domains: domainCommands,
    mailboxes: mailboxCommands,
    aliases: aliasCommands,
    "alias-domains": aliasDomainCommands,
    resources: resourceCommands,
    "domain-admins": domainAdminCommands,
    admins: adminCommands,
    filters: sieveFilterCommands,
    "sync-jobs": syncJobCommands,
    "app-passwords": appPasswordCommands,
    "oauth2-clients": oauth2ClientCommands,
    policy: spamPolicyCommands,
    tls: tlsCommands,
    routing: routingCommands,
    queue: queueCommands,
    quarantine: quarantineCommands,
    dkim: dkimCommands,
    ratelimits: ratelimitCommands,
    fail2ban: fail2banCommands,
    logs: logsCommands,
    status: statusCommands,
    settings: settingsCommands,
    fido2: fido2Commands,
  },
  docs: {
    brief: "TypeScript client and CLI for the mailcow API",
  },
})

export const mailcowClientApp = buildApplication(routes, {
  name: "mailcow-client",
  versionInfo: {
    currentVersion: PACKAGE_VERSION,
  },
})
