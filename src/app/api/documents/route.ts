import { NextRequest, NextResponse } from 'next/server'
import { drive, oauth2Client, DriveDocument } from '@/lib/google-drive'

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

// GET - Listar documentos
export async function GET(request: NextRequest) {
  const authError = await checkAuth(request)
  if (authError) return authError

  try {
    const { searchParams } = new URL(request.url)
    const folderId = searchParams.get('folderId')
    const mimeType = searchParams.get('mimeType')
    const q = searchParams.get('q') // query de busca

    let query = "trashed = false"
    
    if (folderId) {
      query += ` and '${folderId}' in parents`
    }
    
    if (mimeType) {
      query += ` and mimeType = '${mimeType}'`
    }
    
    if (q) {
      query += ` and name contains '${q}'`
    }

    const response = await drive.files.list({
      q: query,
      fields: 'files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink,parents,description,starred)',
      orderBy: 'modifiedTime desc',
      pageSize: 50
    })

    const documents: DriveDocument[] = response.data.files || []

    return NextResponse.json({
      success: true,
      documents,
      total: documents.length
    })

  } catch (error) {
    console.error('Erro ao listar documentos:', error)
    return NextResponse.json(
      { error: 'Erro ao listar documentos' },
      { status: 500 }
    )
  }
}

// POST - Criar/Upload documento
export async function POST(request: NextRequest) {
  const authError = await checkAuth(request)
  if (authError) return authError

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folderId = formData.get('folderId') as string
    const description = formData.get('description') as string

    if (!file) {
      return NextResponse.json(
        { error: 'Arquivo é obrigatório' },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    
    const metadata = {
      name: file.name,
      parents: folderId ? [folderId] : undefined,
      description: description || undefined
    }

    const response = await drive.files.create({
      requestBody: metadata,
      media: {
        mimeType: file.type,
        body: buffer
      },
      fields: 'id,name,mimeType,size,createdTime,modifiedTime,webViewLink'
    })

    return NextResponse.json({
      success: true,
      document: response.data
    })

  } catch (error) {
    console.error('Erro ao criar documento:', error)
    return NextResponse.json(
      { error: 'Erro ao criar documento' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar documento
export async function PUT(request: NextRequest) {
  const authError = await checkAuth(request)
  if (authError) return authError

  try {
    const { fileId, name, description, starred, folderId } = await request.json()

    if (!fileId) {
      return NextResponse.json(
        { error: 'ID do arquivo é obrigatório' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    
    if (name) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (starred !== undefined) updateData.starred = starred

    const response = await drive.files.update({
      fileId,
      requestBody: updateData,
      fields: 'id,name,mimeType,size,createdTime,modifiedTime,webViewLink,description,starred'
    })

    // Se mudou de pasta
    if (folderId) {
      await drive.files.update({
        fileId,
        addParents: folderId,
        removeParents: 'root'
      })
    }

    return NextResponse.json({
      success: true,
      document: response.data
    })

  } catch (error) {
    console.error('Erro ao atualizar documento:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar documento' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir documento
export async function DELETE(request: NextRequest) {
  const authError = await checkAuth(request)
  if (authError) return authError

  try {
    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('fileId')

    if (!fileId) {
      return NextResponse.json(
        { error: 'ID do arquivo é obrigatório' },
        { status: 400 }
      )
    }

    await drive.files.delete({
      fileId
    })

    return NextResponse.json({
      success: true,
      message: 'Documento excluído com sucesso'
    })

  } catch (error) {
    console.error('Erro ao excluir documento:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir documento' },
      { status: 500 }
    )
  }
}
