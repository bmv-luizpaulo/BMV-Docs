import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"

// Simulação de banco de dados em memória (em produção, use um banco real)
let users = [
  {
    id: "1",
    email: "admin@bmv.global",
    password: "$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSWvQKz5e2", // senha: admin123
    name: "Administrador BMV",
  },
]

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    // Validações básicas
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Nome, email e senha são obrigatórios" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Senha deve ter pelo menos 6 caracteres" },
        { status: 400 }
      )
    }

    // Verificar se o email já existe
    const existingUser = users.find(user => user.email === email)
    if (existingUser) {
      return NextResponse.json(
        { message: "Email já está em uso" },
        { status: 400 }
      )
    }

    // Criptografar a senha
    const hashedPassword = await bcrypt.hash(password, 10)

    // Criar novo usuário
    const newUser = {
      id: (users.length + 1).toString(),
      name,
      email,
      password: hashedPassword,
    }

    users.push(newUser)

    return NextResponse.json(
      { 
        message: "Conta criada com sucesso",
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
        }
      },
      { status: 201 }
    )

  } catch (error) {
    console.error("Erro ao criar conta:", error)
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

// Função para obter usuários (útil para debug)
export async function GET() {
  return NextResponse.json(
    users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
    }))
  )
}
