import { UpserUserRequestBody } from "@/api/users/presentation/dtos/requests/upsert-user.request";
import { UpsertUserDTO } from "@/api/users/application/dtos/upsert-user.dto";

export class UserMapper {
    static toUpsertUserDTO(body: UpserUserRequestBody): UpsertUserDTO {
        const dto = new UpsertUserDTO();
        dto.email = body.email;
        dto.name = body.name ?? '';
        return dto;
    }
}