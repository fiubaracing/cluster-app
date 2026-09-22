import { asc, desc } from "drizzle-orm";
import type { PaginatedSortedDTO } from "../../application/dtos/paginated-sorted.dto";
import {
  type SortDirection,
  SortDirectionEnum,
} from "../../domain/models/sort-direction.model";

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
}
