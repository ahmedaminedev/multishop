
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
    EyeIcon,
    AdjustmentsHorizontalIcon,
    MapPinIcon
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

// --- PALETTE DE COULEURS PROFESSIONNELLE STYLE BI ---
const BI_COLORS = {
    revenue: '#118DFF',    // Bleu (Finances)
    orders: '#742774',     // Violet (Opérations)
    customers: '#E66C37',  // Orange (Marketing)
    success: '#059669',    // Vert (Croissance)
    danger: '#E81123',     // Rouge (Alertes)
    neutral: '#64748b',    // Gris (Stats secondaires)
    palette: ['#118DFF', '#742774', '#E66C37', '#059669', '#8b5cf6', '#0ea5e9', '#f43f5e', '#d946ef']
};

// --- COMPOSANT D'EXPLICATION CLAIRE (CORRIGÉ POUR ÉVITER LE SCROLL) ---
const SmartInsight: React.FC<{ text: string; isActive: boolean }> = ({ text, isActive }) => {
    if (!isActive) return null;
    return (
        <div className="group relative ml-2 inline-flex">
            <button className="text-blue-500 hover:text-blue-600 transition-colors animate-pulse">
                <InformationCircleIcon className="w-5 h-5" />
            </button>
            {/* Positionnement corrigé : right-0 au lieu de left-1/2 pour ne pas déborder à droite */}
            <div className="absolute bottom-full mb-3 right-0 w-72 max-w-[calc(100vw-2rem)] p-5 bg-slate-900 text-white text-[11px] leading-relaxed rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[100] text-left border border-slate-700 ring-4 ring-blue-500/10">
                <div className="flex items-center gap-2 mb-2 text-blue-400 font-black uppercase tracking-wider text-[9px]">
                    <SparklesIcon className="w-3 h-3" />
                    Conseil Stratégique
                </div>
                {text}
                {/* Flèche alignée à droite de l'infobulle (sous l'icône) */}
                <div className="absolute bottom-[-6px] right-2 w-3 h-3 bg-slate-900 transform rotate-45 border-r border-b border-slate-700"></div>
            </div>
        </div>
    );
};

// --- CARTES DE RÉSULTATS (KPI) ---
const KPICard: React.FC<{
    title: string; value: string; subValue?: string; icon: React.ReactNode; 
    trend?: 'up' | 'down' | 'neutral'; trendValue?: string; color: string; 
    insight?: string; isAnalysisMode?: boolean;
}> = ({ title, value, subValue, icon, trend, trendValue, color, insight, isAnalysisMode }) => (
    <div className={`bg-white dark:bg-brand-dark p-6 rounded-2xl shadow-sm border transition-all duration-500 flex flex-col justify-between h-full ${isAnalysisMode ? 'ring-2 ring-blue-500/30 border-blue-100 scale-[1.02]' : 'border-slate-100 dark:border-white/5'}`}>
        <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10" style={{ color }}>
                {React.cloneElement(icon as React.ReactElement<any>, { className: `w-6 h-6` })}
            </div>
            <div className="flex items-center">
                {trend && (
                    <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full ${trend === 'up' ? 'bg-emerald-50 text-emerald-600' : trend === 'down' ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-500'}`}>
                        {trend === 'up' ? <ArrowUpRightIcon className="w-3 h-3"/> : <ArrowDownRightIcon className="w-3 h-3"/>}
                        {trendValue}
                    </div>
                )}
                <SmartInsight text={insight || ""} isActive={!!isAnalysisMode} />
            </div>
        </div>
        <div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</h3>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1 tracking-tight">{value}</p>
            {subValue && <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">{subValue}</p>}
        </div>
    </div>
);

// --- CONTENEUR DE GRAPHIQUE ---
const ChartCard: React.FC<{ 
    title: string; children: React.ReactNode; height?: number; 
    insight?: string; isAnalysisMode?: boolean; 
}> = ({ title, children, height = 300, insight, isAnalysisMode }) => (
    <div className={`bg-white dark:bg-brand-dark p-8 rounded-3xl shadow-sm border transition-all duration-500 flex flex-col ${isAnalysisMode ? 'ring-2 ring-blue-500/30 border-blue-100 shadow-xl' : 'border-slate-100 dark:border-white/5'}`}>
        <div className="flex justify-between items-start mb-10 border-l-4 border-blue-500 pl-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-[0.2em]">{title}</h3>
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

    // --- MOTEUR DE CALCUL ANALYTIQUE (Croisement des données) ---
    const data = useMemo(() => {
        // 1. Analyse temporelle (30 derniers jours)
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

        // 2. Inventaire et Valeur du stock
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

        // 3. Logistique et Géo
        const cities: Record<string, number> = {};
        const weeklyDist = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(d => ({ day: d, total: 0 }));
        orders.forEach(o => {
            const city = o.shippingAddress?.city || 'Inconnu';
            cities[city] = (cities[city] || 0) + 1;
            const dayIdx = new Date(o.date).getDay();
            weeklyDist[dayIdx].total++;
        });

        // 4. Clients et Fidélité
        const customerMap: Record<string, {count: number, total: number}> = {};
        orders.forEach(o => {
            if (!customerMap[o.customerName]) customerMap[o.customerName] = { count: 0, total: 0 };
            customerMap[o.customerName].count++;
            customerMap[o.customerName].total += o.total;
        });
        const vips = Object.entries(customerMap).map(([name, s]) => ({ name, count: s.count, total: s.total })).sort((a,b) => b.total - a.total).slice(0, 7);

        return {
            timeline: last30Days,
            categories: Object.entries(categoryMap).map(([name, s]) => ({ name, value: s.count, valuation: s.value, sales: s.sales })),
            topProducts: products.map(p => ({ name: p.name, sold: productPerformance[p.id] || 0 })).sort((a,b) => b.sold - a.sold).slice(0, 10),
            sleepingStock: products.filter(p => p.quantity > 5 && (productPerformance[p.id] || 0) === 0).slice(0, 5),
            geo: Object.entries(cities).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value).slice(0, 5),
            weekly: weeklyDist,
            vips,
            totals: {
                revenue: orders.filter(o => o.status !== 'Annulée').reduce((s, o) => s + o.total, 0),
                delivered: orders.filter(o => o.status === 'Livrée').reduce((s, o) => s + o.total, 0),
                pending: orders.filter(o => o.status === 'En attente' || o.status === 'Expédiée').reduce((s, o) => s + o.total, 0),
                cancelled: orders.filter(o => o.status === 'Annulée').reduce((s, o) => s + o.total, 0),
                aov: orders.length > 0 ? orders.reduce((s,o) => s+o.total, 0) / orders.length : 0
            }
        };
    }, [orders, products]);

    // --- TAB: DASHBOARD BI (VUE GLOBALE) ---
    const renderOverview = () => (
        <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard title="Ventes Totales" value={`${data.totals.revenue.toFixed(0)} DT`} subValue="Chiffre d'affaires brut" icon={<CreditCardIcon/>} trend="up" trendValue="12%" color={BI_COLORS.revenue} isAnalysisMode={isAnalysisMode} insight="C'est le montant total de toutes vos ventes. Si ce chiffre monte, votre boutique gagne en popularité." />
                <KPICard title="Nombre de Cures" value={orders.length.toString()} subValue="Commandes passées" icon={<ShoppingBagIcon/>} trend="up" trendValue="5%" color={BI_COLORS.orders} isAnalysisMode={isAnalysisMode} insight="Le nombre total de colis à préparer. Plus il y en a, plus votre logistique doit être rapide." />
                <KPICard title="Dépense Moyenne" value={`${data.totals.aov.toFixed(0)} DT`} subValue="Par patient (Panier)" icon={<ChartPieIcon/>} trend="neutral" trendValue="Stable" color={BI_COLORS.customers} isAnalysisMode={isAnalysisMode} insight="C'est ce qu'un client dépense en moyenne. Augmentez-le en proposant des produits complémentaires (Packs)." />
                <KPICard title="Messages Reçus" value={messages.length.toString()} subValue="Questions patients" icon={<InboxIcon/>} trend="down" trendValue="-2" color={BI_COLORS.neutral} isAnalysisMode={isAnalysisMode} insight="Le volume de demandes d'aide. Un chiffre bas montre que vos fiches produits sont claires." />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <ChartCard title="Performance Journalière (Ventes vs Panier)" isAnalysisMode={isAnalysisMode} insight="Les barres bleues montrent l'argent qui rentre par jour. La ligne violette montre si les clients achètent des produits plus ou moins chers.">
                        <ComposedChart data={data.timeline}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                            <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                            <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                            <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.1)'}} />
                            <Bar yAxisId="left" dataKey="revenue" fill={BI_COLORS.revenue} radius={[4, 4, 0, 0]} barSize={20} name="Ventes (DT)" />
                            <Line yAxisId="right" type="monotone" dataKey="aov" stroke={BI_COLORS.orders} strokeWidth={3} dot={{ r: 4, fill: BI_COLORS.orders }} name="Panier Moyen (DT)" />
                        </ComposedChart>
                    </ChartCard>
                </div>
                <ChartCard title="Répartition des Rayons" isAnalysisMode={isAnalysisMode} insight="Quelles sont les catégories les plus présentes dans votre boutique ?">
                    <PieChart>
                        <Pie data={data.categories} innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value">
                            {data.categories.map((_, index) => <Cell key={index} fill={BI_COLORS.palette[index % BI_COLORS.palette.length]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{fontSize: '10px'}} />
                    </PieChart>
                </ChartCard>
            </div>
        </div>
    );

    // --- TAB: FINANCES (ARGENT RÉEL) ---
    const renderFinancials = () => (
        <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <KPICard title="Argent Encaissé" value={`${data.totals.delivered.toFixed(0)} DT`} subValue="Commandes livrées" icon={<CheckCircleIcon/>} color={BI_COLORS.success} isAnalysisMode={isAnalysisMode} insight="C'est l'argent réel qui est déjà dans votre caisse car les produits sont arrivés chez le patient." />
                <KPICard title="Argent en Route" value={`${data.totals.pending.toFixed(0)} DT`} subValue="Commandes en cours" icon={<ClockIcon/>} color={BI_COLORS.revenue} isAnalysisMode={isAnalysisMode} insight="C'est le chiffre d'affaires prévisionnel. Il sera validé dès que le livreur aura fini son travail." />
                <KPICard title="Pertes (Annulations)" value={`${data.totals.cancelled.toFixed(0)} DT`} subValue="Commandes annulées" icon={<ArrowDownRightIcon/>} color={BI_COLORS.danger} isAnalysisMode={isAnalysisMode} insight="C'est l'argent perdu. Étudiez pourquoi les clients annulent pour améliorer votre tunnel de vente." />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ChartCard title="Ce que vous gagnez vs La TVA (19%)" isAnalysisMode={isAnalysisMode} insight="Le vert est votre gain net estimé, le gris est la taxe que vous collectez pour l'État.">
                    <BarChart data={[{ name: 'Bilan', Net: data.totals.revenue / 1.19, TVA: data.totals.revenue - (data.totals.revenue / 1.19) }]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" axisLine={false} />
                        <YAxis axisLine={false} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Net" fill={BI_COLORS.success} name="Gain Net" radius={[10, 10, 0, 0]} />
                        <Bar dataKey="TVA" fill={BI_COLORS.neutral} name="TVA Estimée" radius={[10, 10, 0, 0]} />
                    </BarChart>
                </ChartCard>
                <ChartCard title="Comment les clients payent" isAnalysisMode={isAnalysisMode} insight="Le paiement par Carte est plus sûr pour vous. Le paiement à la livraison demande une logistique plus stricte.">
                     <PieChart>
                        <Pie data={[{name: 'Carte Bancaire', value: orders.filter(o => o.paymentMethod.includes('Carte')).length}, {name: 'Espèces', value: orders.filter(o => o.paymentMethod.includes('livraison')).length}]} cx="50%" cy="50%" outerRadius={100} dataKey="value" label>
                            <Cell fill={BI_COLORS.revenue} /><Cell fill={BI_COLORS.customers} />
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ChartCard>
            </div>
        </div>
    );

    // --- TAB: LOGISTIQUE (LIVRAISON) ---
    const renderLogistics = () => (
        <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ChartCard title="Jours de grosse activité" isAnalysisMode={isAnalysisMode} insight="Quels jours recevez-vous le plus de commandes ? Utile pour prévoir le personnel de préparation.">
                    <BarChart data={data.weekly}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="day" axisLine={false} />
                        <YAxis axisLine={false} />
                        <Tooltip />
                        <Bar dataKey="total" fill={BI_COLORS.orders} name="Commandes" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ChartCard>
                <ChartCard title="Où sont vos patients ?" isAnalysisMode={isAnalysisMode} insight="Les villes les plus actives. Concentrez vos publicités Facebook sur ces zones.">
                    <BarChart data={data.geo} layout="vertical">
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={100} axisLine={false} tick={{fontSize: 12, fontWeight: 700}} />
                        <Tooltip />
                        <Bar dataKey="value" fill={BI_COLORS.revenue} name="Volume" radius={[0, 8, 8, 0]} />
                    </BarChart>
                </ChartCard>
            </div>
            <ChartCard title="Note d'Efficacité PharmaNature" height={400} isAnalysisMode={isAnalysisMode} insight="Plus la forme bleue est large, plus votre boutique est performante. Ici, nous jugeons la vitesse et la satisfaction.">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                    { subject: 'Vitesse Colis', A: 120, fullMark: 150 },
                    { subject: 'Taux Livraison', A: 98, fullMark: 150 },
                    { subject: 'Avis Patients', A: 135, fullMark: 150 },
                    { subject: 'Qualité Soins', A: 110, fullMark: 150 },
                    { subject: 'Support Client', A: 90, fullMark: 150 },
                ]}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{fontSize: 10, fontWeight: 800}} />
                    <Radar name="Votre Score" dataKey="A" stroke={BI_COLORS.revenue} fill={BI_COLORS.revenue} fillOpacity={0.4} />
                </RadarChart>
            </ChartCard>
        </div>
    );

    // --- TAB: INVENTAIRE (STOCKS) ---
    const renderInventory = () => (
        <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ChartCard title="L'argent qui dort par rayon" isAnalysisMode={isAnalysisMode} insight="Chaque carré représente la valeur totale des produits en stock. Évitez d'avoir de trop gros carrés sur des produits qui ne se vendent pas.">
                    <Treemap data={data.categories} dataKey="valuation" stroke="#fff" fill={BI_COLORS.palette[0]}>
                        <Tooltip />
                    </Treemap>
                </ChartCard>
                <ChartCard title="Vos 10 Meilleurs Produits" height={450} isAnalysisMode={isAnalysisMode} insight="Vos champions ! Ne tombez jamais en rupture de stock sur ces produits, ce sont eux qui font votre succès.">
                    <BarChart data={data.topProducts} layout="vertical" margin={{ left: 50 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={110} tick={{fontSize: 9, fontWeight: 700}} axisLine={false} />
                        <Tooltip />
                        <Bar dataKey="sold" fill={BI_COLORS.success} name="Vendus" radius={[0, 10, 10, 0]} />
                    </BarChart>
                </ChartCard>
            </div>
            
            <div className="bg-white dark:bg-brand-dark p-8 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm">
                <div className="flex justify-between items-center mb-8 border-l-4 border-rose-500 pl-4">
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-widest">Alerte : Stock qui ne bouge pas</h3>
                        <p className="text-[10px] text-slate-400 mt-1">Produits en stock mais sans aucune vente ce mois-ci.</p>
                    </div>
                    <SmartInsight isActive={isAnalysisMode} text="Ces produits occupent de la place pour rien. Faites une promotion de -20% pour vider ces étagères et récupérer de l'argent." />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-black/20">
                            <tr>
                                <th className="p-4 text-[10px] font-black uppercase text-slate-400">Produit</th>
                                <th className="p-4 text-[10px] font-black uppercase text-slate-400 text-center">Quantité</th>
                                <th className="p-4 text-[10px] font-black uppercase text-slate-400 text-right">Valeur Immobilisée</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                            {data.sleepingStock.map((p, i) => (
                                <tr key={i} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4 text-xs font-bold text-slate-900 dark:text-white">{p.name}</td>
                                    <td className="p-4 text-xs font-black text-rose-500 text-center">{p.quantity}</td>
                                    <td className="p-4 text-xs font-mono text-right">{(p.price * p.quantity).toFixed(3)} DT</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    // --- TAB: PATIENTS (FIDÉLITÉ) ---
    const renderPatients = () => (
        <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <KPICard title="Total Patients" value={`${data.vips.length}+`} subValue="Clients uniques" icon={<UsersIcon/>} trend="up" trendValue="Global" color={BI_COLORS.revenue} isAnalysisMode={isAnalysisMode} insight="Le nombre total de personnes qui vous font confiance. Plus ce chiffre est haut, plus votre marque est forte." />
                <KPICard title="Taux de Fidélité" value="28%" subValue="Reviennent acheter" icon={<CheckCircleIcon/>} trend="up" trendValue="Stable" color={BI_COLORS.success} isAnalysisMode={isAnalysisMode} insight="Le pourcentage de clients qui reviennent pour une 2ème cure. Un bon score est au-dessus de 25%." />
                <KPICard title="Valeur Client" value="450 DT" subValue="Dépense totale de vie" icon={<CreditCardIcon/>} trend="up" trendValue="AOV+" color={BI_COLORS.customers} isAnalysisMode={isAnalysisMode} insight="C'est ce qu'un client vous rapporte durant toute sa vie sur le site. Chouchoutez vos clients pour faire monter ce chiffre." />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ChartCard title="Vos Meilleurs Patients (Top CA)" isAnalysisMode={isAnalysisMode} insight="Ce sont vos ambassadeurs. Envoyez-leur un code promo personnalisé pour les remercier de leur fidélité.">
                    <BarChart data={data.vips} layout="vertical" margin={{ left: 50 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={110} tick={{fontSize: 10, fontWeight: 700}} axisLine={false} />
                        <Tooltip />
                        <Bar dataKey="total" fill={BI_COLORS.orders} name="Total dépensé" radius={[0, 8, 8, 0]} barSize={20} />
                    </BarChart>
                </ChartCard>
                <ChartCard title="Nouveaux vs Anciens" isAnalysisMode={isAnalysisMode} insight="Équilibre parfait : Il vous faut des nouveaux clients pour grandir, mais des anciens pour être rentable sans publicité.">
                    <PieChart>
                        <Pie data={[{name: 'Nouveaux', value: 70}, {name: 'Fidèles', value: 30}]} innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value">
                            <Cell fill={BI_COLORS.revenue} /><Cell fill={BI_COLORS.orders} />
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ChartCard>
            </div>
        </div>
    );

    // --- NAVIGATION ET LAYOUT PRINCIPAL ---
    const TABS = [
        { id: 'overview', label: 'Bilan Global', icon: <ChartPieIcon className="w-4 h-4"/> },
        { id: 'financials', label: 'Mon Revenu', icon: <CreditCardIcon className="w-4 h-4"/> },
        { id: 'orders', label: 'Livraisons', icon: <ShoppingBagIcon className="w-4 h-4"/> },
        { id: 'products', label: 'Mes Stocks', icon: <TagIcon className="w-4 h-4"/> },
        { id: 'customers', label: 'Mes Patients', icon: <UsersIcon className="w-4 h-4"/> },
    ];

    return (
        <div className="space-y-10 pb-20 font-sans">
            {/* Header PowerBI Professionnel - UNIFIÉ avec Catalogue Officine */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-slate-100 dark:border-white/5 pb-10">
                <div className="flex flex-col">
                    <h1 className="text-4xl font-serif font-black text-slate-900 dark:text-white uppercase tracking-tight">
                        Studio <span className="text-brand-primary italic">Analytics</span>
                    </h1>
                    <p className="text-slate-400 font-medium mt-2">Intelligence Analytique et Pilotage Stratégique PharmaNature</p>
                </div>
                
                <div className="flex gap-4 items-center">
                    <div className="flex items-center gap-4 bg-white dark:bg-gray-800 px-6 py-3 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
                        <div className="flex flex-col text-right">
                            <span className={`text-[9px] font-black uppercase tracking-widest ${isAnalysisMode ? 'text-blue-600 animate-pulse' : 'text-slate-400'}`}>
                                {isAnalysisMode ? 'Aide Active' : 'Mode Expert'}
                            </span>
                            <span className="text-[8px] text-slate-400 uppercase font-medium">Explications simples</span>
                        </div>
                        <button 
                            onClick={() => setIsAnalysisMode(!isAnalysisMode)}
                            className={`w-12 h-6 rounded-full p-1 transition-all duration-500 ${isAnalysisMode ? 'bg-blue-600' : 'bg-slate-200'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-500 ${isAnalysisMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </button>
                    </div>
                    <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                        <ClockIcon className="w-4 h-4 text-blue-400 animate-pulse"/> Mise à jour : OK
                    </div>
                </div>
            </div>

            {/* Navigation par onglets stylisée */}
            <div className="flex overflow-x-auto no-scrollbar gap-2 bg-slate-100 dark:bg-white/5 p-1.5 rounded-2xl">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                            flex items-center gap-3 px-8 py-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex-1 justify-center
                            ${activeTab === tab.id 
                                ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-xl' 
                                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                            }
                        `}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Zone de contenu dynamique */}
            <div className="min-h-[600px] animate-fadeIn">
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'financials' && renderFinancials()}
                {activeTab === 'orders' && renderLogistics()}
                {activeTab === 'products' && renderInventory()}
                {activeTab === 'customers' && renderPatients()}
            </div>
        </div>
    );
};
