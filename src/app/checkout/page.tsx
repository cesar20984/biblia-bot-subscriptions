import { getBotSettings } from '@/app/actions/settings-actions';
import { ShieldCheck, ArrowRight, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function CheckoutPage({
    searchParams,
}: {
    searchParams: Promise<{ phone?: string }>;
}) {
    const { phone } = await searchParams;
    const { stripePaymentLink, botNumber } = await getBotSettings();

    // Si no hay teléfono, redirigir al bot o mostrar error amigable
    if (!phone) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-center">
                <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
                    <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <XCircle className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Enlace Incompleto</h1>
                    <p className="text-slate-600 mb-8">Por favor, solicita el link de suscripción directamente desde el bot de WhatsApp.</p>
                    <Link
                        href={`https://wa.me/${botNumber}`}
                        className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-800 transition-all w-full justify-center"
                    >
                        <MessageCircle className="w-5 h-5" />
                        Ir al WhatsApp
                    </Link>
                </div>
            </div>
        );
    }

    const stripeUrl = `${stripePaymentLink}?client_reference_id=${phone}`;

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4 sm:p-6">
            {/* Background Decorative Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-400 rounded-full blur-3xl"></div>
            </div>

            <div className="relative max-w-lg w-full bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white p-8 sm:p-12">
                {/* Header/Icon */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2">
                    <div className="w-20 h-20 bg-blue-600 rounded-2xl shadow-xl shadow-blue-200 flex items-center justify-center border-4 border-white rotate-3">
                        <ShieldCheck className="w-10 h-10 text-white -rotate-3" />
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4 leading-tight">
                        Este es el número que <span className="text-blue-600">se va a activar</span>
                    </h1>

                    <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 mb-8 mt-6">
                        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Número a activar</p>
                        <p className="text-4xl font-black text-slate-900 font-mono tracking-tighter">
                            +{phone}
                        </p>
                    </div>

                    <div className="space-y-4 text-left border-l-4 border-blue-200 pl-6 py-2 mb-10">
                        <p className="text-slate-600 leading-relaxed">
                            <strong className="text-slate-900">⚠️ Importante:</strong> El Asistente Bíblico se activará <span className="underline decoration-blue-300 decoration-2 underline-offset-4 font-medium italic">exclusivamente</span> para este número de WhatsApp.
                        </p>
                        <p className="text-slate-500 text-sm italic">
                            Si este no es tu número actual, por favor cierra esta ventana y escribe de nuevo desde el número correcto.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <a
                            href={stripeUrl}
                            className="flex items-center justify-center gap-3 w-full bg-blue-600 text-white px-8 py-5 rounded-2xl font-bold text-lg hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-100 group"
                        >
                            Continuar al Pago
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </a>

                        <Link
                            href={`https://wa.me/${botNumber}`}
                            className="flex items-center justify-center gap-2 w-full text-slate-500 font-medium py-3 hover:text-slate-800 transition-colors"
                        >
                            <MessageCircle className="w-4 h-4" />
                            Cancelar y volver
                        </Link>
                    </div>
                </div>

                {/* Footer labels */}
                <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-center gap-6 opacity-40 grayscale">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-5" />
                    <div className="w-px h-4 bg-slate-300"></div>
                    <span className="text-[10px] font-bold tracking-widest uppercase">Secure Payment</span>
                </div>
            </div>

            <p className="mt-8 text-slate-400 text-xs font-medium uppercase tracking-widest">Biblia Bendita Assistant © 2026</p>
        </div>
    );
}

function XCircle({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" /></svg>
    )
}
