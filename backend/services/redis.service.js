import Redis from "ioredis";

const redisClient = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,

  /* -------------------- CONNECTION OPTIONS -------------------- */

  maxRetriesPerRequest: null,
  enableReadyCheck: false,

  retryStrategy(times) {
    if (times > 5) {
      console.log("❌ Redis retry limit reached");
      return null;
    }

    return Math.min(times * 200, 2000);
  }
});

/* -------------------------------------------------------------------------- */
/* EVENTS */
/* -------------------------------------------------------------------------- */

redisClient.on("connect", () => {
  console.log("🟢 Redis connected");
});

redisClient.on("error", (err) => {
  console.log("🔴 Redis error:", err.message);
});

export default redisClient;