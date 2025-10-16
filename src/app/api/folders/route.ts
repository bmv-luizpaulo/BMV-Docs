import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { createOAuth2ClientWithToken } from '@/lib/google-drive'
import { apiCache } from '@/lib/api-cache'
import { OAuth2Client } from 'google-auth-library'

// Middleware para verificar autenticação e API Key
async function checkAuth(request: NextRequest) {
  // 1. Verificar API Key
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ Chave de API do Google (GEMINI_API_KEY) não encontrada nas variáveis de ambiente.');
    return NextResponse.json({ error: 'Configuração do servidor incompleta: Chave de API ausente.', details: 'A variável de ambiente GEMINI_API_KEY não está definida.' }, { status: 500 });
  }
  console.log('✅ Chave de API do Google encontrada.');

  // 2. Verificar Token de Acesso
  const authHeader = request.headers.get('authorization')
  if (!authHeader) {
    console.log('❌ Token de acesso não fornecido')
    return NextResponse.json({ error: 'Token de acesso necessário' }, { status: 401 })
  }

  try {
    const token = authHeader.replace('Bearer ', '')
    console.log('🔑 Token recebido:', token.substring(0, 20) + '...');
    
    // Criar nova instância do OAuth2Client com o token para cada requisição
    const client = createOAuth2ClientWithToken(token);
    
    console.log('✅ Credenciais configuradas com sucesso para esta requisição');
    return { client };
  } catch (error: any) {
    console.error('❌ Erro ao configurar credenciais:', error.message);
    return NextResponse.json({ error: 'Token inválido', details: error.message }, { status: 401 });
  }
}

// GET - Listar pastas
export async function GET(request: NextRequest) {
  console.log('📁 Iniciando listagem de pastas');
  
  const authResult = await checkAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get('parentId') || 'root';

    console.log('🔍 Parent ID:', parentId);

    // Verificar cache primeiro
    const cacheKey = apiCache.generateKey('folders', { parentId });
    const cachedResult = apiCache.get(cacheKey);
    
    if (cachedResult) {
      console.log('✅ Retornando dados do cache');
      return NextResponse.json(cachedResult);
    }

    const query = `mimeType = 'application/vnd.google-apps.folder' and trashed = false and '${parentId}' in parents`;
    console.log('🔍 Query final:', query);

    // Criar instância do Drive API com o cliente autenticado específico da requisição
    const driveWithAuth = google.drive({ version: 'v3', auth: authResult.client as OAuth2Client });

    const response = await driveWithAuth.files.list({
      q: query,
      fields: 'files(id,name,createdTime,modifiedTime,parents)',
      orderBy: 'name',
      key: process.env.GEMINI_API_KEY // Adicionando a chave de API diretamente aqui
    });

    const folders = response.data.files || [];
    console.log('✅ Pastas encontradas:', folders.length);

    const result = {
      success: true,
      folders
    };

    // Salvar no cache (5 minutos)
    apiCache.set(cacheKey, result, 5 * 60 * 1000);

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('❌ Erro ao listar pastas:', error.message);
    return NextResponse.json(
      { error: 'Erro ao listar pastas', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Criar pasta
export async function POST(request: NextRequest) {
  const authResult = await checkAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { name, parentId, description } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Nome da pasta é obrigatório' }, { status: 400 });
    }

    const metadata = {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentId ? [parentId] : ['root'],
      description: description || undefined
    };
    
    const driveWithAuth = google.drive({ version: 'v3', auth: authResult.client as OAuth2Client });

    const response = await driveWithAuth.files.create({
      requestBody: metadata,
      fields: 'id,name,createdTime,modifiedTime,parents',
      key: process.env.GEMINI_API_KEY // Adicionando a chave de API diretamente aqui
    });

    return NextResponse.json({
      success: true,
      folder: response.data
    });

  } catch (error: any) {
    console.error('Erro ao criar pasta:', error.message);
    return NextResponse.json(
      { error: 'Erro ao criar pasta', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Atualizar pasta
export async function PUT(request: NextRequest) {
  const authResult = await checkAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { folderId, name, description } = await request.json();

    if (!folderId) {
      return NextResponse.json({ error: 'ID da pasta é obrigatório' }, { status: 400 });
    }

    const updateData: any = {};
    
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;

    const driveWithAuth = google.drive({ version: 'v3', auth: authResult.client as OAuth2Client });
    
    const response = await driveWithAuth.files.update({
      fileId: folderId,
      requestBody: updateData,
      fields: 'id,name,createdTime,modifiedTime,parents',
      key: process.env.GEMINI_API_KEY // Adicionando a chave de API diretamente aqui
    });

    return NextResponse.json({
      success: true,
      folder: response.data
    });

  } catch (error: any) {
    console.error('Erro ao atualizar pasta:', error.message);
    return NextResponse.json(
      { error: 'Erro ao atualizar pasta', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Excluir pasta
export async function DELETE(request: NextRequest) {
  const authResult = await checkAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get('folderId');

    if (!folderId) {
      return NextResponse.json({ error: 'ID da pasta é obrigatório' }, { status: 400 });
    }

    const driveWithAuth = google.drive({ version: 'v3', auth: authResult.client as OAuth2Client });

    await driveWithAuth.files.delete({
      fileId: folderId,
      key: process.env.GEMINI_API_KEY // Adicionando a chave de API diretamente aqui
    });

    return NextResponse.json({
      success: true,
      message: 'Pasta excluída com sucesso'
    });

  } catch (error: any) {
    console.error('Erro ao excluir pasta:', error.message);
    return NextResponse.json(
      { error: 'Erro ao excluir pasta', details: error.message },
      { status: 500 }
    );
  }
}
