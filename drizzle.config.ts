import { type Config } from "drizzle-kit";
import { env } from "~/env";

const nonPoolingUrl = env.DATABASE_URL.replace(':6543', ':5432')


export default {
  schema: "./src/server/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: nonPoolingUrl
  },
  tablesFilter: ["piloto_*"],
  out: "./src/server/db/migrations",
} satisfies Config;
