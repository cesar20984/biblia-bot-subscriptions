'use client';

import { useState } from 'react';
import { updateBotNumber, addManualVip } from '@/app/actions/settings-actions';
import { Save, Smartphone, Settings, ChevronDown, PlusCircle } from 'lucide-react';

export default function BotNumberEditor({ initialNumber }: { initialNumber: string }) {
    const [number, setNumber] = useState(initialNumber);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const [manualPhone, setManualPhone] = useState('');
    const [manualLoading, setManualLoading] = useState(false);
    const [manualMessage, setManualMessage] = useState('');

    const handleSave = async () => {
        setLoading(true);
        setMessage('');
        const res = await updateBotNumber(number);
        if (res.success) {
            setMessage('¡Guardado!');
            setTimeout(() => setMessage(''), 3000);
        } else {
            setMessage('Error');
        }
        setLoading(false);
    };

    const handleAddManual = async () => {
        if (!manualPhone) return;
        setManualLoading(true);
        setManualMessage('');
        const res = await addManualVip(manualPhone);
        if (res.success) {
            setManualMessage('¡VIP Añadido!');
            setManualPhone('');
            setTimeout(() => setManualMessage(''), 3000);
        } else {
            setManualMessage('Error');
        }
        setManualLoading(false);
    };

    return (
        <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                    <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                        <Settings className="w-4 h-4 text-slate-400" />
                        Ajustes del Sistema
                    </h2>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>

                {isOpen && (
                    <div className="mt-4 pt-4 border-t border-slate-50 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Configuración del Número */}
                        <div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-1">
                                <Smartphone className="w-3.5 h-3.5" />
                                Número del Bot
                            </h3>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={number}
                                    onChange={(e) => setNumber(e.target.value)}
                                    placeholder="Ej: 56912345678"
                                    className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                                <button
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="bg-slate-800 text-white px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-900 transition-all disabled:opacity-50"
                                >
                                    {loading ? '...' : 'Guardar'}
                                </button>
                            </div>
                            {message && <p className="text-[10px] mt-1 text-green-600 font-medium">{message}</p>}
                        </div>

                        {/* Agregar VIP Manual */}
                        <div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-1">
                                <PlusCircle className="w-3.5 h-3.5" />
                                Añadir VIP Manual
                            </h3>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={manualPhone}
                                    onChange={(e) => setManualPhone(e.target.value)}
                                    placeholder="Teléfono (sin +)"
                                    className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                                <button
                                    onClick={handleAddManual}
                                    disabled={manualLoading}
                                    className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-700 transition-all disabled:opacity-50"
                                >
                                    {manualLoading ? '...' : 'Añadir'}
                                </button>
                            </div>
                            {manualMessage && <p className="text-[10px] mt-1 text-blue-600 font-medium">{manualMessage}</p>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
