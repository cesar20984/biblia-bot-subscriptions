import { prisma } from '@/lib/prisma';
import ResetCountButton from '@/components/ResetCountButton';
import BotNumberEditor from '@/components/BotNumberEditor';
import DeleteSubscriberButton from '@/components/DeleteSubscriberButton';
import SubscriberActions from '@/components/SubscriberActions';
import { getBotSettings } from '@/app/actions/settings-actions';
import {
    Users,
    UserCheck,
    UserX,
    Search,
    MessageSquare,
    Star,
    Edit2,
    ShieldCheck,
    Filter,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import DashboardFilters from '@/components/DashboardFilters';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

async function getStats() {
    const total = await prisma.subscriber.count();
    const active = await prisma.subscriber.count({ where: { status: 'active' } });
    const canceled = await prisma.subscriber.count({ where: { status: 'canceled' } });

    const today = new Date().toISOString().split('T')[0];
    const messagesTodayResult = await prisma.messageLog.aggregate({
        where: { date: today },
        _sum: { count: true }
    });
    const messagesToday = messagesTodayResult._sum.count || 0;

    return { total, active, canceled, messagesToday };
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

export default async function DashboardPage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string; status?: string; sort?: string }>;
}) {
    const params = await searchParams;
    const search = params.search || '';
    const statusFilter = params.status || 'all';
    const sort = params.sort || '';

    const stats = await getStats();
    let subscribers = await getSubscribers();
    const todayLogs = await getMessageLogs();
    const { botNumber, stripePaymentLink, stripeCancelLink } = await getBotSettings();

    // Mapear logs para búsqueda rápida
    const logsMap = new Map(todayLogs.map(log => [log.phone, log.count]));

    // Obtener todos los números de teléfono únicos (Suscriptores + Gente que escribió hoy)
    const allPhones = Array.from(new Set([
        ...subscribers.map(s => s.phone),
        ...todayLogs.map(l => l.phone)
    ]));

    // Crear lista unificada
    let fullList = allPhones.map(phone => {
        const sub = subscribers.find(s => s.phone === phone);
        return {
            id: sub?.id || `temp-${phone}`,
            phone,
            status: sub?.status || 'inactive',
            stripeSubscriptionId: sub?.stripeSubscriptionId,
            stripeCustomerId: sub?.stripeCustomerId,
            currentPeriodEnd: sub?.currentPeriodEnd,
            createdAt: sub?.createdAt || new Date(),
            messagesToday: logsMap.get(phone) || 0,
            isNew: !sub
        };
    });

    // Filtrar por búsqueda y estado
    if (search) {
        fullList = fullList.filter(item => item.phone.includes(search));
    }
    if (statusFilter !== 'all') {
        fullList = fullList.filter(item => item.status === statusFilter);
    }

    // Ordenar
    if (sort === 'messages:desc') {
        fullList.sort((a, b) => b.messagesToday - a.messagesToday);
    } else if (sort === 'messages:asc') {
        fullList.sort((a, b) => a.messagesToday - b.messagesToday);
    } else {
        // Ordenar por defecto: VIP Manual -> Premium Stripe -> El resto por fecha
        fullList.sort((a, b) => {
            const aIsManual = a.status === 'active' && !a.stripeSubscriptionId;
            const bIsManual = b.status === 'active' && !b.stripeSubscriptionId;
            const aIsPremium = a.status === 'active' && !!a.stripeSubscriptionId;
            const bIsPremium = b.status === 'active' && !!b.stripeSubscriptionId;

            if (aIsManual && !bIsManual) return -1;
            if (!aIsManual && bIsManual) return 1;
            if (aIsPremium && !bIsPremium) return -1;
            if (!aIsPremium && bIsPremium) return 1;

            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    }

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
                        title="Mensajes Hoy"
                        value={stats.messagesToday}
                        icon={<MessageSquare className="text-amber-600" />}
                        bg="bg-amber-50"
                    />
                </div>

                <div className="mb-8">
                    <BotNumberEditor
                        initialNumber={botNumber}
                        initialStripeLink={stripePaymentLink}
                        initialStripeCancelLink={stripeCancelLink}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Lista de Usuarios (Main Table) */}
                    <div className="lg:col-span-2 space-y-4">
                        <Suspense fallback={<div className="h-10 bg-slate-100 animate-pulse rounded-lg" />}>
                            <DashboardFilters />
                        </Suspense>

                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <h2 className="text-xl font-semibold text-slate-800">Lista de Usuarios</h2>
                                <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">{fullList.length} registros</span>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50 text-slate-500 text-sm uppercase">
                                            <th className="px-6 py-4 font-medium">Teléfono</th>
                                            <th className="px-6 py-4 font-medium">Estado</th>
                                            <th className="px-6 py-4 font-medium">Mensajes Hoy</th>
                                            <th className="px-6 py-4 font-medium text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {fullList.map((sub: any) => {
                                            const isManualVip = sub.status === 'active' && !sub.stripeSubscriptionId;
                                            const isStripePremium = sub.status === 'active' && sub.stripeSubscriptionId;

                                            return (
                                                <tr key={sub.id} className={`hover:bg-slate-50 transition-colors ${isManualVip ? 'bg-amber-50/30' : ''} ${isStripePremium ? 'bg-blue-50/30' : ''}`}>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <span className="font-medium text-slate-900">{sub.phone}</span>
                                                            {isManualVip && (
                                                                <span className="flex items-center gap-1 bg-amber-100 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-200 uppercase" title="Añadido manualmente">
                                                                    <Star className="w-2.5 h-2.5 fill-amber-500" />
                                                                    VIP
                                                                </span>
                                                            )}
                                                            {isStripePremium && (
                                                                <span className="flex items-center gap-1 bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-blue-200 uppercase" title="Suscripción vía Stripe">
                                                                    <UserCheck className="w-2.5 h-2.5" />
                                                                    Premium
                                                                </span>
                                                            )}
                                                            {sub.isNew && (
                                                                <span className="flex items-center gap-1 bg-slate-100 text-slate-500 text-[10px] font-bold px-1.5 py-0.5 rounded border border-slate-200 uppercase" title="Usuario nuevo (aún no suscrito)">
                                                                    Nuevo
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <StatusBadge status={sub.status} />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-sm font-bold ${sub.messagesToday > 0 ? 'text-blue-600' : 'text-slate-400'}`}>
                                                                {sub.messagesToday}
                                                            </span>
                                                            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">mensajes</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <SubscriberActions subscriber={sub} />
                                                            <div className="w-px h-4 bg-slate-100 mx-1" />
                                                            <DeleteSubscriberButton id={sub.id} phone={sub.phone} />
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {fullList.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                                                    No se encontraron usuarios.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Conteo de Mensajes (Right sidebar) */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-fit">
                        <div className="p-6 border-b border-slate-100">
                            <div className="flex items-center gap-2 mb-1">
                                <MessageSquare className="w-5 h-5 text-slate-400" />
                                <h2 className="text-xl font-semibold text-slate-800">Actividad Hoy</h2>
                            </div>
                            <p className="text-sm text-slate-500">Usuarios con mensajes enviados</p>
                        </div>
                        <div className="p-4">
                            <div className="space-y-4">
                                {todayLogs.map(log => (
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
