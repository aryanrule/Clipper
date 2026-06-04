import { betterAuth } from "better-auth";
import { Pool } from "pg";


export const auth = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  emailAndPassword: { enabled: true },
  secret: process.env.BETTER_AUTH_SECRET , 
  socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!
        }
    },

    database: new Pool({
    connectionString: process.env.DATABASE_URL,
    }),
     
     // to be fixed and leftover 
     trustedOrigins: (
      process.env.TRUSTED_ORIGINS ||
      `${process.env.NEXT_PUBLIC_APP_URL},https://www.clippa.in,https://clippa.in`
    )
      .split(/,\s*/)
      .filter(Boolean),
});
