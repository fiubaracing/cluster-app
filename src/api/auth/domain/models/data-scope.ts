import type { UUID } from "crypto";

export class DataScope {
  isGlobal!: boolean;
  ownerUuid!: UUID | null;
  teamUuids!: UUID[] | null;
}
