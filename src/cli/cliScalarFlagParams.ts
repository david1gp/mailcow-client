/** Small, explicit Stricli descriptor factories for scalar operation options. */
export const cliScalarFlagParams = {
  optionalBoolean(brief: string) {
    return { kind: "boolean" as const, optional: true as const, brief }
  },
  requiredBoolean(brief: string) {
    return { kind: "boolean" as const, brief }
  },
  optionalNumber(brief: string) {
    return { kind: "parsed" as const, parse: Number, optional: true as const, brief }
  },
  requiredNumber(brief: string) {
    return { kind: "parsed" as const, parse: Number, brief }
  },
  optionalString(brief: string) {
    return { kind: "parsed" as const, parse: String, optional: true as const, brief }
  },
  requiredString(brief: string) {
    return { kind: "parsed" as const, parse: String, brief }
  },
  optionalStringList(brief: string) {
    return { kind: "parsed" as const, parse: String, optional: true as const, variadic: "," as const, brief }
  },
}
