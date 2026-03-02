'use client';

import { useState } from 'react';
import { updateBotNumber } from '@/app/actions/settings-actions';
import { Save, Smartphone } from 'lucide-react';

export default function BotNumberEditor({ initialNumber }: { initialNumber: string }) {
    const [number, setNumber] = useState(initialNumber);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSave = async () => {
        setLoading(true);
        setMessage('');
        const res = await updateBotNumber(number);
        if (res.success) {
            setMessage('¡Número guardado!');
            setTimeout(() => setMessage(''), 3000);
        } else {
            setMessage('Error al guardar');
        }
        setLoading(false);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-blue-600" />
                Configuración del Bot
            </h2>
            <p className="text-sm text-slate-500 mb-4">
                Este número se usará en la página de éxito para que los usuarios vuelvan a WhatsApp.
            </p>

            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                        Número de WhatsApp (con código de país)
                    </label>
                    <input
                        type="text"
                        value={number}
                        onChange={(e) => setNumber(e.target.value)}
                        placeholder="Ej: 56912345678"
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                </div>

                <div className="flex items-center justify-between">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center gap-2 text-sm"
                    >
                        <Save className="w-4 h-4" />
                        {loading ? 'Guardando...' : 'Guardar Número'}
                    </button>
                    {message && (
                        <span className={`text-sm font-medium ${message.includes('Error') ? 'text-rose-600' : 'text-green-600'}`}>
                            {message}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
