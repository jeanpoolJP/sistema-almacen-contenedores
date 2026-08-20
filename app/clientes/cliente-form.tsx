"use client";

import { useState } from "react";
import { crearCliente } from "@/app/actions/clientes";

export function ClienteForm() {
  const [dni, setDni] = useState("");
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [telefono, setTelefono] = useState("");
  const [observaciones, setObservaciones] = useState("");

  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setCargando(true);
    setMensaje("");

    const resultado = await crearCliente({
      dni,
      nombreCompleto,
      telefono,
      observaciones,
    });

    setCargando(false);

    if (!resultado.success) {
      setMensaje(resultado.error || "Error al crear cliente");
      return;
    }

    setMensaje("Cliente creado correctamente.");

    // Limpiar formulario
    setDni("");
    setNombreCompleto("");
    setTelefono("");
    setObservaciones("");
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      <div>
        <label htmlFor="dni" className="block text-sm font-medium">
          DNI
        </label>

        <input
          id="dni"
          type="text"
          value={dni}
          onChange={(event) => setDni(event.target.value)}
          maxLength={8}
          className="mt-1 w-full rounded-md border px-3 py-2"
          placeholder="12345678"
        />
      </div>

      <div>
        <label htmlFor="nombreCompleto" className="block text-sm font-medium">
          Nombre completo
        </label>

        <input
          id="nombreCompleto"
          type="text"
          value={nombreCompleto}
          onChange={(event) => setNombreCompleto(event.target.value)}
          maxLength={150}
          className="mt-1 w-full rounded-md border px-3 py-2"
          placeholder="Juan Pérez"
        />
      </div>

      <div>
        <label htmlFor="telefono" className="block text-sm font-medium">
          Teléfono
        </label>

        <input
          id="telefono"
          type="text"
          value={telefono}
          onChange={(event) => setTelefono(event.target.value)}
          maxLength={20}
          className="mt-1 w-full rounded-md border px-3 py-2"
          placeholder="999999999"
        />
      </div>

      <div>
        <label htmlFor="observaciones" className="block text-sm font-medium">
          Observaciones
        </label>

        <textarea
          id="observaciones"
          value={observaciones}
          onChange={(event) => setObservaciones(event.target.value)}
          className="mt-1 w-full rounded-md border px-3 py-2"
          placeholder="Observaciones del cliente..."
          rows={4}
        />
      </div>

      <button
        type="submit"
        disabled={cargando}
        className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {cargando ? "Guardando..." : "Crear cliente"}
      </button>

      {mensaje && (
        <p className="text-sm">
          {mensaje}
        </p>
      )}
    </form>
  );
}