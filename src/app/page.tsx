export default function DashboardPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">BMV Docs</h1>
        <p className="text-gray-600">Sistema de gestão documental</p>
        <a href="/login" className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Fazer Login
        </a>
      </div>
    </div>
  )
}