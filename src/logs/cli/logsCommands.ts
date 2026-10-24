import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"
import { logList } from "../logList.js"
import type { LogService } from "../logServiceSchema.js"
import { rspamdStatsGet } from "../rspamdStatsGet.js"

const listCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { service: string; count?: number }) {
    await cliRunApi(this, flags, (config) =>
      logList({
        config,
        service: flags.service as LogService,
        ...(flags.count === undefined ? {} : { count: flags.count }),
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      service: cliScalarFlagParams.requiredString(
        "Log service: dovecot, ratelimited, netfilter, cron, postfix, autodiscover, sogo, ui, sasl, watchdog, acme, api, rspamd-history",
      ),
      count: cliScalarFlagParams.optionalNumber("Number of log lines to fetch"),
    },
  },
  docs: { brief: "Show service log lines (may contain sensitive content)" },
})

const rspamdStatsCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => rspamdStatsGet({ config }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "Show rspamd stats" },
})

export const logsCommands = buildRouteMap({
  routes: {
    list: listCommand,
    "rspamd-stats": rspamdStatsCommand,
  },
  docs: { brief: "Read service logs and rspamd stats" },
})
