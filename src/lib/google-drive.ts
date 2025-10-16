import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'

// Função para criar uma nova instância do OAuth2Client com token
export function createOAuth2ClientWithToken(accessToken: string): OAuth2Client {
  const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
    // A URL de redirect não é estritamente necessária aqui se já temos o token,
    // mas é boa prática mantê-la para consistência se precisarmos de refresh tokens.
    // O ideal é que a URL seja dinâmica ou configurada corretamente no ambiente.
  )
  
  client.setCredentials({
    access_token: accessToken,
    token_type: 'Bearer'
  })
  
  return client
}

// Configuração do Google Drive API (sem auth global)
export const drive = google.drive({ version: 'v3' })

// Escopos necessários para Google Drive
export const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.metadata'
]

// Função para gerar URL de autorização
export function getAuthUrl(): string {
  const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXT_PUBLIC_URL // Usando uma variável mais genérica
  );
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  })
}

// Função para trocar código por tokens
export async function getTokens(code: string) {
  const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXT_PUBLIC_URL
  );
  const { tokens } = await oauth2Client.getToken(code)
  return tokens
}

// Tipos para documentos
export interface DriveDocument {
  id: string
  name: string
  mimeType: string
  size?: string
  createdTime: string
  modifiedTime: string
  webViewLink?: string
  webContentLink?: string
  parents?: string[]
  description?: string
  starred?: boolean
  trashed?: boolean
  status?: string;
}

export interface DriveFolder {
  id: string
  name: string
  parents?: string[]
  createdTime: string
  modifiedTime: string
}
