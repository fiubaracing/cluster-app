import AuthController from "@/api/auth/presentation/controllers/auth";

const controller = new AuthController();

export const POST = controller.login.bind(controller);
