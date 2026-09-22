import { GoogleResponse } from "@/api/auth/domain/models/google-response";
import type { GoogleResponseDTO } from "@/api/auth/infrastructure/dtos/google-response.dto";

export class GoogleOAuthResponseMapper {
  static toDomain(googleResponse: GoogleResponseDTO): GoogleResponse {
    return Object.assign(new GoogleResponse(), googleResponse);
  }
}
