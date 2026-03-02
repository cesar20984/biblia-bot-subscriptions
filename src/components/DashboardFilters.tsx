'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Search, ChevronDown, ChevronUp, Filter, MessageSquare, X } from 'lucide-react';

export default function DashboardFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentSearch = searchParams.get('search') || '';
    const currentStatus = searchParams.get('status') || 'all';
    const currentSort = searchParams.get('sort') || '';

    const updateFilters = (updates: Record<string, string>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value === 'all' || value === '') {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        });
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Buscador */}
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                    type="text"
                    placeholder="Buscar por teléfono..."
                    defaultValue={currentSearch}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            updateFilters({ search: (e.target as HTMLInputElement).value });
                        }
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
            </div>

            {/* Filtro de Estado */}
            <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Filter className="w-4 h-4" />
                </div>
                <select
                    value={currentStatus}
                    onChange={(e) => updateFilters({ status: e.target.value })}
                    className="pl-10 pr-8 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white appearance-none cursor-pointer min-w-[140px]"
                >
                    <option value="all">Todos los estados</option>
                    <option value="active">Activos</option>
                    <option value="canceled">Cancelados</option>
                    <option value="past_due">Morosos</option>
                    <option value="inactive">Nuevos / Inactivos</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            {/* Ordenar por Mensajes */}
            <div className="flex items-center gap-1">
                <button
                    onClick={() => {
                        const nextSort = currentSort === 'messages:desc' ? 'messages:asc' : 'messages:desc';
                        updateFilters({ sort: nextSort });
                    }}
                    className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm transition-all shadow-sm ${currentSort.startsWith('messages')
                            ? 'bg-blue-50 border-blue-200 text-blue-600 font-semibold'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                >
                    {currentSort === 'messages:desc' ? <ChevronDown className="w-4 h-4" /> : currentSort === 'messages:asc' ? <ChevronUp className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                    {currentSort.startsWith('messages')
                        ? (currentSort === 'messages:desc' ? 'Más mensajes hoy' : 'Menos mensajes hoy')
                        : 'Ordenar por mensajes'}
                </button>
                {currentSort !== '' && (
                    <button
                        onClick={() => updateFilters({ sort: '' })}
                        className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                        title="Quitar orden"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
}
