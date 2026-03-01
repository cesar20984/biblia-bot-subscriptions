import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">
          Sistema de Suscripciones <br />
          <span className="text-blue-600">Biblia Bendita</span>
        </h1>
        <p className="text-slate-600 mb-8 leading-relaxed">
          Bienvenido al panel de control de tu bot de WhatsApp.
          Aquí podrás gestionar los pagos y el acceso premium de tus usuarios.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/dashboard"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
          >
            Ir al Dashboard
          </Link>
          <p className="text-sm text-slate-400">
            Asegúrate de configurar tus variables de entorno antes de empezar.
          </p>
        </div>
      </div>
    </div>
  );
}
