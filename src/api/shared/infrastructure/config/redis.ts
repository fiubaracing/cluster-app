import { createClient } from "redis";

const redis = createClient({
	url: process.env.REDIS_URL || "redis://localhost:6379",
	socket: {
		reconnectStrategy: (retries) => {
			if (retries > 3) {
				// Returning an Error stops the retries and rejects the .connect() promise
				return new Error("Max retries reached, giving up.");
			}
			// Wait 1000ms before trying again
			return 1000;
		},
	},
});

redis.on("error", (err) =>
	console.error("Redis connection failed:", err.message),
);

try {
	await redis.connect();
	console.log("Connected to Redis!");
} catch (error) {
	// THIS will now run after the 3rd failed attempt!
	console.error("Failed to connect to Redis on startup. Exiting...");
	process.exit(1);
}

async function setCache<T>(key: string, value: T, ttl: number): Promise<void> {
	const jsonString = JSON.stringify(value);
	await redis.set(key, jsonString, {
		expiration: { type: "EX", value: ttl },
	});
}

// Parse after retrieving
async function getCached<T>(key: string): Promise<T | null> {
	const jsonString = await redis.get(key);

	if (!jsonString) {
		return null;
	}

	try {
		// JSON.parse returns 'any' by default, so we cast it to T
		return JSON.parse(jsonString) as T;
	} catch (error) {
		console.error(`Failed to parse JSON for key ${key}:`, error);
		return null;
	}
}

async function deleteCached(key: string): Promise<void> {
	await redis.del(key);
}

export { setCache, getCached, deleteCached };
