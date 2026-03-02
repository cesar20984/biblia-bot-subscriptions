'use client';

import { useState } from 'react';
import { toggleVipStatus, updateSubscriberPhone, updateSubscriberExpiration, toggleBlockStatus } from '@/app/actions/subscriber-actions';
import { Edit2, Star, Check, X, Loader2, Calendar, ExternalLink, Ban, ShieldAlert } from 'lucide-react';

interface SubscriberActionsProps {
    subscriber: {
        id: string;
        phone: string;
        status: string;
        stripeSubscriptionId: string | null;
        stripeCustomerId: string | null;
        currentPeriodEnd: Date | null;
        isBlocked?: boolean;
    };
}

export default function SubscriberActions({ subscriber }: SubscriberActionsProps) {
    const [isEditingPhone, setIsEditingPhone] = useState(false);
    const [isEditingDate, setIsEditingDate] = useState(false);
    const [newPhone, setNewPhone] = useState(subscriber.phone);
    const [newDate, setNewDate] = useState(
        subscriber.currentPeriodEnd
            ? new Date(subscriber.currentPeriodEnd).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0]
    );
    const [loading, setLoading] = useState(false);

    const isManualVip = subscriber.status === 'active' && !subscriber.stripeSubscriptionId;
    const isStripeUser = !!subscriber.stripeCustomerId;

    const handleToggleVip = async () => {
        setLoading(true);
        const res = await toggleVipStatus(subscriber.id, isManualVip);
        if (!res.success) {
            alert('Error al cambiar estado VIP');
        }
        setLoading(false);
    };

    const handleUpdatePhone = async () => {
        if (newPhone === subscriber.phone) {
            setIsEditingPhone(false);
            return;
        }
        setLoading(true);
        const res = await updateSubscriberPhone(subscriber.id, newPhone);
        if (res.success) {
            setIsEditingPhone(false);
        } else {
            alert(res.error || 'Error al actualizar teléfono');
        }
        setLoading(false);
    };

    const handleUpdateDate = async () => {
        setLoading(true);
        const res = await updateSubscriberExpiration(subscriber.id, newDate);
        if (res.success) {
            setIsEditingDate(false);
        } else {
            alert('Error al actualizar fecha');
        }
        setLoading(false);
    };

    const handleToggleBlock = async () => {
        if (!confirm(`¿Estás seguro de que quieres ${subscriber.isBlocked ? 'desbloquear' : 'bloquear'} a este usuario?`)) return;
        setLoading(true);
        const res = await toggleBlockStatus(subscriber.id, !!subscriber.isBlocked);
        if (!res.success) {
            alert('Error al cambiar estado de bloqueo');
        }
        setLoading(false);
    };

    return (
        <div className="flex items-center gap-2">
            {/* Editar Teléfono */}
            {isEditingPhone ? (
                <div className="flex items-center gap-1 bg-white p-1 rounded shadow-sm border border-blue-200 z-10">
                    <input
                        type="text"
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        className="w-32 px-2 py-1 text-xs border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        autoFocus
                    />
                    <button onClick={handleUpdatePhone} disabled={loading} className="p-1 text-green-600 hover:bg-green-50 rounded">
                        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                    </button>
                    <button onClick={() => { setIsEditingPhone(false); setNewPhone(subscriber.phone); }} className="p-1 text-slate-400 hover:bg-slate-100 rounded">
                        <X className="w-3 h-3" />
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => setIsEditingPhone(true)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    title="Editar teléfono"
                >
                    <Edit2 className="w-3.5 h-3.5" />
                </button>
            )}

            {/* Editar Fecha (Solo para VIP Manual) */}
            {isManualVip && (
                isEditingDate ? (
                    <div className="flex items-center gap-1 bg-white p-1 rounded shadow-sm border border-amber-200 z-10">
                        <input
                            type="date"
                            value={newDate}
                            onChange={(e) => setNewDate(e.target.value)}
                            className="px-2 py-1 text-xs border border-amber-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                        <button onClick={handleUpdateDate} disabled={loading} className="p-1 text-green-600 hover:bg-green-50 rounded">
                            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                        </button>
                        <button onClick={() => setIsEditingDate(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded">
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsEditingDate(true)}
                        className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                        title="Cambiar fecha de vencimiento"
                    >
                        <Calendar className="w-3.5 h-3.5" />
                    </button>
                )
            )}

            {/* Link a Stripe (Si tiene Customer ID) */}
            {isStripeUser && (
                <a
                    href={`https://dashboard.stripe.com/customers/${subscriber.stripeCustomerId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                    title="Ver en Stripe"
                >
                    <ExternalLink className="w-3.5 h-3.5" />
                </a>
            )}

            {/* Alternar VIP */}
            <button
                onClick={handleToggleVip}
                disabled={loading}
                className={`p-1.5 rounded-lg transition-all ${isManualVip
                    ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
                    : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50'
                    }`}
                title={isManualVip ? "Quitar VIP" : "Hacer VIP"}
            >
                <Star className={`w-3.5 h-3.5 ${isManualVip ? 'fill-amber-500' : ''}`} />
            </button>

            {/* Bloquear Usuario */}
            <button
                onClick={handleToggleBlock}
                disabled={loading}
                className={`p-1.5 rounded-lg transition-all ${subscriber.isBlocked
                    ? 'text-rose-600 bg-rose-50 hover:bg-rose-100'
                    : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                    }`}
                title={subscriber.isBlocked ? "Desbloquear usuario" : "Bloquear usuario"}
            >
                {subscriber.isBlocked ? <ShieldAlert className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
            </button>
        </div>
    );
}
