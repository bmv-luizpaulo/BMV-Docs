import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { DriveDocument, createOAuth2ClientWithToken } from '@/lib/google-drive'
import { apiCache } from '@/lib/api-cache'
import { OAuth2Client } from 'google-auth-library';

// Middleware para verificar autenticação
async function checkAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) {
    console.log('❌ Token de acesso não fornecido')
    return NextResponse.json({ error: 'Token de acesso necessário' }, { status: 401 })
  }

  try {
    const token = authHeader.replace('Bearer ', '')
    console.log('🔑 Token recebido:', token.substring(0, 20) + '...')
    
    // Criar nova instância do OAuth2Client com o token para cada requisição
    const client = createOAuth2ClientWithToken(token)
    
    console.log('✅ Credenciais configuradas com sucesso para esta requisição')
    return { client }
  } catch (error: any) {
    console.error('❌ Erro ao configurar credenciais:', error.message)
    return NextResponse.json({ error: 'Token inválido', details: error.message }, { status: 401 })
  }
}

// GET - Listar documentos
export async function GET(request: NextRequest) {
  console.log('📄 Iniciando listagem de documentos')
  
  if (process.env.GEMINI_API_KEY) {
    console.log('✅ Chave de API do Google encontrada.');
    google.options({ key: process.env.GEMINI_API_KEY });
  } else {
    console.error('❌ Chave de API do Google (GEMINI_API_KEY) não encontrada nas variáveis de ambiente.');
    return NextResponse.json({ error: 'Configuração do servidor incompleta: Chave de API ausente.', details: 'A variável de ambiente GEMINI_API_KEY não está definida.' }, { status: 500 });
  }

  const authResult = await checkAuth(request)
  if (authResult instanceof NextResponse) return authResult

  try {
    const { searchParams } = new URL(request.url)
    const folderId = searchParams.get('folderId') || 'root'
    const mimeType = searchParams.get('mimeType')
    const q = searchParams.get('q') // query de busca

    console.log('🔍 Parâmetros:', { folderId, mimeType, q })

    // Verificar cache primeiro
    const cacheKey = apiCache.generateKey('documents', { folderId, mimeType, q })
    const cachedResult = apiCache.get(cacheKey)
    
    if (cachedResult) {
      console.log('✅ Retornando dados do cache')
      return NextResponse.json(cachedResult)
    }

    let query = "trashed = false"
    
    if (folderId) {
      query += ` and '${folderId}' in parents`
    }
    
    if (mimeType) {
      query += ` and mimeType contains '${mimeType}'`
    }
    
    if (q) {
      query += ` and name contains '${q}'`
    }

    console.log('🔍 Query final:', query)

    // Criar instância do Drive API com o cliente autenticado específico da requisição
    const driveWithAuth = google.drive({ version: 'v3', auth: authResult.client as OAuth2Client })

    const response = await driveWithAuth.files.list({
      q: query,
      fields: 'files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink,parents,description,starred)',
      orderBy: 'folder, modifiedTime desc',
      pageSize: 100
    })

    const documents: DriveDocument[] = (response.data.files || []).map(file => ({
      ...file,
      id: file.id || '',
      name: file.name || '',
      mimeType: file.mimeType || '',
      createdTime: file.createdTime || '',
      modifiedTime: file.modifiedTime || '',
    }));
    console.log('✅ Documentos encontrados:', documents.length)

    const result = {
      success: true,
      documents,
      total: documents.length
    }

    // Salvar no cache (5 minutos)
    apiCache.set(cacheKey, result, 5 * 60 * 1000)

    return NextResponse.json(result)

  } catch (error: any) {
    console.error('❌ Erro ao listar documentos:', error.message)
    return NextResponse.json(
      { error: 'Erro ao listar documentos', details: error.message },
      { status: 500 }
    )
  }
}

// POST - Criar/Upload documento
export async function POST(request: NextRequest) {
  if (process.env.GEMINI_API_KEY) {
    google.options({ key: process.env.GEMINI_API_KEY });
  } else {
    return NextResponse.json({ error: 'Configuração do servidor incompleta: Chave de API ausente.' }, { status: 500 });
  }

  const authResult = await checkAuth(request)
  if (authResult instanceof NextResponse) return authResult

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folderId = formData.get('folderId') as string
    const description = formData.get('description') as string

    if (!file) {
      return NextResponse.json({ error: 'Arquivo é obrigatório' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    
    const metadata = {
      name: file.name,
      parents: folderId ? [folderId] : undefined,
      description: description || undefined
    }
    
    const driveWithAuth = google.drive({ version: 'v3', auth: authResult.client as OAuth2Client })

    const response = await driveWithAuth.files.create({
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

  } catch (error: any) {
    console.error('Erro ao criar documento:', error.message)
    return NextResponse.json(
      { error: 'Erro ao criar documento', details: error.message },
      { status: 500 }
    )
  }
}

// PUT - Atualizar documento
export async function PUT(request: NextRequest) {
  if (process.env.GEMINI_API_KEY) {
    google.options({ key: process.env.GEMINI_API_KEY });
  } else {
    return NextResponse.json({ error: 'Configuração do servidor incompleta: Chave de API ausente.' }, { status: 500 });
  }

  const authResult = await checkAuth(request)
  if (authResult instanceof NextResponse) return authResult

  try {
    const { fileId, name, description, starred, folderId } = await request.json()

    if (!fileId) {
      return NextResponse.json({ error: 'ID do arquivo é obrigatório' }, { status: 400 })
    }

    const updateData: any = {}
    
    if (name) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (starred !== undefined) updateData.starred = starred

    const driveWithAuth = google.drive({ version: 'v3', auth: authResult.client as OAuth2Client })
    
    const response = await driveWithAuth.files.update({
      fileId,
      requestBody: updateData,
      fields: 'id,name,mimeType,size,createdTime,modifiedTime,webViewLink,description,starred'
    })

    // Se mudou de pasta
    if (folderId) {
      const file = await driveWithAuth.files.get({ fileId, fields: 'parents' })
      const previousParents = file.data.parents?.join(',')
      
      await driveWithAuth.files.update({
        fileId,
        addParents: folderId,
        removeParents: previousParents,
      })
    }

    return NextResponse.json({
      success: true,
      document: response.data
    })

  } catch (error: any) {
    console.error('Erro ao atualizar documento:', error.message)
    return NextResponse.json(
      { error: 'Erro ao atualizar documento', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Excluir documento
export async function DELETE(request: NextRequest) {
  if (process.env.GEMINI_API_KEY) {
    google.options({ key: process.env.GEMINI_API_KEY });
  } else {
    return NextResponse.json({ error: 'Configuração do servidor incompleta: Chave de API ausente.' }, { status: 500 });
  }

  const authResult = await checkAuth(request)
  if (authResult instanceof NextResponse) return authResult

  try {
    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('fileId')

    if (!fileId) {
      return NextResponse.json({ error: 'ID do arquivo é obrigatório' }, { status: 400 })
    }

    const driveWithAuth = google.drive({ version: 'v3', auth: authResult.client as OAuth2Client })

    await driveWithAuth.files.delete({
      fileId
    })

    return NextResponse.json({
      success: true,
      message: 'Documento excluído com sucesso'
    })

  } catch (error: any) {
    console.error('Erro ao excluir documento:', error.message)
    return NextResponse.json(
      { error: 'Erro ao excluir documento', details: error.message },
      { status: 500 }
    )
  }
}
