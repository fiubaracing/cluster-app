import type { UUID } from "crypto";
import {
  type AnyColumn,
  aliasedTable,
  asc,
  desc,
  eq,
  inArray,
  or,
  type SQL,
  sql,
} from "drizzle-orm";
import type { DataScope } from "@/api/auth/domain/models/data-scope";
import { db } from "@/api/shared/infrastructure/config/db";
import { usersInCore } from "@/db/migrations/schema";
import type { PaginatedSortedDTO } from "../../application/dtos/paginated-sorted.dto";
import {
  type SortDirection,
  SortDirectionEnum,
} from "../../domain/models/sort-direction.model";

const scopeOwner = aliasedTable(usersInCore, "scope_owner");

export interface DataScopeColumns {
  /** Column holding the creator's users.id */
  createdBy: AnyColumn;
  /** Builds the resource-specific "belongs to one of these teams" condition */
  inTeams?: (teamUuids: UUID[]) => SQL;
}

export class DrizzleRepository {
  static toDrizzleSortDirection(direction: SortDirection) {
    switch (direction) {
      case SortDirectionEnum.ASC:
        return asc;
      case SortDirectionEnum.DESC:
        return desc;
    }
  }

  static toOrderByClause<T extends string>(
    dto: PaginatedSortedDTO<T>,
    schema: Record<T, any>,
  ) {
    if (dto.sort.size === 0) {
      const field = (schema as any)?.createdAt
        ? (schema as any).createdAt
        : Object.values(schema)[0];
      return [desc(field)];
    }

    return Array.from(dto.sort).map((field) =>
      DrizzleRepository.toDrizzleSortDirection(dto.direction)(schema[field]),
    );
  }

  static toDataScopeClause(
    scope: DataScope,
    columns: DataScopeColumns,
  ): SQL | undefined {
    if (scope.isGlobal) return undefined;

    const clauses: SQL[] = [];

    if (scope.ownerUuid) {
      clauses.push(
        inArray(
          columns.createdBy,
          db
            .select({ id: scopeOwner.id })
            .from(scopeOwner)
            .where(eq(scopeOwner.uuid, scope.ownerUuid)),
        ),
      );
    }

    if (columns.inTeams && scope.teamUuids?.length) {
      clauses.push(columns.inTeams(scope.teamUuids));
    }

    // No read permission at all → match nothing
    return clauses.length > 0 ? or(...clauses) : sql`false`;
  }

  static escapeLikePattern(value: string): string {
    return value.replace(/[\\%_]/g, "\\$&");
  }
}
