export default function DashboardPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">BMV Docs</h1>
        <p className="text-xl text-gray-600">Sistema de gestão documental</p>
        <div className="space-y-4">
          <a 
            href="/login" 
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Fazer Login
          </a>
          <div className="text-sm text-gray-500">
            ou
          </div>
          <a 
            href="/signup" 
            className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Criar Conta
          </a>
        </div>
        <div className="text-sm text-gray-500 mt-8">
          <p>Teste com:</p>
          <p>Email: admin@bmv.global</p>
          <p>Senha: admin123</p>
        </div>
      </div>
    </div>
  )
}
