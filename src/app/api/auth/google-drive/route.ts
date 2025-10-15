import { NextRequest, NextResponse } from 'next/server'
import { getAuthUrl, getTokens } from '@/lib/google-drive'

// GET - Obter URL de autorização
export async function GET() {
  try {
    const authUrl = getAuthUrl()
    
    return NextResponse.json({
      success: true,
      authUrl
    })
  } catch (error) {
    console.error('Erro ao gerar URL de autorização:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar URL de autorização' },
      { status: 500 }
    )
  }
}

// POST - Trocar código por tokens
export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json(
        { error: 'Código de autorização é obrigatório' },
        { status: 400 }
      )
    }

    const tokens = await getTokens(code)

    return NextResponse.json({
      success: true,
      tokens
    })
  } catch (error) {
    console.error('Erro ao trocar código por tokens:', error)
    return NextResponse.json(
      { error: 'Erro ao obter tokens de acesso' },
      { status: 500 }
    )
  }
}
