import { readFile } from "node:fs/promises"
import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliFail } from "../../cli/cliFail.js"
import { cliJsonFlagParam } from "../../cli/cliJsonFlagParam.js"
import { cliJsonParse } from "../../cli/cliJsonParse.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"
import { dkimAdd } from "../dkimAdd.js"
import type { DkimAddRequest } from "../dkimAddRequest.js"
import { dkimDelete } from "../dkimDelete.js"
import { dkimDuplicateAdd } from "../dkimDuplicateAdd.js"
import type { DkimDuplicateAddRequest } from "../dkimDuplicateAddRequest.js"
import { dkimGet } from "../dkimGet.js"
import { dkimImportAdd } from "../dkimImportAdd.js"
import type { DkimImportAddRequest } from "../dkimImportAddRequest.js"

function dkimOptionalJsonFlag(brief: string) {
  return cliJsonFlagParam(brief) as { kind: "parsed"; parse: typeof String; optional: true; brief: string }
}

async function dkimReadKeyFile(path: string): Promise<string> {
  try {
    return await readFile(path, "utf8")
  } catch (error) {
    cliFail({
      success: false,
      op: "dkimImportAdd",
      errorMessage: "Reading private key file failed",
      rawData: error instanceof Error ? error.message : String(error),
    })
  }
}

const addCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { domains?: string; attrJson?: string }) {
    const attrResult = cliJsonParse(flags.attrJson, "dkimAdd", "attrJson")
    if (!attrResult.success) cliFail(attrResult)
    await cliRunApi(this, flags, (config) =>
      dkimAdd({
        config,
        attr: {
          ...((attrResult.data ?? {}) as Partial<DkimAddRequest>),
          ...(flags.domains === undefined ? {} : { domains: flags.domains }),
        } as DkimAddRequest,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      domains: cliScalarFlagParams.optionalString("CSV domains to generate keys for (overrides attrJson.domains)"),
      attrJson: dkimOptionalJsonFlag("DKIM attributes JSON"),
    },
  },
  docs: { brief: "Generate DKIM keys for domains" },
})

const duplicateAddCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { fromDomain?: string; toDomainJson?: string; attrJson?: string },
  ) {
    const attrResult = cliJsonParse(flags.attrJson, "dkimDuplicateAdd", "attrJson")
    if (!attrResult.success) cliFail(attrResult)
    const toDomainResult = cliJsonParse(flags.toDomainJson, "dkimDuplicateAdd", "toDomainJson")
    if (!toDomainResult.success) cliFail(toDomainResult)
    await cliRunApi(this, flags, (config) =>
      dkimDuplicateAdd({
        config,
        attr: {
          ...((attrResult.data ?? {}) as Partial<DkimDuplicateAddRequest>),
          ...(flags.fromDomain === undefined ? {} : { from_domain: flags.fromDomain }),
          ...(toDomainResult.data === undefined ? {} : { to_domain: toDomainResult.data as string | string[] }),
        } as DkimDuplicateAddRequest,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      fromDomain: cliScalarFlagParams.optionalString("Source domain (overrides attrJson.from_domain)"),
      toDomainJson: dkimOptionalJsonFlag("Target domain or JSON array of target domains"),
      attrJson: dkimOptionalJsonFlag("DKIM duplicate attributes JSON"),
    },
  },
  docs: { brief: "Copy a DKIM key to other domains" },
})

const importAddCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { domain?: string; privateKeyFile?: string; attrJson?: string },
  ) {
    const attrResult = cliJsonParse(flags.attrJson, "dkimImportAdd", "attrJson")
    if (!attrResult.success) cliFail(attrResult)
    const keyContent = flags.privateKeyFile === undefined ? undefined : await dkimReadKeyFile(flags.privateKeyFile)
    await cliRunApi(this, flags, (config) =>
      dkimImportAdd({
        config,
        attr: {
          ...((attrResult.data ?? {}) as Partial<DkimImportAddRequest>),
          ...(flags.domain === undefined ? {} : { domain: flags.domain }),
          ...(keyContent === undefined ? {} : { private_key_file: keyContent }),
        } as DkimImportAddRequest,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      domain: cliScalarFlagParams.optionalString("Domain (overrides attrJson.domain)"),
      privateKeyFile: cliScalarFlagParams.optionalString("Local PEM file read as private_key_file content"),
      attrJson: dkimOptionalJsonFlag("DKIM import attributes JSON"),
    },
  },
  docs: { brief: "Import a DKIM private key for a domain" },
})

const getCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { domain: string }) {
    await cliRunApi(this, flags, (config) => dkimGet({ config, domain: flags.domain }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      domain: cliScalarFlagParams.requiredString("Domain"),
    },
  },
  docs: { brief: "Get public DKIM material for a domain" },
})

const deleteCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { itemsJson?: string }) {
    const itemsResult = cliJsonParse(flags.itemsJson, "dkimDelete", "itemsJson")
    if (!itemsResult.success) cliFail(itemsResult)
    await cliRunApi(this, flags, (config) => dkimDelete({ config, items: (itemsResult.data ?? []) as string[] }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      itemsJson: dkimOptionalJsonFlag("JSON array of domains to delete keys for"),
    },
  },
  docs: { brief: "Delete DKIM keys for domains" },
})

export const dkimCommands = buildRouteMap({
  routes: {
    add: addCommand,
    "duplicate-add": duplicateAddCommand,
    "import-add": importAddCommand,
    get: getCommand,
    delete: deleteCommand,
  },
  docs: { brief: "Manage mailcow DKIM keys" },
})
