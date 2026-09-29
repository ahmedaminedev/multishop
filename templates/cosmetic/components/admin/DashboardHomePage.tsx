
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
    ExclamationCircleIcon, 
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
    Scatter, ScatterChart, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    Treemap
} from 'recharts';

interface DashboardHomePageProps {
    orders: Order[];
    products: Product[];
    messages: ContactMessage[];
}

// --- PALETTE DE COULEURS PROFESSIONNELLE ---
const COLORS = {
    primary: ['#e11d48', '#f43f5e', '#fb7185', '#fda4af'], // Rose
    secondary: ['#0f172a', '#334155', '#64748b', '#94a3b8'], // Slate
    success: ['#059669', '#10b981', '#34d399', '#6ee7b7'], // Emerald
    warning: ['#d97706', '#f59e0b', '#fbbf24', '#fcd34d'], // Amber
    info: ['#0284c7', '#0ea5e9', '#38bdf8', '#7dd3fc'], // Sky
    purple: ['#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd'], // Violet
};

const PIE_COLORS = [...COLORS.primary, ...COLORS.info, ...COLORS.warning, ...COLORS.success, ...COLORS.purple];

// --- COMPOSANT D'AIDE INTELLIGENTE (Smart Insight) ---
const SmartInsight: React.FC<{ text: string; isActive: boolean }> = ({ text, isActive }) => {
    if (!isActive) return null;
    return (
        <div className="group relative ml-2 inline-flex">
            <button className="text-rose-500 hover:text-rose-600 transition-colors animate-pulse">
                <InformationCircleIcon className="w-5 h-5" />
            </button>
            {/* Tooltip Business */}
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 p-4 bg-gray-900 text-white text-xs leading-relaxed rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-left border border-gray-700">
                <div className="flex items-center gap-2 mb-2 text-rose-300 font-bold uppercase tracking-wider text-[10px]">
                    <SparklesIcon className="w-3 h-3" />
                    Conseil Stratégique
                </div>
                {text}
                <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-900 transform rotate-45 border-r border-b border-gray-700"></div>
            </div>
        </div>
    );
};

// --- COMPOSANTS UI ---

const KPICard: React.FC<{
    title: string;
    value: string;
    subValue?: string;
    icon: React.ReactNode;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    colorClass: string;
    insight?: string;
    isAnalysisMode?: boolean;
}> = ({ title, value, subValue, icon, trend, trendValue, colorClass, insight, isAnalysisMode }) => (
    <div className={`bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border transition-all duration-300 flex flex-col justify-between h-full hover:shadow-md ${isAnalysisMode ? 'border-rose-200 dark:border-rose-900 ring-1 ring-rose-100 dark:ring-rose-900/30' : 'border-gray-100 dark:border-gray-700'}`}>
        <div className="flex justify-between items-start mb-3">
            <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10 text-opacity-100`}>
                {React.cloneElement(icon as React.ReactElement<any>, { className: `w-5 h-5 ${colorClass.replace('bg-', 'text-')}` })}
            </div>
            <div className="flex items-center">
                {trend && (
                    <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${trend === 'up' ? 'bg-green-100 text-green-700' : trend === 'down' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                        {trend === 'up' ? <ArrowUpRightIcon className="w-3 h-3"/> : <ArrowDownRightIcon className="w-3 h-3"/>}
                        {trendValue}
                    </div>
                )}
                <SmartInsight text={insight || ""} isActive={!!isAnalysisMode} />
            </div>
        </div>
        <div>
            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</h3>
            <p className="text-2xl font-serif font-bold text-gray-900 dark:text-white mt-1">{value}</p>
            {subValue && <p className="text-[10px] text-gray-400 mt-1 font-medium">{subValue}</p>}
        </div>
    </div>
);

const ChartCard: React.FC<{ 
    title: string; 
    children: React.ReactNode; 
    height?: number;
    insight?: string;
    isAnalysisMode?: boolean;
}> = ({ title, children, height = 300, insight, isAnalysisMode }) => (
    <div className={`bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border transition-all duration-300 flex flex-col ${isAnalysisMode ? 'border-rose-200 dark:border-rose-900 ring-1 ring-rose-100 dark:ring-rose-900/30' : 'border-gray-100 dark:border-gray-700'}`}>
        <div className="flex justify-between items-start mb-6 border-l-4 border-rose-500 pl-3">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">{title}</h3>
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

    // --- MOTEUR D'ANALYSE DE DONNÉES (DATA CRUNCHING) ---

    // 1. GLOBAL & FINANCIALS
    const financials = useMemo(() => {
        const validOrders = orders.filter(o => o.status !== 'Annulée');
        const totalRevenue = validOrders.reduce((sum, o) => sum + o.total, 0);
        const netRevenue = validOrders.filter(o => o.status === 'Livrée').reduce((sum, o) => sum + o.total, 0);
        const pendingRevenue = validOrders.filter(o => o.status === 'En attente' || o.status === 'Expédiée').reduce((sum, o) => sum + o.total, 0);
        const cancelledAmount = orders.filter(o => o.status === 'Annulée').reduce((sum, o) => sum + o.total, 0);
        const avgOrderValue = validOrders.length > 0 ? totalRevenue / validOrders.length : 0;
        
        // Estimation TVA (19%)
        const taxAmount = totalRevenue * 0.19;
        
        return { totalRevenue, netRevenue, pendingRevenue, cancelledAmount, avgOrderValue, taxAmount };
    }, [orders]);

    // 2. TIME SERIES (REVENUE & ORDERS)
    const timeSeriesData = useMemo(() => {
        const data: any = {};
        
        // Initialiser
        const last30Days = [];
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
            last30Days.push({ date: key, revenue: 0, orders: 0, aov: 0 });
        }

        orders.forEach(o => {
            if (o.status !== 'Annulée') {
                const d = new Date(o.date);
                const key = d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
                const dayEntry = last30Days.find(e => e.date === key);
                if (dayEntry) {
                    dayEntry.revenue += o.total;
                    dayEntry.orders += 1;
                }
            }
        });

        // Calcul AOV par jour
        last30Days.forEach(d => {
            d.aov = d.orders > 0 ? Math.round(d.revenue / d.orders) : 0;
        });

        // Heures de pointe (Heatmap simulée via BarChart)
        const hourlyTraffic = Array(24).fill(0).map((_, i) => ({ hour: `${i}h`, orders: 0 }));
        orders.forEach(o => {
            const h = new Date(o.date).getHours();
            hourlyTraffic[h].orders += 1;
        });

        // Jours de la semaine
        const weeklyDistribution = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => ({ day, orders: 0 }));
        orders.forEach(o => {
            const d = new Date(o.date).getDay();
            weeklyDistribution[d].orders += 1;
        });

        return { daily: last30Days, hourly: hourlyTraffic, weekly: weeklyDistribution };
    }, [orders]);

    // 3. PRODUCTS INTELLIGENCE
    const productStats = useMemo(() => {
        const catCount: Record<string, number> = {};
        const catValue: Record<string, number> = {};
        const brandCount: Record<string, number> = {};
        const stockStatus = { inStock: 0, lowStock: 0, outOfStock: 0 };
        
        // Calcul des ventes par produit (Simulé via orders.items)
        const productSales: Record<number, number> = {}; // ID -> Qty sold
        
        orders.forEach(o => {
            if(o.status !== 'Annulée') {
                o.items.forEach(item => {
                    productSales[item.productId] = (productSales[item.productId] || 0) + item.quantity;
                });
            }
        });

        products.forEach(p => {
            // Categories
            catCount[p.category] = (catCount[p.category] || 0) + 1;
            catValue[p.category] = (catValue[p.category] || 0) + (p.price * p.quantity);
            
            // Brands
            brandCount[p.brand] = (brandCount[p.brand] || 0) + 1;

            // Stock
            if (p.quantity === 0) stockStatus.outOfStock++;
            else if (p.quantity < 5) stockStatus.lowStock++;
            else stockStatus.inStock++;
        });

        // Top Selling Products
        const topProducts = products
            .map(p => ({ ...p, sold: productSales[p.id] || 0 }))
            .sort((a, b) => b.sold - a.sold)
            .slice(0, 10);

        // Slow Moving Products (Stock > 10 mais ventes < 2)
        const sleepingStock = products
            .map(p => ({ ...p, sold: productSales[p.id] || 0 }))
            .filter(p => p.quantity > 10 && p.sold < 2)
            .slice(0, 10);

        return {
            categories: Object.entries(catCount).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value),
            categoryValuation: Object.entries(catValue).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value),
            brands: Object.entries(brandCount).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value).slice(0, 10), // Top 10 marques
            stock: [
                { name: 'En Stock', value: stockStatus.inStock, color: '#10b981' },
                { name: 'Stock Faible', value: stockStatus.lowStock, color: '#f59e0b' },
                { name: 'Rupture', value: stockStatus.outOfStock, color: '#ef4444' }
            ],
            topProducts,
            sleepingStock
        };
    }, [products, orders]);

    // 4. ORDERS & LOGISTICS
    const logisticsStats = useMemo(() => {
        const statusData = [
            { name: 'En attente', value: 0, fill: '#f59e0b' },
            { name: 'Expédiée', value: 0, fill: '#3b82f6' },
            { name: 'Livrée', value: 0, fill: '#10b981' },
            { name: 'Annulée', value: 0, fill: '#ef4444' }
        ];
        
        const paymentMethods: Record<string, number> = {};
        const cityDistribution: Record<string, number> = {};

        orders.forEach(o => {
            const statusIndex = statusData.findIndex(s => s.name === o.status);
            if (statusIndex > -1) statusData[statusIndex].value++;

            paymentMethods[o.paymentMethod] = (paymentMethods[o.paymentMethod] || 0) + 1;
            
            const city = o.shippingAddress.city || 'Inconnu';
            cityDistribution[city] = (cityDistribution[city] || 0) + 1;
        });

        return {
            statusDistribution: statusData,
            paymentMethods: Object.entries(paymentMethods).map(([name, value]) => ({ name, value })),
            geoDistribution: Object.entries(cityDistribution).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value).slice(0, 7)
        };
    }, [orders]);

    // 5. CLIENTS (Calculs dérivés)
    const customerStats = useMemo(() => {
        // Group orders by customer name (approximation since no User ID in Order types properly linked sometimes)
        const customerMap: Record<string, { count: number, total: number }> = {};
        orders.forEach(o => {
            if (!customerMap[o.customerName]) customerMap[o.customerName] = { count: 0, total: 0 };
            customerMap[o.customerName].count++;
            customerMap[o.customerName].total += o.total;
        });

        const customers = Object.values(customerMap);
        const returning = customers.filter(c => c.count > 1).length;
        const newCust = customers.filter(c => c.count === 1).length;

        const topSpenders = Object.entries(customerMap)
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 7);

        return {
            retention: [
                { name: 'Nouveaux', value: newCust, fill: '#3b82f6' },
                { name: 'Récurrents', value: returning, fill: '#8b5cf6' }
            ],
            topSpenders
        };
    }, [orders]);


    // --- TABS CONTENT RENDERERS ---

    const renderOverviewTab = () => (
        <div className="space-y-6 animate-fadeIn">
            {/* KPI ROW */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard 
                    title="Chiffre d'Affaires" 
                    value={`${financials.totalRevenue.toFixed(0)} DT`} 
                    subValue="+12% vs M-1" 
                    icon={<CreditCardIcon/>} 
                    trend="up" 
                    trendValue="12%" 
                    colorClass="bg-rose-500 text-rose-500"
                    isAnalysisMode={isAnalysisMode}
                    insight="C'est le montant total des ventes validées. S'il baisse, vérifiez vos campagnes marketing ou vos prix."
                />
                <KPICard 
                    title="Commandes" 
                    value={orders.length.toString()} 
                    subValue={`${logisticsStats.statusDistribution.find(s => s.name === 'En attente')?.value} à traiter`} 
                    icon={<ShoppingBagIcon/>} 
                    trend="up" 
                    trendValue="5%" 
                    colorClass="bg-blue-500 text-blue-500"
                    isAnalysisMode={isAnalysisMode}
                    insight="Volume total de commandes. Un pic soudain peut nécessiter plus de personnel logistique."
                />
                <KPICard 
                    title="Panier Moyen" 
                    value={`${financials.avgOrderValue.toFixed(0)} DT`} 
                    subValue="Stable" 
                    icon={<ChartPieIcon/>} 
                    trend="neutral" 
                    trendValue="0%" 
                    colorClass="bg-emerald-500 text-emerald-500" 
                    isAnalysisMode={isAnalysisMode}
                    insight="La dépense moyenne par client. Pour l'augmenter, proposez des packs ou des produits complémentaires."
                />
                <KPICard 
                    title="Messages" 
                    value={messages.length.toString()} 
                    subValue={`${messages.filter(m => !m.read).length} non lus`} 
                    icon={<InboxIcon/>} 
                    trend="down" 
                    trendValue="2" 
                    colorClass="bg-orange-500 text-orange-500"
                    isAnalysisMode={isAnalysisMode}
                    insight="Questions des clients. Répondre vite augmente le taux de conversion et la fidélité."
                />
            </div>

            {/* ROW 2: Main Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <ChartCard 
                        title="Évolution du Chiffre d'Affaires (30 jours)" 
                        isAnalysisMode={isAnalysisMode}
                        insight="Ce graphique montre la tendance de vos ventes. Cherchez des pics (succès d'une promo) ou des creux (problème technique ou fin de mois)."
                    >
                        <AreaChart data={timeSeriesData.daily}>
                            <defs>
                                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#e11d48" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#e11d48" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis dataKey="date" hide />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10}} />
                            <Tooltip contentStyle={{borderRadius: '8px', border:'none', boxShadow:'0 4px 12px rgba(0,0,0,0.1)'}} />
                            <Area type="monotone" dataKey="revenue" stroke="#e11d48" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                        </AreaChart>
                    </ChartCard>
                </div>
                <div>
                    <ChartCard 
                        title="Entonnoir de Commandes"
                        isAnalysisMode={isAnalysisMode}
                        insight="Visualisez le cycle de vie. Trop d'annulations ? Vérifiez les prix ou la livraison. Trop d'attente ? Accélérez l'expédition."
                    >
                        <BarChart data={logisticsStats.statusDistribution} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={80} tick={{fill: '#6b7280', fontSize: 11, fontWeight: 600}} axisLine={false} tickLine={false} />
                            <Tooltip cursor={{fill: 'transparent'}} />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                                {logisticsStats.statusDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ChartCard>
                </div>
            </div>

            {/* ROW 3: Secondary Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ChartCard 
                    title="Top Catégories (Vol)"
                    isAnalysisMode={isAnalysisMode}
                    insight="Vos best-sellers. Concentrez vos efforts marketing sur ces catégories pour maximiser le ROI."
                >
                    <PieChart>
                        <Pie data={productStats.categories.slice(0,5)} innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                            {productStats.categories.slice(0,5).map((_, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ChartCard>
                <div className="lg:col-span-2">
                    <ChartCard 
                        title="Trafic Horaire (Commandes)"
                        isAnalysisMode={isAnalysisMode}
                        insight="Découvrez quand vos clients achètent. Idéal pour planifier l'envoi de newsletters ou de posts réseaux sociaux."
                    >
                        <BarChart data={timeSeriesData.hourly}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis dataKey="hour" tick={{fontSize: 10}} interval={3} />
                            <Tooltip />
                            <Bar dataKey="orders" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ChartCard>
                </div>
                <ChartCard 
                    title="État du Stock"
                    isAnalysisMode={isAnalysisMode}
                    insight="Surveillez le rouge ! Les ruptures de stock sont des ventes perdues. Réapprovisionnez vite."
                >
                    <PieChart>
                        <Pie data={productStats.stock} innerRadius={0} outerRadius={60} dataKey="value">
                            {productStats.stock.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Pie>
                        <Legend verticalAlign="bottom" height={36} iconSize={8} wrapperStyle={{fontSize: '10px'}}/>
                        <Tooltip />
                    </PieChart>
                </ChartCard>
            </div>
        </div>
    );

    const renderFinancialsTab = () => (
        <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KPICard title="Recettes Nettes" value={`${financials.netRevenue.toFixed(0)} DT`} subValue="Encaissé" icon={<CheckCircleIcon/>} colorClass="bg-green-500 text-green-500" isAnalysisMode={isAnalysisMode} insight="Argent réellement reçu (commandes livrées). C'est votre trésorerie réelle." />
                <KPICard title="En attente de paiement" value={`${financials.pendingRevenue.toFixed(0)} DT`} subValue="Cashflow futur" icon={<ClockIcon/>} colorClass="bg-yellow-500 text-yellow-500" isAnalysisMode={isAnalysisMode} insight="Argent à venir. Assurez-vous de livrer ces commandes pour encaisser." />
                <KPICard title="Manque à gagner" value={`${financials.cancelledAmount.toFixed(0)} DT`} subValue="Annulations" icon={<ArrowDownRightIcon/>} colorClass="bg-red-500 text-red-500" isAnalysisMode={isAnalysisMode} insight="Argent perdu. Analysez pourquoi ces commandes ont été annulées." />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="Revenus vs Taxes (TVA 19%)" isAnalysisMode={isAnalysisMode} insight="Part qui va à l'État vs part qui reste dans l'entreprise.">
                    <BarChart data={[{ name: 'Total', revenue: financials.totalRevenue, tax: financials.taxAmount }]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="revenue" name="Chiffre d'Affaires" fill="#0ea5e9" />
                        <Bar dataKey="tax" name="TVA Collectée" fill="#94a3b8" />
                    </BarChart>
                </ChartCard>
                <ChartCard title="Méthodes de Paiement" isAnalysisMode={isAnalysisMode} insight="La préférence de vos clients. Si le paiement à la livraison domine, le risque d'annulation est plus élevé.">
                    <PieChart>
                        <Pie data={logisticsStats.paymentMethods} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label>
                            {logisticsStats.paymentMethods.map((_, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ChartCard>
            </div>

            <ChartCard title="Panier Moyen par Jour (Tendance AOV)" isAnalysisMode={isAnalysisMode} insight="L'évolution de la valeur moyenne des commandes. Une hausse signifie que vos clients achètent plus ou plus cher.">
                <LineChart data={timeSeriesData.daily}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" hide />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="aov" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
            </ChartCard>
        </div>
    );

    const renderProductsTab = () => (
        <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="Top 10 Produits (Unités Vendues)" height={400} isAnalysisMode={isAnalysisMode} insight="Vos locomotives. Assurez-vous qu'ils ne soient jamais en rupture de stock.">
                    <BarChart data={productStats.topProducts} layout="vertical" margin={{ left: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 10}} />
                        <Tooltip />
                        <Bar dataKey="sold" fill="#e11d48" radius={[0, 4, 4, 0]} />
                    </BarChart>
                </ChartCard>
                <div className="space-y-6">
                    <ChartCard title="Valorisation du Stock par Catégorie" isAnalysisMode={isAnalysisMode} insight="L'argent immobilisé dans votre stock. Trop de stock dans une catégorie qui vend peu est un risque.">
                        <Treemap
                            data={productStats.categoryValuation}
                            dataKey="value"
                            aspectRatio={4 / 3}
                            stroke="#fff"
                            fill="#0f172a"
                        >
                            <Tooltip />
                        </Treemap>
                    </ChartCard>
                    <ChartCard title="Répartition des Marques" isAnalysisMode={isAnalysisMode} insight="Quelle marque pèse le plus dans votre catalogue ? Diversifiez si une marque domine trop.">
                        <PieChart>
                            <Pie data={productStats.brands} innerRadius={40} outerRadius={80} dataKey="value">
                                {productStats.brands.map((_, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ChartCard>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className={`bg-white dark:bg-gray-800 p-5 rounded-2xl border transition-all duration-300 ${isAnalysisMode ? 'border-rose-200 ring-1 ring-rose-100' : 'border-gray-100 dark:border-gray-700'}`}>
                    <div className="flex justify-between items-start mb-4 border-l-4 border-orange-500 pl-3">
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm">Stock Dormant (Haute dispo, Faible vente)</h3>
                        <SmartInsight text="Ces produits coûtent de l'argent (stockage) et ne rapportent rien. Envisagez une promotion de déstockage." isActive={!!isAnalysisMode} />
                    </div>
                    <div className="overflow-auto max-h-60">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500">
                                <tr>
                                    <th className="p-2">Produit</th>
                                    <th className="p-2 text-right">Stock</th>
                                    <th className="p-2 text-right">Ventes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productStats.sleepingStock.map(p => (
                                    <tr key={p.id} className="border-b dark:border-gray-700">
                                        <td className="p-2 truncate max-w-[150px]">{p.name}</td>
                                        <td className="p-2 text-right font-bold text-orange-500">{p.quantity}</td>
                                        <td className="p-2 text-right">{p.sold}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <ChartCard title="Prix vs Quantité (Dispersion)" isAnalysisMode={isAnalysisMode} insight="Positionnement de vos produits. Idéalement, vous voulez un équilibre, pas seulement des produits chers en faible quantité.">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid />
                        <XAxis type="number" dataKey="price" name="Prix" unit="DT" />
                        <YAxis type="number" dataKey="quantity" name="Stock" unit="u" />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                        <Scatter name="Produits" data={products} fill="#8884d8" />
                    </ScatterChart>
                </ChartCard>
            </div>
        </div>
    );

    const renderOrdersTab = () => (
        <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="Commandes par Jour de la Semaine" isAnalysisMode={isAnalysisMode} insight="Identifiez vos jours forts. Lancez vos promotions la veille de ces jours pour maximiser l'impact.">
                    <BarChart data={timeSeriesData.weekly}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ChartCard>
                <ChartCard title="Volume de Commandes (30j)" isAnalysisMode={isAnalysisMode} insight="La constance est la clé. Des graphiques en dents de scie indiquent une dépendance trop forte aux promotions.">
                    <AreaChart data={timeSeriesData.daily}>
                        <defs>
                            <linearGradient id="colorOrd" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" hide />
                        <YAxis />
                        <Tooltip />
                        <Area type="step" dataKey="orders" stroke="#8b5cf6" fill="url(#colorOrd)" />
                    </AreaChart>
                </ChartCard>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ChartCard title="Répartition Géographique (Top Villes)" isAnalysisMode={isAnalysisMode} insight="Où sont vos clients ? Ciblez vos publicités Facebook/Instagram sur ces villes spécifiques.">
                    <PieChart>
                        <Pie data={logisticsStats.geoDistribution} innerRadius={40} outerRadius={80} dataKey="value" label>
                            {logisticsStats.geoDistribution.map((_, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                        </Pie>
                        <Legend />
                        <Tooltip />
                    </PieChart>
                </ChartCard>
                <div className="md:col-span-2">
                    <ChartCard title="Analyse Radar : Performance Logistique (Simulé)" isAnalysisMode={isAnalysisMode} insight="Votre note de qualité. Une surface large signifie une excellente gestion globale. Une pointe vers l'intérieur indique une faiblesse.">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                            { subject: 'Vitesse Expédition', A: 120, fullMark: 150 },
                            { subject: 'Taux Livraison', A: 98, fullMark: 150 },
                            { subject: 'Satisfaction', A: 86, fullMark: 150 },
                            { subject: 'Faible Retour', A: 99, fullMark: 150 },
                            { subject: 'Coût Logistique', A: 85, fullMark: 150 },
                            { subject: 'Qualité Emballage', A: 65, fullMark: 150 },
                        ]}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="subject" />
                            <PolarRadiusAxis />
                            <Radar name="Performance" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                        </RadarChart>
                    </ChartCard>
                </div>
            </div>
        </div>
    );

    const renderCustomersTab = () => (
        <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KPICard title="Clients Totaux" value={customerStats.topSpenders.length.toString() + "+"} icon={<UsersIcon/>} trend="up" trendValue="Global" colorClass="bg-indigo-500 text-indigo-500" isAnalysisMode={isAnalysisMode} insight="Votre base de données. Plus elle est grande, plus vos emails marketing seront efficaces." />
                <KPICard title="Taux de Rétention" value={`${((customerStats.retention[1].value / (customerStats.retention[0].value + customerStats.retention[1].value || 1)) * 100).toFixed(1)}%`} icon={<CheckCircleIcon/>} trend="neutral" trendValue="Fidélité" colorClass="bg-pink-500 text-pink-500" isAnalysisMode={isAnalysisMode} insight="Le pourcentage de clients qui reviennent. Un taux élevé est signe de produits de qualité et d'un bon service." />
                <KPICard title="Panier Moyen Client" value={`${financials.avgOrderValue.toFixed(0)} DT`} icon={<CreditCardIcon/>} trend="up" trendValue="AOV" colorClass="bg-teal-500 text-teal-500" isAnalysisMode={isAnalysisMode} insight="Combien dépense un client en moyenne." />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="Nouveaux vs Récurrents" isAnalysisMode={isAnalysisMode} insight="Équilibre vital : Il faut des nouveaux pour croître, mais des récurrents pour la rentabilité (ils coûtent moins cher à acquérir).">
                    <PieChart>
                        <Pie data={customerStats.retention} innerRadius={60} outerRadius={90} dataKey="value" label>
                            {customerStats.retention.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom"/>
                    </PieChart>
                </ChartCard>
                <ChartCard title="Top 7 Meilleurs Clients (Chiffre d'Affaires)" isAnalysisMode={isAnalysisMode} insight="Vos VIP. Chouchoutez-les avec des codes promos exclusifs ou des cadeaux. Ils sont vos ambassadeurs.">
                    <BarChart data={customerStats.topSpenders} layout="vertical" margin={{ left: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 10}} />
                        <Tooltip />
                        <Bar dataKey="total" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                </ChartCard>
            </div>
        </div>
    );

    // --- MAIN RENDER ---

    const TABS = [
        { id: 'overview', label: 'Vue d\'Ensemble', icon: <ChartPieIcon className="w-4 h-4"/> },
        { id: 'financials', label: 'Finance', icon: <CreditCardIcon className="w-4 h-4"/> },
        { id: 'orders', label: 'Commandes & Logistique', icon: <ShoppingBagIcon className="w-4 h-4"/> },
        { id: 'products', label: 'Produits & Stocks', icon: <TagIcon className="w-4 h-4"/> },
        { id: 'customers', label: 'Clients', icon: <UsersIcon className="w-4 h-4"/> },
    ];

    return (
        <div className="space-y-8 animate-fadeIn pb-10">
            {/* Header Global */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <span className="bg-rose-600 text-white p-2 rounded-lg"><ArrowUpRightIcon className="w-6 h-6"/></span>
                        Analytics Center
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Pilotez votre activité avec plus de 30 indicateurs clés en temps réel.</p>
                </div>
                <div className="flex gap-3 items-center">
                    {/* TOGGLE MODE ANALYSE */}
                    <div className="flex items-center gap-3 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                        <span className={`text-sm font-bold ${isAnalysisMode ? 'text-rose-600' : 'text-gray-500'}`}>
                            Mode Analyse
                        </span>
                        <button 
                            onClick={() => setIsAnalysisMode(!isAnalysisMode)}
                            className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out ${isAnalysisMode ? 'bg-rose-600' : 'bg-gray-300'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isAnalysisMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </button>
                    </div>

                    <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
                        <ClockIcon className="w-4 h-4"/> Live Data
                    </div>
                </div>
            </div>

            {/* Notification Mode Analyse */}
            {isAnalysisMode && (
                <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900 text-rose-800 dark:text-rose-200 px-4 py-3 rounded-xl flex items-start gap-3 animate-fadeIn">
                    <div className="p-1 bg-rose-200 dark:bg-rose-800 rounded-full text-rose-600 dark:text-white"><EyeIcon className="w-4 h-4"/></div>
                    <div>
                        <p className="font-bold text-sm">Mode Analyse Activé</p>
                        <p className="text-xs mt-1">Survolez les icônes <InformationCircleIcon className="w-3 h-3 inline align-middle"/> pour obtenir des conseils stratégiques sur chaque graphique.</p>
                    </div>
                </div>
            )}

            {/* Navigation Onglets */}
            <div className="flex overflow-x-auto no-scrollbar gap-2 bg-white dark:bg-gray-800 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                            flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap flex-1 justify-center
                            ${activeTab === tab.id 
                                ? 'bg-rose-600 text-white shadow-md' 
                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }
                        `}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Contenu Dynamique */}
            <div className="min-h-[500px]">
                {activeTab === 'overview' && renderOverviewTab()}
                {activeTab === 'financials' && renderFinancialsTab()}
                {activeTab === 'products' && renderProductsTab()}
                {activeTab === 'orders' && renderOrdersTab()}
                {activeTab === 'customers' && renderCustomersTab()}
            </div>
        </div>
    );
};
