import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions, Session } from "next-auth";
import { prisma } from "./prisma";
import { JWT } from "next-auth/jwt";

export type Token = JWT & {
  access_token: string;
  expires_at: number;
  refresh_token: string;
  error: string | null;
};

export type ExtendedSession = Session & {
  error: string | null;
};

// callback execution flow:
// signIn -> jwt -> session

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: { params: { access_type: "offline", prompt: "consent" } },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      try {
        console.log("signIn: ");
        // Check if user exists in your database
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        // If user doesn't exist, create new user
        if (!existingUser) {
          await prisma.user.create({
            data: {
              email: user.email!,
            },
          });
        }

        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },
    async jwt({ token, account }) {
      const extendedToken = { ...token } as Token;
      console.log("current jwt: ", extendedToken);
      if (account) {
        console.log("first time login: ");
        // console.log("account: ", account);
        // First-time login, save the `access_token`, its expiry and the `refresh_token`
        return {
          ...extendedToken,
          access_token: account.access_token,
          expires_at: account.expires_at,
          refresh_token: account.refresh_token,
        };
      } else if (Date.now() < extendedToken.expires_at * 1000) {
        console.log("subsequent login: still valid");
        // Subsequent logins, but the `access_token` is still valid
        console.log(
          "subsequent login: newTokens: expires_at",
          extendedToken.expires_at
        );
        return token;
      } else {
        console.log("subsequent login: expired, refreshing");

        try {
          // Subsequent logins, but the `access_token` has expired, try to refresh it
          if (!token.refresh_token)
            throw new TypeError("Missing refresh_token");
          // The `token_endpoint` can be found in the provider's documentation. Or if they support OIDC,
          // at their `/.well-known/openid-configuration` endpoint.
          // i.e. https://accounts.google.com/.well-known/openid-configuration
          const response = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            body: new URLSearchParams({
              client_id: process.env.GOOGLE_CLIENT_ID!,
              client_secret: process.env.GOOGLE_CLIENT_SECRET!,
              grant_type: "refresh_token",
              refresh_token: token.refresh_token as string,
            }),
          });

          // console.log("subsequent login: response: ", response);

          const tokensOrError = await response.json();
          console.log("subsequent login: tokensOrError: ", tokensOrError);
          if (!response.ok) throw tokensOrError;

          const newTokens = tokensOrError as {
            access_token: string;
            expires_in: number;
            refresh_token?: string;
          };
          console.log("subsequent login: updated token: ", {
            ...token,
            access_token: newTokens.access_token,
            expires_at: Math.floor(Date.now() / 1000 + newTokens.expires_in),
            // Some providers only issue refresh tokens once, so preserve if we did not get a new one
            refresh_token: newTokens.refresh_token
              ? newTokens.refresh_token
              : token.refresh_token,
          });

          return {
            ...token,
            access_token: newTokens.access_token,
            expires_at: Math.floor(Date.now() / 1000 + newTokens.expires_in),
            // Some providers only issue refresh tokens once, so preserve if we did not get a new one
            refresh_token: newTokens.refresh_token
              ? newTokens.refresh_token
              : token.refresh_token,
          };
        } catch (error) {
          console.error("Error refreshing access_token", error);
          // If we fail to refresh the token, return an error so we can handle it on the page
          token.error = "RefreshTokenError";
          return token;
        }
      }
    },
    async session({ session, token }) {
      const extendedToken = { ...token } as Token;
      // console.log("extendedToken: ", extendedToken);
      const extendedSession = { ...session } as ExtendedSession;
      extendedSession.error = extendedToken.error;
      return extendedSession;
    },
  },
};
