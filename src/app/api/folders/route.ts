import { NextRequest, NextResponse } from 'next/server'
import { drive, oauth2Client } from '@/lib/google-drive'

// Middleware para verificar autenticação
async function checkAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) {
    return NextResponse.json({ error: 'Token de acesso necessário' }, { status: 401 })
  }

  try {
    const token = authHeader.replace('Bearer ', '')
    oauth2Client.setCredentials({ access_token: token })
    return null
  } catch (error) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
  }
}

// GET - Listar pastas
export async function GET(request: NextRequest) {
  const authError = await checkAuth(request)
  if (authError) return authError

  try {
    const { searchParams } = new URL(request.url)
    const parentId = searchParams.get('parentId') || 'root'

    const response = await drive.files.list({
      q: `mimeType = 'application/vnd.google-apps.folder' and trashed = false and '${parentId}' in parents`,
      fields: 'files(id,name,createdTime,modifiedTime,parents)',
      orderBy: 'name'
    })

    const folders = response.data.files || []

    return NextResponse.json({
      success: true,
      folders
    })

  } catch (error) {
    console.error('Erro ao listar pastas:', error)
    return NextResponse.json(
      { error: 'Erro ao listar pastas' },
      { status: 500 }
    )
  }
}

// POST - Criar pasta
export async function POST(request: NextRequest) {
  const authError = await checkAuth(request)
  if (authError) return authError

  try {
    const { name, parentId, description } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'Nome da pasta é obrigatório' },
        { status: 400 }
      )
    }

    const metadata = {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentId ? [parentId] : ['root'],
      description: description || undefined
    }

    const response = await drive.files.create({
      requestBody: metadata,
      fields: 'id,name,createdTime,modifiedTime,parents'
    })

    return NextResponse.json({
      success: true,
      folder: response.data
    })

  } catch (error) {
    console.error('Erro ao criar pasta:', error)
    return NextResponse.json(
      { error: 'Erro ao criar pasta' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar pasta
export async function PUT(request: NextRequest) {
  const authError = await checkAuth(request)
  if (authError) return authError

  try {
    const { folderId, name, description } = await request.json()

    if (!folderId) {
      return NextResponse.json(
        { error: 'ID da pasta é obrigatório' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    
    if (name) updateData.name = name
    if (description !== undefined) updateData.description = description

    const response = await drive.files.update({
      fileId: folderId,
      requestBody: updateData,
      fields: 'id,name,createdTime,modifiedTime,parents'
    })

    return NextResponse.json({
      success: true,
      folder: response.data
    })

  } catch (error) {
    console.error('Erro ao atualizar pasta:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar pasta' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir pasta
export async function DELETE(request: NextRequest) {
  const authError = await checkAuth(request)
  if (authError) return authError

  try {
    const { searchParams } = new URL(request.url)
    const folderId = searchParams.get('folderId')

    if (!folderId) {
      return NextResponse.json(
        { error: 'ID da pasta é obrigatório' },
        { status: 400 }
      )
    }

    await drive.files.delete({
      fileId: folderId
    })

    return NextResponse.json({
      success: true,
      message: 'Pasta excluída com sucesso'
    })

  } catch (error) {
    console.error('Erro ao excluir pasta:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir pasta' },
      { status: 500 }
    )
  }
}
