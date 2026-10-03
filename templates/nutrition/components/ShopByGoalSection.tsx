import React from 'react';
import { Dumbbell, Flame, Trophy, Home, ArrowRight } from 'lucide-react';

interface ShopByGoalSectionProps {
    onSelectGoal: (category: string) => void;
}

const GOALS = [
    {
        id: 'powerlifting',
        title: 'Force & Powerlifting',
        subtitle: 'Racks lourds, barres 20kg et fonte olympique',
        category: 'Racks & Stations',
        metric: 'Charge testée 600kg',
        accentColor: '#dc2626', // Red
        icon: <Trophy className="w-5 h-5" />,
        bgImage: '/src/assets/images/category_rack_station_1790951619589.jpg'
    },
    {
        id: 'hypertrophy',
        title: 'Hypertrophie & Musculation',
        subtitle: 'Haltères hexagonaux & bancs ajustables multipostes',
        category: 'Haltères & Poids',
        metric: 'Isolation musculaire max',
        accentColor: '#84cc16', // Neon Green
        icon: <Dumbbell className="w-5 h-5" />,
        bgImage: '/src/assets/images/category_halteres_poids_1790951598408.jpg'
    },
    {
        id: 'cardio',
        title: 'Cardio & Brûle-Graisses',
        subtitle: 'Tapis de course connectés & rameurs à résistance air',
        category: 'Cardio',
        metric: 'Moteur garanti 5 ans',
        accentColor: '#2563eb', // Blue
        icon: <Flame className="w-5 h-5" />,
        bgImage: '/src/assets/images/category_tapis_cardio_1790951629862.jpg'
    },
    {
        id: 'compact',
        title: 'Home Gym Espace Réduit',
        subtitle: 'Équipements pliables & rangements compacts d\'appartement',
        category: 'Bancs de Musculation',
        metric: '< 1.5 m² au sol',
        accentColor: '#eab308', // Yellow
        icon: <Home className="w-5 h-5" />,
        bgImage: '/src/assets/images/category_banc_musculation_1790951610418.jpg'
    }
];

export const ShopByGoalSection: React.FC<ShopByGoalSectionProps> = ({ onSelectGoal }) => {
    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-[#84cc16]"></span>
                        <span className="text-[11px] font-black uppercase tracking-widest text-[#84cc16]">
                            Orientation Entraînement
                        </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                        Choisissez Votre Objectif Sportif
                    </h2>
                </div>
                <p className="text-xs text-slate-500 max-w-sm">
                    Des configurations d'équipement sélectionnées sur mesure selon votre discipline sportive.
                </p>
            </div>

            {/* 4 Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {GOALS.map((goal) => (
                    <div
                        key={goal.id}
                        onClick={() => onSelectGoal(goal.category)}
                        className="group relative rounded-2xl overflow-hidden bg-slate-900 text-white min-h-[260px] p-6 flex flex-col justify-between border border-slate-800 hover:border-[#84cc16] transition-all duration-300 hover:shadow-xl cursor-pointer hover:-translate-y-1"
                    >
                        {/* Background Image */}
                        <div 
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                            style={{ backgroundImage: `url('${goal.bgImage}')` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-slate-900/60"></div>
                        </div>

                        {/* Top: Icon & Metric */}
                        <div className="relative z-10 flex items-center justify-between">
                            <div 
                                className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
                                style={{ backgroundColor: `${goal.accentColor}33`, borderColor: goal.accentColor, borderWidth: '1px' }}
                            >
                                {goal.icon}
                            </div>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-black/60 border border-white/10 text-white">
                                {goal.metric}
                            </span>
                        </div>

                        {/* Bottom: Text & Button */}
                        <div className="relative z-10 pt-6">
                            <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-white mb-1.5 group-hover:text-[#84cc16] transition-colors">
                                {goal.title}
                            </h3>
                            <p className="text-xs text-slate-300 leading-snug line-clamp-2 mb-4">
                                {goal.subtitle}
                            </p>

                            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#84cc16]">
                                <span>Voir le matériel</span>
                                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

        </section>
    );
};
