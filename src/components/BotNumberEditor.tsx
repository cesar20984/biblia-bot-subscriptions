'use client';

import { useState } from 'react';
import { updateBotNumber, updateStripeLink, updateStripeCancelLink, addManualVip } from '@/app/actions/settings-actions';
import { Phone, Save, Loader2, ChevronDown, ChevronUp, ShieldCheck, CreditCard, Link2 } from 'lucide-react';

interface BotNumberEditorProps {
    initialNumber: string;
    initialStripeLink: string;
    initialStripeCancelLink: string;
}

export default function BotNumberEditor({ initialNumber, initialStripeLink, initialStripeCancelLink }: BotNumberEditorProps) {
    const [botNumber, setBotNumber] = useState(initialNumber);
    const [stripeLink, setStripeLink] = useState(initialStripeLink);
    const [stripeCancelLink, setStripeCancelLink] = useState(initialStripeCancelLink);
    const [vipPhone, setVipPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleSaveBotNumber = async () => {
        setLoading(true);
        const res = await updateBotNumber(botNumber);
        if (res.success) {
            alert('Número del bot actualizado');
        } else {
            alert('Error al actualizar número');
        }
        setLoading(false);
    };

    const handleSaveStripeLink = async () => {
        setLoading(true);
        const res = await updateStripeLink(stripeLink);
        if (res.success) {
            alert('Link de Stripe actualizado');
        } else {
            alert('Error al actualizar link');
        }
        setLoading(false);
    };

    const handleSaveStripeCancelLink = async () => {
        setLoading(true);
        const res = await updateStripeCancelLink(stripeCancelLink);
        if (res.success) {
            alert('Link de cancelación actualizado');
        } else {
            alert('Error al actualizar link de cancelación');
        }
        setLoading(false);
    };

    const handleAddVip = async () => {
        if (!vipPhone) return;
        setLoading(true);
        const res = await addManualVip(vipPhone);
        if (res.success) {
            alert('VIP añadido correctamente');
            setVipPhone('');
        } else {
            alert('Error al añadir VIP');
        }
        setLoading(false);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
                <div className="flex items-center gap-2 text-slate-700">
                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold">Ajustes del Sistema</span>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {isOpen && (
                <div className="px-6 py-6 border-t border-slate-100 bg-slate-50/50 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Bot Number */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                Número del Bot (WhatsApp)
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={botNumber}
                                    onChange={(e) => setBotNumber(e.target.value)}
                                    placeholder="Ej: 56912345678"
                                    className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                />
                                <button
                                    onClick={handleSaveBotNumber}
                                    disabled={loading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                </button>
                            </div>
                            <p className="text-[10px] text-slate-400">Este número se usa para el botón "Volver a WhatsApp" en la página de éxito.</p>
                        </div>

                        {/* Stripe Link */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                                <CreditCard className="w-3 h-3" />
                                Link de Pago Stripe (Checkout)
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={stripeLink}
                                    onChange={(e) => setStripeLink(e.target.value)}
                                    placeholder="https://buy.stripe.com/..."
                                    className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                />
                                <button
                                    onClick={handleSaveStripeLink}
                                    disabled={loading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                </button>
                            </div>
                            <p className="text-[10px] text-slate-400">El link oficial que generas en Stripe para tus suscripciones.</p>
                        </div>

                        {/* Stripe Cancel Link */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                                <Link2 className="w-3 h-3" />
                                Link de Cancelación (Portal Stripe)
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={stripeCancelLink}
                                    onChange={(e) => setStripeCancelLink(e.target.value)}
                                    placeholder="https://billing.stripe.com/p/login/..."
                                    className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                />
                                <button
                                    onClick={handleSaveStripeCancelLink}
                                    disabled={loading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                </button>
                            </div>
                            <p className="text-[10px] text-slate-400">El enlace directo al Portal de Clientes de Stripe.</p>
                        </div>
                    </div>

                    {/* Manual VIP */}
                    <div className="pt-4 border-t border-slate-200">
                        <div className="space-y-2 max-w-md">
                            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" />
                                Añadir VIP Manual (Tus números)
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={vipPhone}
                                    onChange={(e) => setVipPhone(e.target.value)}
                                    placeholder="Número sin el +"
                                    className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                                />
                                <button
                                    onClick={handleAddVip}
                                    disabled={loading}
                                    className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors disabled:opacity-50 text-sm font-medium"
                                >
                                    Añadir
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
