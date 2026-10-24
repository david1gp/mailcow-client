import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliFail } from "../../cli/cliFail.js"
import { cliJsonFlagParam } from "../../cli/cliJsonFlagParam.js"
import { cliJsonParse } from "../../cli/cliJsonParse.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"
import { bccDestinationOptionsGet } from "../bccDestinationOptionsGet.js"
import type { MailboxAddRequest } from "../mailboxAddRequest.js"
import { mailboxActiveUserSieveGet } from "../mailboxActiveUserSieveGet.js"
import { mailboxAdd } from "../mailboxAdd.js"
import { mailboxCustomAttributeEdit } from "../mailboxCustomAttributeEdit.js"
import { mailboxDelete } from "../mailboxDelete.js"
import { mailboxDelimiterActionEdit } from "../mailboxDelimiterActionEdit.js"
import { mailboxEasCacheDelete } from "../mailboxEasCacheDelete.js"
import { mailboxEdit } from "../mailboxEdit.js"
import { mailboxGet } from "../mailboxGet.js"
import { mailboxLastLoginGet } from "../mailboxLastLoginGet.js"
import { mailboxLastLoginReset } from "../mailboxLastLoginReset.js"
import { mailboxList } from "../mailboxList.js"
import { mailboxPushoverEdit } from "../mailboxPushoverEdit.js"
import { mailboxPushoverTestEdit } from "../mailboxPushoverTestEdit.js"
import { mailboxQuarantineCategoryEdit } from "../mailboxQuarantineCategoryEdit.js"
import { mailboxQuarantineNotificationEdit } from "../mailboxQuarantineNotificationEdit.js"
import { mailboxReducedList } from "../mailboxReducedList.js"
import { mailboxRename } from "../mailboxRename.js"
import type { MailboxRenameOptions } from "../mailboxRenameOptionsSchema.js"
import { mailboxSearch } from "../mailboxSearch.js"
import { mailboxSogoProfileDelete } from "../mailboxSogoProfileDelete.js"
import { mailboxSpamScoreEdit } from "../mailboxSpamScoreEdit.js"
import { mailboxSpamScoreGet } from "../mailboxSpamScoreGet.js"
import { mailboxTagDelete } from "../mailboxTagDelete.js"
import type { MailboxTemplateAddRequest } from "../mailboxTemplateAddRequest.js"
import { mailboxTemplateAdd } from "../mailboxTemplateAdd.js"
import { mailboxTemplateDelete } from "../mailboxTemplateDelete.js"
import { mailboxTemplateEdit } from "../mailboxTemplateEdit.js"
import { mailboxTemplateGet } from "../mailboxTemplateGet.js"
import { mailboxTemplateList } from "../mailboxTemplateList.js"
import { mailboxTlsPolicyEdit } from "../mailboxTlsPolicyEdit.js"
import { mailboxUserAclEdit } from "../mailboxUserAclEdit.js"

function mailboxOptionalJsonFlag(brief: string) {
  return cliJsonFlagParam(brief) as { kind: "parsed"; parse: typeof String; optional: true; brief: string }
}

function mailboxItemsParse(value: string | undefined, op: string): (string | number)[] | undefined {
  const parsed = cliJsonParse(value, op, "itemsJson")
  if (!parsed.success) cliFail(parsed)
  return parsed.data as (string | number)[] | undefined
}

function mailboxAttrParse(value: string | undefined, op: string): Record<string, unknown> {
  const parsed = cliJsonParse(value, op, "attrJson")
  if (!parsed.success) cliFail(parsed)
  return (parsed.data ?? {}) as Record<string, unknown>
}

const addCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { localPart?: string; domain?: string; password?: string; attrJson?: string },
  ) {
    const attr = mailboxAttrParse(flags.attrJson, "mailboxAdd")
    await cliRunApi(this, flags, (config) =>
      mailboxAdd({
        config,
        attr: {
          ...attr,
          ...(flags.localPart === undefined ? {} : { local_part: flags.localPart }),
          ...(flags.domain === undefined ? {} : { domain: flags.domain }),
          ...(flags.password === undefined ? {} : { password: flags.password, password2: flags.password }),
        } as MailboxAddRequest,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      localPart: cliScalarFlagParams.optionalString("Local part (overrides attrJson.local_part)"),
      domain: cliScalarFlagParams.optionalString("Domain (overrides attrJson.domain)"),
      password: cliScalarFlagParams.optionalString("Password (sets password and password2)"),
      attrJson: mailboxOptionalJsonFlag("Mailbox attributes JSON"),
    },
  },
  docs: { brief: "Add a mailbox" },
})

const templateAddCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { template?: string; attrJson?: string }) {
    const attr = mailboxAttrParse(flags.attrJson, "mailboxTemplateAdd")
    await cliRunApi(this, flags, (config) =>
      mailboxTemplateAdd({
        config,
        attr: {
          ...attr,
          ...(flags.template === undefined ? {} : { template: flags.template }),
        } as MailboxTemplateAddRequest,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      template: cliScalarFlagParams.optionalString("Template name (overrides attrJson.template)"),
      attrJson: mailboxOptionalJsonFlag("Template attributes JSON"),
    },
  },
  docs: { brief: "Add a mailbox template" },
})

const listCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { domains?: string[]; tags?: string[] }) {
    await cliRunApi(this, flags, (config) => mailboxList({ config, domains: flags.domains, tags: flags.tags }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      domains: cliScalarFlagParams.optionalStringList("Scope to domains (comma-separated)"),
      tags: cliScalarFlagParams.optionalStringList("Filter by tags (comma-separated)"),
    },
  },
  docs: { brief: "List mailboxes" },
})

const reducedListCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { domains?: string[] }) {
    await cliRunApi(this, flags, (config) => mailboxReducedList({ config, domains: flags.domains }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      domains: cliScalarFlagParams.optionalStringList("Scope to domains (comma-separated)"),
    },
  },
  docs: { brief: "List mailboxes (reduced projection)" },
})

const templateListCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => mailboxTemplateList({ config }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "List mailbox templates" },
})

const templateGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { id: string }) {
    await cliRunApi(this, flags, (config) => mailboxTemplateGet({ config, id: flags.id }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      id: cliScalarFlagParams.requiredString("Template id"),
    },
  },
  docs: { brief: "Get a mailbox template" },
})

const getCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { mailbox: string; tags?: string[] }) {
    await cliRunApi(this, flags, (config) => mailboxGet({ config, mailbox: flags.mailbox, tags: flags.tags }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      mailbox: cliScalarFlagParams.requiredString("Mailbox address (or domain with --tags)"),
      tags: cliScalarFlagParams.optionalStringList("List per-domain mailboxes by tags"),
    },
  },
  docs: { brief: "Get a mailbox" },
})

const editCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { itemsJson?: string; attrJson?: string }) {
    await cliRunApi(this, flags, (config) =>
      mailboxEdit({
        config,
        items: mailboxItemsParse(flags.itemsJson, "mailboxEdit") ?? [],
        attr: mailboxAttrParse(flags.attrJson, "mailboxEdit") as Record<string, string | number | string[]>,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      itemsJson: mailboxOptionalJsonFlag("JSON array of mailbox addresses to edit"),
      attrJson: mailboxOptionalJsonFlag("Mailbox attributes JSON"),
    },
  },
  docs: { brief: "Edit mailboxes" },
})

const templateEditCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { itemsJson?: string; attrJson?: string }) {
    await cliRunApi(this, flags, (config) =>
      mailboxTemplateEdit({
        config,
        items: mailboxItemsParse(flags.itemsJson, "mailboxTemplateEdit") ?? [],
        attr: mailboxAttrParse(flags.attrJson, "mailboxTemplateEdit") as Record<string, string | number | string[]>,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      itemsJson: mailboxOptionalJsonFlag("JSON array of template ids to edit"),
      attrJson: mailboxOptionalJsonFlag("Template attributes JSON"),
    },
  },
  docs: { brief: "Edit mailbox templates" },
})

const customAttributeCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { itemsJson?: string; attrJson?: string }) {
    await cliRunApi(this, flags, (config) =>
      mailboxCustomAttributeEdit({
        config,
        items: mailboxItemsParse(flags.itemsJson, "mailboxCustomAttributeEdit") ?? [],
        attr: mailboxAttrParse(flags.attrJson, "mailboxCustomAttributeEdit"),
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      itemsJson: mailboxOptionalJsonFlag("JSON array of mailbox addresses"),
      attrJson: mailboxOptionalJsonFlag("Custom attributes JSON"),
    },
  },
  docs: { brief: "Edit mailbox custom attributes" },
})

const renameCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & {
      itemsJson?: string
      oldLocalPart?: string
      newLocalPart?: string
      domain?: string
      attrJson?: string
    },
  ) {
    const attr = mailboxAttrParse(flags.attrJson, "mailboxRename")
    await cliRunApi(this, flags, (config) =>
      mailboxRename({
        config,
        items: mailboxItemsParse(flags.itemsJson, "mailboxRename") ?? [],
        attr: {
          ...attr,
          ...(flags.oldLocalPart === undefined ? {} : { old_local_part: flags.oldLocalPart }),
          ...(flags.newLocalPart === undefined ? {} : { new_local_part: flags.newLocalPart }),
          ...(flags.domain === undefined ? {} : { domain: flags.domain }),
        } as MailboxRenameOptions["attr"],
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      itemsJson: mailboxOptionalJsonFlag("JSON array with the old mailbox address"),
      oldLocalPart: cliScalarFlagParams.optionalString("Old local part (required by the server)"),
      newLocalPart: cliScalarFlagParams.optionalString("New local part"),
      domain: cliScalarFlagParams.optionalString("Target domain"),
      attrJson: mailboxOptionalJsonFlag("Rename attributes JSON (create_alias, ...)"),
    },
  },
  docs: { brief: "Rename a mailbox" },
})

const userAclCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { itemsJson?: string; attrJson?: string }) {
    await cliRunApi(this, flags, (config) =>
      mailboxUserAclEdit({
        config,
        items: mailboxItemsParse(flags.itemsJson, "mailboxUserAclEdit") ?? [],
        attr: mailboxAttrParse(flags.attrJson, "mailboxUserAclEdit") as {
          user_acl?: Record<string, unknown>
        },
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      itemsJson: mailboxOptionalJsonFlag("JSON array of mailbox addresses"),
      attrJson: mailboxOptionalJsonFlag("ACL attributes JSON ({user_acl: {...}})"),
    },
  },
  docs: { brief: "Edit mailbox user ACL" },
})

const spamScoreEditCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { itemsJson?: string; spamScore?: string; attrJson?: string },
  ) {
    const attr = mailboxAttrParse(flags.attrJson, "mailboxSpamScoreEdit")
    await cliRunApi(this, flags, (config) =>
      mailboxSpamScoreEdit({
        config,
        items: mailboxItemsParse(flags.itemsJson, "mailboxSpamScoreEdit") ?? [],
        attr: {
          ...attr,
          ...(flags.spamScore === undefined ? {} : { spam_score: flags.spamScore }),
        } as Record<string, string>,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      itemsJson: mailboxOptionalJsonFlag("JSON array of mailbox addresses"),
      spamScore: cliScalarFlagParams.optionalString("Spam score"),
      attrJson: mailboxOptionalJsonFlag("Spam score attributes JSON"),
    },
  },
  docs: { brief: "Edit mailbox spam score" },
})

const spamScoreGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { mailbox: string }) {
    await cliRunApi(this, flags, (config) => mailboxSpamScoreGet({ config, mailbox: flags.mailbox }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      mailbox: cliScalarFlagParams.requiredString("Mailbox address"),
    },
  },
  docs: { brief: "Get mailbox spam score" },
})

const delimiterActionCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { itemsJson?: string; taggedMailHandler?: string; attrJson?: string },
  ) {
    const attr = mailboxAttrParse(flags.attrJson, "mailboxDelimiterActionEdit")
    await cliRunApi(this, flags, (config) =>
      mailboxDelimiterActionEdit({
        config,
        items: mailboxItemsParse(flags.itemsJson, "mailboxDelimiterActionEdit") ?? [],
        attr: {
          ...attr,
          ...(flags.taggedMailHandler === undefined ? {} : { tagged_mail_handler: flags.taggedMailHandler }),
        } as Record<string, string>,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      itemsJson: mailboxOptionalJsonFlag("JSON array of mailbox addresses"),
      taggedMailHandler: cliScalarFlagParams.optionalString("Tagged mail handler"),
      attrJson: mailboxOptionalJsonFlag("Delimiter action attributes JSON"),
    },
  },
  docs: { brief: "Edit mailbox delimiter action" },
})

const tlsPolicyCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { itemsJson?: string; tlsPolicy?: string }) {
    await cliRunApi(this, flags, (config) =>
      mailboxTlsPolicyEdit({
        config,
        items: mailboxItemsParse(flags.itemsJson, "mailboxTlsPolicyEdit") ?? [],
        attr: flags.tlsPolicy === undefined ? {} : { tls_policy: flags.tlsPolicy },
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      itemsJson: mailboxOptionalJsonFlag("JSON array of mailbox addresses"),
      tlsPolicy: cliScalarFlagParams.optionalString("TLS policy"),
    },
  },
  docs: { brief: "Edit mailbox TLS policy" },
})

const quarantineNotificationCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { itemsJson?: string; quarantineNotification?: string }) {
    await cliRunApi(this, flags, (config) =>
      mailboxQuarantineNotificationEdit({
        config,
        items: mailboxItemsParse(flags.itemsJson, "mailboxQuarantineNotificationEdit") ?? [],
        attr:
          flags.quarantineNotification === undefined ? {} : { quarantine_notification: flags.quarantineNotification },
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      itemsJson: mailboxOptionalJsonFlag("JSON array of mailbox addresses"),
      quarantineNotification: cliScalarFlagParams.optionalString("Quarantine notification interval"),
    },
  },
  docs: { brief: "Edit mailbox quarantine notification" },
})

const quarantineCategoryCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { itemsJson?: string; quarantineCategory?: string }) {
    await cliRunApi(this, flags, (config) =>
      mailboxQuarantineCategoryEdit({
        config,
        items: mailboxItemsParse(flags.itemsJson, "mailboxQuarantineCategoryEdit") ?? [],
        attr: flags.quarantineCategory === undefined ? {} : { quarantine_category: flags.quarantineCategory },
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      itemsJson: mailboxOptionalJsonFlag("JSON array of mailbox addresses"),
      quarantineCategory: cliScalarFlagParams.optionalString("Quarantine category"),
    },
  },
  docs: { brief: "Edit mailbox quarantine category" },
})

const pushoverCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { itemsJson?: string; attrJson?: string }) {
    await cliRunApi(this, flags, (config) =>
      mailboxPushoverEdit({
        config,
        items: mailboxItemsParse(flags.itemsJson, "mailboxPushoverEdit") ?? [],
        attr: mailboxAttrParse(flags.attrJson, "mailboxPushoverEdit") as Record<string, string>,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      itemsJson: mailboxOptionalJsonFlag("JSON array of mailbox addresses"),
      attrJson: mailboxOptionalJsonFlag("Pushover attributes JSON"),
    },
  },
  docs: { brief: "Edit mailbox pushover settings" },
})

const pushoverTestCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { itemsJson?: string; attrJson?: string }) {
    await cliRunApi(this, flags, (config) =>
      mailboxPushoverTestEdit({
        config,
        items: mailboxItemsParse(flags.itemsJson, "mailboxPushoverTestEdit") ?? [],
        attr: mailboxAttrParse(flags.attrJson, "mailboxPushoverTestEdit") as Record<string, string>,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      itemsJson: mailboxOptionalJsonFlag("JSON array of mailbox addresses"),
      attrJson: mailboxOptionalJsonFlag("Test push attributes JSON (title, text)"),
    },
  },
  docs: { brief: "Send a mailbox pushover test" },
})

const activeUserSieveCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { mailbox: string }) {
    await cliRunApi(this, flags, (config) => mailboxActiveUserSieveGet({ config, mailbox: flags.mailbox }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      mailbox: cliScalarFlagParams.requiredString("Mailbox address"),
    },
  },
  docs: { brief: "Get mailbox active sieve script" },
})

const bccDestinationOptionsCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => bccDestinationOptionsGet({ config }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "Get BCC destination options" },
})

const lastLoginCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { user: string; days?: number }) {
    await cliRunApi(this, flags, (config) => mailboxLastLoginGet({ config, user: flags.user, days: flags.days }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      user: cliScalarFlagParams.requiredString("Username"),
      days: cliScalarFlagParams.optionalNumber("Lookback days (default 7)"),
    },
  },
  docs: { brief: "Get mailbox last logins" },
})

const lastLoginResetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { user: string }) {
    await cliRunApi(this, flags, (config) => mailboxLastLoginReset({ config, user: flags.user }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      user: cliScalarFlagParams.requiredString("Username"),
    },
  },
  docs: { brief: "Reset mailbox last logins" },
})

const deleteCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { itemsJson?: string }) {
    await cliRunApi(this, flags, (config) =>
      mailboxDelete({ config, items: mailboxItemsParse(flags.itemsJson, "mailboxDelete") ?? [] }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      itemsJson: mailboxOptionalJsonFlag("JSON array of mailbox addresses to delete"),
    },
  },
  docs: { brief: "Delete mailboxes" },
})

const templateDeleteCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { itemsJson?: string }) {
    await cliRunApi(this, flags, (config) =>
      mailboxTemplateDelete({ config, items: mailboxItemsParse(flags.itemsJson, "mailboxTemplateDelete") ?? [] }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      itemsJson: mailboxOptionalJsonFlag("JSON array of template ids to delete"),
    },
  },
  docs: { brief: "Delete mailbox templates" },
})

const tagDeleteCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { mailbox: string; itemsJson?: string }) {
    const itemsResult = cliJsonParse(flags.itemsJson, "mailboxTagDelete", "itemsJson")
    if (!itemsResult.success) cliFail(itemsResult)
    await cliRunApi(this, flags, (config) =>
      mailboxTagDelete({ config, mailbox: flags.mailbox, items: (itemsResult.data ?? []) as string[] }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      mailbox: cliScalarFlagParams.requiredString("Mailbox address"),
      itemsJson: mailboxOptionalJsonFlag("JSON array of tag names to delete"),
    },
  },
  docs: { brief: "Delete mailbox tags" },
})

const easCacheDeleteCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { itemsJson?: string }) {
    await cliRunApi(this, flags, (config) =>
      mailboxEasCacheDelete({ config, items: mailboxItemsParse(flags.itemsJson, "mailboxEasCacheDelete") ?? [] }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      itemsJson: mailboxOptionalJsonFlag("JSON array of mailbox addresses"),
    },
  },
  docs: { brief: "Purge mailbox EAS cache" },
})

const sogoProfileDeleteCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { itemsJson?: string }) {
    await cliRunApi(this, flags, (config) =>
      mailboxSogoProfileDelete({ config, items: mailboxItemsParse(flags.itemsJson, "mailboxSogoProfileDelete") ?? [] }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      itemsJson: mailboxOptionalJsonFlag("JSON array of mailbox addresses"),
    },
  },
  docs: { brief: "Wipe mailbox SOGo profiles" },
})

const searchCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { draw?: number; start?: number; length?: number; searchValue?: string },
  ) {
    await cliRunApi(this, flags, (config) =>
      mailboxSearch({
        config,
        draw: flags.draw,
        start: flags.start,
        length: flags.length,
        search: flags.searchValue === undefined ? undefined : { value: flags.searchValue },
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      draw: cliScalarFlagParams.optionalNumber("DataTables draw counter"),
      start: cliScalarFlagParams.optionalNumber("Paging start offset"),
      length: cliScalarFlagParams.optionalNumber("Page length"),
      searchValue: cliScalarFlagParams.optionalString("Global search value"),
    },
  },
  docs: { brief: "Search mailboxes (DataTables)" },
})

export const mailboxCommands = buildRouteMap({
  routes: {
    add: addCommand,
    "template-add": templateAddCommand,
    list: listCommand,
    "reduced-list": reducedListCommand,
    "template-list": templateListCommand,
    "template-get": templateGetCommand,
    get: getCommand,
    edit: editCommand,
    "template-edit": templateEditCommand,
    "custom-attribute-edit": customAttributeCommand,
    rename: renameCommand,
    "user-acl-edit": userAclCommand,
    "spam-score-edit": spamScoreEditCommand,
    "spam-score-get": spamScoreGetCommand,
    "delimiter-action-edit": delimiterActionCommand,
    "tls-policy-edit": tlsPolicyCommand,
    "quarantine-notification-edit": quarantineNotificationCommand,
    "quarantine-category-edit": quarantineCategoryCommand,
    "pushover-edit": pushoverCommand,
    "pushover-test": pushoverTestCommand,
    "active-user-sieve-get": activeUserSieveCommand,
    "bcc-destination-options-get": bccDestinationOptionsCommand,
    "last-login-get": lastLoginCommand,
    "last-login-reset": lastLoginResetCommand,
    delete: deleteCommand,
    "template-delete": templateDeleteCommand,
    "tag-delete": tagDeleteCommand,
    "eas-cache-delete": easCacheDeleteCommand,
    "sogo-profile-delete": sogoProfileDeleteCommand,
    search: searchCommand,
  },
  docs: { brief: "Manage mailcow mailboxes" },
})
