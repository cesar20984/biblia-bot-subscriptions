import { getBotSettings } from '@/app/actions/settings-actions';
import { CheckCircle2, MessageCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function SuccessPage() {
    const { botNumber } = await getBotSettings();
    const cleanBotNumber = botNumber.replace('+', '');

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
            <div className="max-w-md w-full bg-white p-12 rounded-2xl shadow-xl border border-slate-100">
                <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce-slow">
                    <CheckCircle2 className="w-12 h-12" />
                </div>

                <h1 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">¡Activación Exitosa! 🎉</h1>
                <p className="text-slate-600 mb-10 leading-relaxed">
                    Tu suscripción ha sido procesada correctamente. El asistente bíblico ya está listo para responder tus dudas.
                </p>

                <div className="space-y-4">
                    <a
                        href={`https://wa.me/${cleanBotNumber}`}
                        className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-800 active:scale-95 transition-all w-full justify-center shadow-lg shadow-slate-200"
                    >
                        <MessageCircle className="w-6 h-6" />
                        Volver a WhatsApp
                    </a>

                    <p className="text-xs text-slate-400 font-medium uppercase tracking-widest pt-4">
                        Gracias por confiar en nosotros
                    </p>
                </div>
            </div>

            <Link
                href="/dashboard"
                className="mt-8 text-slate-400 hover:text-slate-600 text-sm flex items-center gap-2 transition-colors"
            >
                Acceder al Dashboard
                <ArrowRight className="w-4 h-4" />
            </Link>
        </div>
    );
}
