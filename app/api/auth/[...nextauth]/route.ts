import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import AzureADProvider from "next-auth/providers/azure-ad";
import { createHash, timingSafeEqual } from "node:crypto";

function secureEqual(value: string, expected: string) {
  const valueHash = createHash("sha256").update(value).digest();
  const expectedHash = createHash("sha256").update(expected).digest();
  return timingSafeEqual(valueHash, expectedHash);
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Admin",
      credentials: {
        email: { label: "E-Mail", type: "email" },
        password: { label: "Passwort", type: "password" },
      },
      async authorize(credentials) {
        const adminEmail = process.env.ADMIN_EMAIL?.trim();
        const adminPassword = process.env.ADMIN_PASSWORD;
        const email = credentials?.email?.trim();
        const password = credentials?.password;
        if (!adminEmail || !adminPassword || !email || !password) return null;

        const validEmail = secureEqual(email.toLowerCase(), adminEmail.toLowerCase());
        const validPassword = secureEqual(password, adminPassword);
        if (!validEmail || !validPassword) return null;

        return { id: "admin", name: "Administrator", email: adminEmail };
      },
    }),
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
      authorization: {
        params: {
          scope: "openid profile email offline_access Calendars.ReadWrite",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account?.provider) {
        token.authProvider = account.provider;
      }
      if (account?.provider === "azure-ad" && account.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (typeof token.accessToken === "string") {
        session.accessToken = token.accessToken;
      }
      if (typeof token.authProvider === "string") {
        session.authProvider = token.authProvider;
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
