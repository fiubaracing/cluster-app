import { PaginatedDTO } from "@/api/shared/application/dtos/paginated.dto";
import {
  type SortDirection,
  SortDirectionEnum,
} from "@/api/shared/domain/models/sort-direction.model";

export class PaginatedSortedDTO<T extends string> extends PaginatedDTO {
  sort: Set<T> = new Set<T>();
  direction: SortDirection = SortDirectionEnum.ASC;
}
