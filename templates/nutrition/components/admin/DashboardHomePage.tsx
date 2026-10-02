import React, { useState, useMemo } from 'react';
import type { Order, Product, ContactMessage } from '../../types';
import { 
    ArrowUpRightIcon, 
    ArrowDownRightIcon, 
    UsersIcon, 
    ShoppingBagIcon, 
    InboxIcon, 
    ClockIcon, 
    CheckCircleIcon, 
    CreditCardIcon, 
    ChartPieIcon, 
    TagIcon,
    InformationCircleIcon,
    SparklesIcon,
    EyeIcon
} from '../IconComponents';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, Legend, LineChart, Line,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    Treemap, ComposedChart
} from 'recharts';

interface DashboardHomePageProps {
    orders: Order[];
    products: Product[];
    messages: ContactMessage[];
}

const BI_COLORS = {
    revenue: '#ccff00',    // Neon
    orders: '#008b5e',     // Emerald
    customers: '#f59e0b',  // Orange
    success: '#10b981',    // Green
    danger: '#ef4444',     // Red
    neutral: '#94a3b8',    // Gray
    palette: ['#ccff00', '#008b5e', '#3b82f6', '#f59e0b', '#8b5cf6', '#0ea5e9', '#ec4899', '#14b8a6']
};

const SmartInsight: React.FC<{ text: string; isActive: boolean }> = ({ text, isActive }) => {
    if (!isActive) return null;
    return (
        <div className="group relative ml-2 inline-flex">
            <button className="text-lime-400 hover:text-lime-300 transition-colors animate-pulse">
                <InformationCircleIcon className="w-5 h-5" />
            </button>
            <div className="absolute bottom-full mb-3 right-0 w-72 max-w-[calc(100vw-2rem)] p-5 bg-zinc-950 text-white text-[11px] leading-relaxed rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[100] text-left border border-zinc-800 ring-4 ring-lime-400/10">
                <div className="flex items-center gap-2 mb-2 text-lime-400 font-black uppercase tracking-wider text-[9px]">
                    <SparklesIcon className="w-3 h-3" />
                    Conseil Stratégique Fitness Shop
                </div>
                {text}
                <div className="absolute bottom-[-6px] right-2 w-3 h-3 bg-zinc-950 transform rotate-45 border-r border-b border-zinc-800"></div>
            </div>
        </div>
    );
};

const KPICard: React.FC<{
    title: string; value: string; subValue?: string; icon: React.ReactNode; 
    trend?: 'up' | 'down' | 'neutral'; trendValue?: string; color: string; 
    insight?: string; isAnalysisMode?: boolean;
}> = ({ title, value, subValue, icon, trend, trendValue, color, insight, isAnalysisMode }) => (
    <div className={`bg-zinc-900/90 p-6 rounded-2xl shadow-sm border transition-all duration-500 flex flex-col justify-between h-full ${isAnalysisMode ? 'ring-2 ring-lime-400/30 border-lime-400/40 scale-[1.02]' : 'border-zinc-800'}`}>
        <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-zinc-800/80 border border-zinc-700/50" style={{ color }}>
                {React.cloneElement(icon as React.ReactElement<any>, { className: `w-6 h-6` })}
            </div>
            <div className="flex items-center">
                {trend && (
                    <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full ${trend === 'up' ? 'bg-lime-950 text-lime-400 border border-lime-800/50' : trend === 'down' ? 'bg-red-950 text-red-400 border border-red-800/50' : 'bg-zinc-800 text-zinc-400'}`}>
                        {trend === 'up' ? <ArrowUpRightIcon className="w-3 h-3"/> : <ArrowDownRightIcon className="w-3 h-3"/>}
                        {trendValue}
                    </div>
                )}
                <SmartInsight text={insight || ""} isActive={!!isAnalysisMode} />
            </div>
        </div>
        <div>
            <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">{title}</h3>
            <p className="text-3xl font-black text-white mt-1 tracking-tight font-oswald">{value}</p>
            {subValue && <p className="text-[10px] text-zinc-400 mt-2 font-bold uppercase tracking-widest">{subValue}</p>}
        </div>
    </div>
);

const ChartCard: React.FC<{ 
    title: string; children: React.ReactNode; height?: number; 
    insight?: string; isAnalysisMode?: boolean; 
}> = ({ title, children, height = 300, insight, isAnalysisMode }) => (
    <div className={`bg-zinc-900/90 p-8 rounded-3xl shadow-sm border transition-all duration-500 flex flex-col ${isAnalysisMode ? 'ring-2 ring-lime-400/30 border-lime-400/40 shadow-xl' : 'border-zinc-800'}`}>
        <div className="flex justify-between items-start mb-8 border-l-4 border-lime-400 pl-4">
            <h3 className="font-black text-white text-xs uppercase tracking-[0.2em]">{title}</h3>
            <SmartInsight text={insight || ""} isActive={!!isAnalysisMode} />
        </div>
        <div style={{ height: height, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
                {children as React.ReactElement}
            </ResponsiveContainer>
        </div>
    </div>
);

export const DashboardHomePage: React.FC<DashboardHomePageProps> = ({ orders, products, messages }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [isAnalysisMode, setIsAnalysisMode] = useState(false);

    const data = useMemo(() => {
        const last30Days = [];
        for (let i = 29; i >= 0; i--) {
            const d = new Date(); d.setDate(d.getDate() - i);
            const key = d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
            last30Days.push({ date: key, revenue: 0, ordersCount: 0, aov: 0 });
        }
        orders.forEach(o => {
            if (o.status !== 'Annulée') {
                const key = new Date(o.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
                const entry = last30Days.find(e => e.date === key);
                if (entry) { entry.revenue += o.total; entry.ordersCount += 1; }
            }
        });
        last30Days.forEach(e => e.aov = e.ordersCount > 0 ? e.revenue / e.ordersCount : 0);

        const categoryMap: Record<string, {count: number, value: number, sales: number}> = {};
        const productPerformance: Record<number, number> = {};
        orders.filter(o => o.status !== 'Annulée').forEach(o => {
            o.items.forEach(item => { productPerformance[item.productId] = (productPerformance[item.productId] || 0) + item.quantity; });
        });

        products.forEach(p => {
            if (!categoryMap[p.category]) categoryMap[p.category] = {count: 0, value: 0, sales: 0};
            categoryMap[p.category].count++;
            categoryMap[p.category].value += p.price * p.quantity;
            categoryMap[p.category].sales += (productPerformance[p.id] || 0);
        });

        return {
            timeline: last30Days,
            categories: Object.entries(categoryMap).map(([name, s]) => ({ name, value: s.count, valuation: s.value, sales: s.sales })),
            topProducts: products.map(p => ({ name: p.name, sold: productPerformance[p.id] || 0 })).sort((a,b) => b.sold - a.sold).slice(0, 10),
            totals: {
                revenue: orders.filter(o => o.status !== 'Annulée').reduce((s, o) => s + o.total, 0),
                delivered: orders.filter(o => o.status === 'Livrée').reduce((s, o) => s + o.total, 0),
                pending: orders.filter(o => o.status === 'En attente' || o.status === 'Expédiée').reduce((s, o) => s + o.total, 0),
                cancelled: orders.filter(o => o.status === 'Annulée').reduce((s, o) => s + o.total, 0),
                aov: orders.length > 0 ? orders.reduce((s,o) => s+o.total, 0) / orders.length : 0
            }
        };
    }, [orders, products]);

    return (
        <div className="space-y-8 pb-20 font-sans">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-800 pb-8">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-wider font-oswald">
                        Centre de <span className="text-lime-400">Commandement</span>
                    </h1>
                    <p className="text-zinc-400 font-medium text-xs mt-1">Surveillance opérationnelle et analytique Fitness Shop</p>
                </div>
                
                <div className="flex gap-4 items-center">
                    <button 
                        onClick={() => setIsAnalysisMode(!isAnalysisMode)}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 border ${
                            isAnalysisMode 
                                ? 'bg-lime-400 text-black border-lime-400 shadow-lg shadow-lime-400/20' 
                                : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:text-white'
                        }`}
                    >
                        {isAnalysisMode ? '✨ Mode Analyse Actif' : 'Mode Expert'}
                    </button>
                    <div className="bg-zinc-800/80 text-zinc-300 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-zinc-700">
                        <ClockIcon className="w-4 h-4 text-lime-400 animate-pulse"/> Temps Réel
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard title="Chiffre d'Affaires" value={`${data.totals.revenue.toFixed(0)} DT`} subValue="Total des ventes" icon={<CreditCardIcon/>} trend="up" trendValue="+14%" color={BI_COLORS.revenue} isAnalysisMode={isAnalysisMode} insight="Chiffre d'affaires brut réalisé sur les commandes actives." />
                <KPICard title="Commandes" value={orders.length.toString()} subValue="Volume total" icon={<ShoppingBagIcon/>} trend="up" trendValue="+8%" color={BI_COLORS.orders} isAnalysisMode={isAnalysisMode} insight="Nombre total d'ordres d'expédition enregistrés." />
                <KPICard title="Panier Moyen" value={`${data.totals.aov.toFixed(0)} DT`} subValue="Dépense / Athlète" icon={<ChartPieIcon/>} trend="neutral" trendValue="Stable" color={BI_COLORS.customers} isAnalysisMode={isAnalysisMode} insight="Montant moyen commandé par athlète." />
                <KPICard title="Messages Coach" value={messages.length.toString()} subValue="Demandes support" icon={<InboxIcon/>} trend="down" trendValue="-3" color={BI_COLORS.neutral} isAnalysisMode={isAnalysisMode} insight="Demandes et messages adressés au quartier général." />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <ChartCard title="Progression Journalière (Ventes)" isAnalysisMode={isAnalysisMode} insight="Courbe d'évolution du chiffre d'affaires quotidien.">
                        <ComposedChart data={data.timeline}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 10}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 10}} />
                            <Tooltip contentStyle={{backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff'}} />
                            <Bar dataKey="revenue" fill={BI_COLORS.revenue} radius={[4, 4, 0, 0]} barSize={20} name="Ventes (DT)" />
                        </ComposedChart>
                    </ChartCard>
                </div>
                <ChartCard title="Répartition par Gamme" isAnalysisMode={isAnalysisMode} insight="Proportion de l'inventaire par catégorie d'entraînement.">
                    <PieChart>
                        <Pie data={data.categories} innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                            {data.categories.map((_, index) => (
                                <Cell key={index} fill={BI_COLORS.palette[index % BI_COLORS.palette.length]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff'}} />
                        <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{fontSize: '10px'}} />
                    </PieChart>
                </ChartCard>
            </div>
        </div>
    );
};

export default DashboardHomePage;
