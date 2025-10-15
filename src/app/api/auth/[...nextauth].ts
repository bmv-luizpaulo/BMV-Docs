import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"

// Estender tipos do NextAuth
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
  }
}

// Configuração do NextAuth
export const authOptions: NextAuthOptions = {
  providers: [
    // Provedor Google
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    
    // Provedor de Credenciais (Email/Senha)
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { 
          label: "Email", 
          type: "email", 
          placeholder: "seu@email.com" 
        },
        password: { 
          label: "Senha", 
          type: "password" 
        }
      },
      async authorize(credentials) {
        // Validação básica
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Lista de usuários válidos
        const users = [
          {
            id: "1",
            email: "admin@bmv.com",
            password: "admin123",
            name: "Administrador BMV"
          },
          {
            id: "2", 
            email: "user@bmv.com",
            password: "user123",
            name: "Usuário BMV"
          },
          {
            id: "3",
            email: "teste@bmv.com", 
            password: "teste123",
            name: "Usuário Teste"
          }
        ]

        // Buscar usuário
        const user = users.find(
          u => u.email === credentials.email && u.password === credentials.password
        )

        if (user) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
          }
        }

        return null
      }
    })
  ],

  // Configurações de sessão
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },

  // Páginas personalizadas
  pages: {
    signIn: "/login",
    error: "/login",
  },

  // Callbacks
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
      }
      return session
    },

    async redirect({ url, baseUrl }) {
      // Redirecionamento após login
      if (url.startsWith("/")) return `${baseUrl}${url}`
      if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  },

  // Configurações de segurança
  secret: process.env.NEXTAUTH_SECRET,
  
  // Debug em desenvolvimento
  debug: process.env.NODE_ENV === "development",
}

// Handler do NextAuth
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }