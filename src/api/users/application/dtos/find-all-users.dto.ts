import type { DataScope } from "@/api/auth/domain/models/data-scope";
import { PaginatedSortedDTO } from "@/api/shared/application/dtos/paginated-sorted.dto";
import type { UserSortFields } from "@/api/users/domain/models/user-sort-fields.model";

export class FindAllUsersDTO extends PaginatedSortedDTO<UserSortFields> {
  search?: string;
  dataScope!: DataScope;
}
