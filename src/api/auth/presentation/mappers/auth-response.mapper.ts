import { Auth } from "../../domain/models/auth";
import { AuthResponse } from "../dtos/responses/auth.response";

export const mapAuthResponse = (data: Auth): AuthResponse => {
    return Object.assign(new AuthResponse(), data);
}