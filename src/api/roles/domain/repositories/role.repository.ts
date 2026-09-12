import { UUID } from "crypto";
import { Role } from "@/api/roles/domain/models/role.model";

export interface RoleRepository {
    /**
     * Finds roles by their UUIDs.
     * @param uuids - An array of UUIDs representing the roles to find.
     * @returns A promise that resolves to an array of Role objects if found, or an empty array if not found.
     */
    findByUuidIn(uuids: UUID[]): Promise<Role[]>;
}