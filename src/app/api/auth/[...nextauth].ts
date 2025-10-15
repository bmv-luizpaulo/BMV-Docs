
import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import type { JWT } from "next-auth/jwt"
import type { User, Account, Profile, Session } from "next-auth"

// Verificar se as variáveis de ambiente estão definidas
if (!process.env.GOOGLE_CLIENT_ID) {
  throw new Error("GOOGLE_CLIENT_ID não está definido nas variáveis de ambiente")
}

if (!process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error("GOOGLE_CLIENT_SECRET não está definido nas variáveis de ambiente")
}

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET não está definido nas variáveis de ambiente")
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
    error: '/login', // Redirect to login page on error
  },
  callbacks: {
    async jwt({ token, account, profile }: { token: JWT; account: Account | null; profile?: Profile | undefined; user?: User | undefined; }): Promise<JWT> {
      // Primeira vez que o JWT é criado
      if (account && profile) {
        token.accessToken = account.access_token;
        token.id = profile.sub; // Google profile 'sub' is the user ID
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT; }): Promise<Session> {
      // Adicionar dados do token ao objeto da sessão
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
      }
      (session as { accessToken?: string }).accessToken = token.accessToken as string;
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Permite redirecionamentos relativos
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Permite redirecionamentos para o mesmo domínio
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
