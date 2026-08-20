// app\clientes\page.tsx

import { ClienteForm } from "@/app/clientes/cliente-form"

export default function ClientesPage() {
  return (
    <main className="p-8">
      <h1 className="mb-6 text-2xl font-bold">Clientes</h1>

      <ClienteForm />
    </main>
  )
}
