import Link from 'next/link';
import { CheckCircle2, MessageCircle } from 'lucide-react';
import { getBotNumber } from '@/app/actions/settings-actions';

export default async function SuccessPage() {
    const botNumber = await getBotNumber();

    // Si no hay número configurado, usamos uno por defecto o una URL genérica de WA
    const whatsappUrl = botNumber
        ? `https://wa.me/${botNumber.replace(/[^0-9]/g, '')}`
        : 'https://wa.me/';

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-slate-100">
                <div className="mb-6 flex justify-center">
                    <div className="bg-green-100 p-3 rounded-full">
                        <CheckCircle2 className="w-12 h-12 text-green-600" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                    ¡Pago Exitoso!
                </h1>
                <p className="text-slate-600 mb-8">
                    Tu suscripción a <span className="font-semibold text-blue-600">Biblia Bendita Premium</span> ya está activa. Gracias por apoyar este proyecto.
                </p>

                <div className="bg-blue-50 rounded-xl p-4 mb-8 text-left">
                    <h3 className="text-sm font-bold text-blue-800 mb-1">¿Qué sigue ahora?</h3>
                    <p className="text-xs text-blue-700 leading-relaxed">
                        Ya puedes volver a WhatsApp y seguir haciendo tus consultas bíblicas sin límites. Tu acceso se ha activado automáticamente.
                    </p>
                </div>

                <a
                    href={whatsappUrl}
                    className="block w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-3"
                >
                    <MessageCircle className="w-5 h-5" />
                    Volver al Bot de WhatsApp
                </a>

                <div className="mt-8 text-slate-400 text-xs text-center">
                    ¿Te gusta el bot? ¡Compártelo con tus hermanos!
                </div>
            </div>
        </div>
    );
}
