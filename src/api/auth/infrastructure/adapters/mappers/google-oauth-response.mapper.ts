import { GoogleResponseDTO } from "@/api/auth/infrastructure/dtos/google-response.dto";
import { GoogleResponse } from "@/api/auth/domain/models/google-response";

export class GoogleOAuthResponseMapper {
    static toDomain(googleResponse: GoogleResponseDTO): GoogleResponse {
        return Object.assign(new GoogleResponse(), googleResponse);
    }
}