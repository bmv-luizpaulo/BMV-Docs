import NextAuth, { NextAuthOptions, User, Account } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { JWT } from "next-auth/jwt"

// Verificação de variáveis de ambiente
if (!process.env.GOOGLE_CLIENT_ID) {
  throw new Error("Missing GOOGLE_CLIENT_ID in .env")
}
if (!process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error("Missing GOOGLE_CLIENT_SECRET in .env")
}
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("Missing NEXTAUTH_SECRET in .env")
}
if (!process.env.NEXTAUTH_URL) {
  throw new Error("Missing NEXTAUTH_URL in .env")
}

// Estendendo os tipos do NextAuth para incluir nossas propriedades customizadas
declare module "next-auth" {
  interface Session {
    accessToken?: string
    user: {
      id: string
    } & User
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    accessToken?: string
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
    error: "/login", // Página de erro aponta para o login
  },

  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "google") {
        // Verifica se o perfil e o email existem, e se o email termina com @bmv.global
        if (profile?.email && profile.email.endsWith("@bmv.global")) {
          return true // Permite o login
        } else {
          // Nega o acesso para outros domínios ou se o email não estiver disponível
          // Pode ser útil redirecionar para uma página de erro customizada aqui
          return false 
        }
      }
      // Nega o acesso para outros provedores que não sejam "google"
      return false
    },
    
    async jwt({ token, user, account }): Promise<JWT> {
      // Na primeira vez que o usuário loga (user e account estão presentes)
      if (account && user) {
        return {
          ...token,
          id: user.id,
          accessToken: account.access_token,
        }
      }
      return token
    },

    async session({ session, token }): Promise<Session> {
      // Adiciona o id e o accessToken do token para o objeto da sessão
      if (session.user) {
        session.user.id = token.id
      }
      session.accessToken = token.accessToken
      return session
    },
  },

  debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
