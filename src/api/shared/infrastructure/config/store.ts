import { AsyncLocalStorage } from "node:async_hooks";
import { UserWithRolesAndPermissions } from "@/api/users/domain/models/user.model";

export type Context = {
	traceId: string;
	user: UserWithRolesAndPermissions;
};

const context = new AsyncLocalStorage<Context>();

export default {
	get store() {
		return context.getStore() ?? { traceId: crypto.randomUUID(), user: new UserWithRolesAndPermissions() };
	},

	run(callback: (ctx: Context, ...args: any[]) => Promise<any>) {
		return context.run(this.store, () => callback(this.store));
	},
};
