'use client';

import { useState } from 'react';
import { toggleVipStatus, updateSubscriberPhone } from '@/app/actions/subscriber-actions';
import { Edit2, Star, Check, X, Loader2 } from 'lucide-react';

interface SubscriberActionsProps {
    subscriber: {
        id: string;
        phone: string;
        status: string;
        stripeSubscriptionId: string | null;
    };
}

export default function SubscriberActions({ subscriber }: SubscriberActionsProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [newPhone, setNewPhone] = useState(subscriber.phone);
    const [loading, setLoading] = useState(false);

    const isManualVip = subscriber.status === 'active' && !subscriber.stripeSubscriptionId;

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
            setIsEditing(false);
            return;
        }
        setLoading(true);
        const res = await updateSubscriberPhone(subscriber.id, newPhone);
        if (res.success) {
            setIsEditing(false);
        } else {
            alert(res.error || 'Error al actualizar teléfono');
        }
        setLoading(false);
    };

    return (
        <div className="flex items-center gap-2">
            {/* Editar Teléfono */}
            {isEditing ? (
                <div className="flex items-center gap-1">
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
                    <button onClick={() => { setIsEditing(false); setNewPhone(subscriber.phone); }} className="p-1 text-slate-400 hover:bg-slate-100 rounded">
                        <X className="w-3 h-3" />
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => setIsEditing(true)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    title="Editar teléfono"
                >
                    <Edit2 className="w-3.5 h-3.5" />
                </button>
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
        </div>
    );
}
