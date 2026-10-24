import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"
import { identityProviderGet } from "../identityProviderGet.js"
import { statusContainerGet } from "../statusContainerGet.js"
import { statusContainersList } from "../statusContainersList.js"
import { statusHostGet } from "../statusHostGet.js"
import { statusHostIpGet } from "../statusHostIpGet.js"
import { statusVersionGet } from "../statusVersionGet.js"
import { statusVmailGet } from "../statusVmailGet.js"

const containersCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => statusContainersList({ config }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "List mailcow container states (admin-only)" },
})

const containerCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { name: string }) {
    await cliRunApi(this, flags, (config) => statusContainerGet({ config, name: flags.name }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      name: cliScalarFlagParams.requiredString("Container/service name for stats"),
    },
  },
  docs: { brief: "Show stats for one container (admin-only)" },
})

const vmailCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => statusVmailGet({ config }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "Show vmail disk usage (admin-only)" },
})

const hostCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => statusHostGet({ config }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "Show host stats (admin-only)" },
})

const hostIpCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => statusHostIpGet({ config }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "Show public host IPs (admin-only)" },
})

const versionStatusCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => statusVersionGet({ config }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "Show mailcow version (admin-only)" },
})

const identityProviderCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => identityProviderGet({ config }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "Show identity provider settings (admin-only)" },
})

export const statusCommands = buildRouteMap({
  routes: {
    containers: containersCommand,
    container: containerCommand,
    vmail: vmailCommand,
    host: hostCommand,
    "host-ip": hostIpCommand,
    version: versionStatusCommand,
    "identity-provider": identityProviderCommand,
  },
  docs: { brief: "Show server status (admin-only in the router)" },
})
