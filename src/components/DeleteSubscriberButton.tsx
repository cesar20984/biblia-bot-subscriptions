'use client';

import { useState } from 'react';
import { deleteSubscriber } from '@/app/actions/subscriber-actions';
import { Trash2 } from 'lucide-react';

export default function DeleteSubscriberButton({ id, phone }: { id: string, phone: string }) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!confirm(`¿Estás seguro de que quieres eliminar a ${phone}? Esta acción no se puede deshacer.`)) {
            return;
        }

        setLoading(true);
        const res = await deleteSubscriber(id);
        if (!res.success) {
            alert('Error al eliminar suscriptor');
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={loading}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all disabled:opacity-50"
            title="Eliminar suscriptor"
        >
            <Trash2 className="w-4 h-4" />
        </button>
    );
}
