import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'

// Configuração do OAuth2
export const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.NEXTAUTH_URL
)

// Função para criar uma nova instância do OAuth2Client com token
export function createOAuth2ClientWithToken(accessToken: string) {
  const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXTAUTH_URL
  )
  
  client.setCredentials({
    access_token: accessToken,
    token_type: 'Bearer'
  })
  
  return client
}

// Configuração do Google Drive API
export const drive = google.drive({ version: 'v3', auth: oauth2Client as any })

// Escopos necessários para Google Drive
export const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.metadata'
]

// Função para gerar URL de autorização
export function getAuthUrl(): string {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  })
}

// Função para trocar código por tokens
export async function getTokens(code: string) {
  const { tokens } = await oauth2Client.getToken(code)
  oauth2Client.setCredentials(tokens)
  return tokens
}

// Função para configurar credenciais
export function setCredentials(tokens: any) {
  oauth2Client.setCredentials(tokens)
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
