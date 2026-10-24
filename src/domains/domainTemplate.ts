/** Domain template row (`mailbox get domain_templates`, stored attributes JSON). */
export type DomainTemplate = {
  id: number
  template: string
  attributes?: Record<string, unknown>
}
