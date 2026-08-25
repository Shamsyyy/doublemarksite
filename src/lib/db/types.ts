export type OrgRole = "owner" | "admin" | "operator";

export type OrganizationRecord = {
  id: string;
  legalName: string;
  inn: string | null;
  phone: string | null;
  email: string | null;
  createdAt: string;
};

export type EntitlementRecord = {
  orgId: string;
  canDownload: boolean;
  devicesLimit: number;
};

export type MarkingCodeRecord = {
  id: string;
  orgId: string;
  gtin: string | null;
  serial: string | null;
  payloadHash: string;
  cryptoTailHash: string | null;
  firstSeenAt: string;
  lastSeenAt: string;
};

export type CodeOperationKind = "scan" | "parse" | "print" | "fail";

export type CodeOperationRecord = {
  id: string;
  orgId: string;
  codeId: string | null;
  deviceId: string | null;
  kind: CodeOperationKind;
  durationMs: number | null;
  errorCode: string | null;
  createdAt: string;
};
