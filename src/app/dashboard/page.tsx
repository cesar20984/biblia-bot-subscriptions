import { prisma } from '@/lib/prisma';
import ResetCountButton from '@/components/ResetCountButton';
import {
    Users,
    UserCheck,
    UserX,
    AlertCircle,
    Search,
    MessageSquare,
    RotateCcw
} from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getStats() {
    const total = await prisma.subscriber.count();
    const active = await prisma.subscriber.count({ where: { status: 'active' } });
    const canceled = await prisma.subscriber.count({ where: { status: 'canceled' } });
    const pastDue = await prisma.subscriber.count({ where: { status: 'past_due' } });

    return { total, active, canceled, pastDue };
}

async function getSubscribers() {
    return await prisma.subscriber.findMany({
        orderBy: { createdAt: 'desc' },
    });
}

async function getMessageLogs() {
    const today = new Date().toISOString().split('T')[0];
    return await prisma.messageLog.findMany({
        where: { date: today },
        orderBy: { updatedAt: 'desc' },
    });
}

export default async function DashboardPage() {
    const stats = await getStats();
    const subscribers = await getSubscribers();
    const todayLogs = await getMessageLogs();

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        Dashboard de Suscriptores
                        <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full uppercase tracking-wider">Beta</span>
                    </h1>
                    <p className="text-slate-500">Gestión de suscripciones premium para tu bot de la Biblia</p>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total Usuarios"
                        value={stats.total}
                        icon={<Users className="text-blue-600" />}
                        bg="bg-blue-50"
                    />
                    <StatCard
                        title="Suscripciones Activas"
                        value={stats.active}
                        icon={<UserCheck className="text-green-600" />}
                        bg="bg-green-50"
                    />
                    <StatCard
                        title="Canceladas"
                        value={stats.canceled}
                        icon={<UserX className="text-rose-600" />}
                        bg="bg-rose-50"
                    />
                    <StatCard
                        title="Dudas Hoy (Free)"
                        value={todayLogs.length}
                        icon={<MessageSquare className="text-amber-600" />}
                        bg="bg-amber-50"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Lista de Usuarios (Main Table) */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-slate-800">Lista de Usuarios</h2>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Buscar por teléfono..."
                                    className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-500 text-sm uppercase">
                                        <th className="px-6 py-4 font-medium">Teléfono</th>
                                        <th className="px-6 py-4 font-medium">Estado</th>
                                        <th className="px-6 py-4 font-medium">Próximo Cobro</th>
                                        <th className="px-6 py-4 font-medium text-right">Creado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {subscribers.map((sub: any) => (
                                        <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-900">{sub.phone}</td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={sub.status} />
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                {sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 text-sm text-right">
                                                {new Date(sub.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                    {subscribers.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                                                No hay suscriptores aún.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Conteo de Mensajes (Right sidebar) */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-fit">
                        <div className="p-6 border-b border-slate-100">
                            <h2 className="text-xl font-semibold text-slate-800">Mensajes de Hoy</h2>
                            <p className="text-sm text-slate-500">Usuarios en modo gratuito</p>
                        </div>
                        <div className="p-4">
                            <div className="space-y-4">
                                {todayLogs.map((log: any) => (
                                    <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900">{log.phone}</p>
                                            <p className="text-xs text-slate-500">{log.count} / 2 mensajes</p>
                                        </div>
                                        <ResetCountButton phone={log.phone} date={log.date} />
                                    </div>
                                ))}
                                {todayLogs.length === 0 && (
                                    <div className="text-center py-8">
                                        <p className="text-sm text-slate-400">Nadie ha escrito hoy todavía.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, bg }: { title: string; value: number; icon: React.ReactNode; bg: string }) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className={`p-3 rounded-lg ${bg}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm text-slate-500">{title}</p>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        active: 'bg-green-100 text-green-700',
        canceled: 'bg-rose-100 text-rose-700',
        past_due: 'bg-amber-100 text-amber-700',
        inactive: 'bg-slate-100 text-slate-600',
    };

    const labels: Record<string, string> = {
        active: 'Activo',
        canceled: 'Cancelado',
        past_due: 'Moroso',
        inactive: 'Inactivo',
    };

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.inactive}`}>
            {labels[status] || status}
        </span>
    );
}
