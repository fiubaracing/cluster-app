import { db } from "@/api/shared/config/db";

export async function GET() {
	return Response.json({
		status: "ok",
		dbStatus:
			(await db.execute("SELECT 1").execute())?.rowCount === 1 ?
				"ok"
			:	"error",
	});
}
