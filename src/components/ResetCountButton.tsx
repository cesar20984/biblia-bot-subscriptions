'use client';

import { resetMessageCount } from '@/app/actions/message-actions';
import { RotateCcw } from 'lucide-react';
import { useState } from 'react';

export default function ResetCountButton({ phone, date }: { phone: string; date: string }) {
    const [loading, setLoading] = useState(false);

    const handleReset = async () => {
        if (!confirm(`¿Reiniciar conteo para ${phone}?`)) return;

        setLoading(true);
        await resetMessageCount(phone, date);
        setLoading(false);
    };

    return (
        <button
            onClick={handleReset}
            disabled={loading}
            className="flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
        >
            <RotateCcw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Reiniciando...' : 'Reiniciar'}
        </button>
    );
}
