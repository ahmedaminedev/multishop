import React, { useState } from 'react';
import { Truck, MapPin, ShieldCheck, Wrench, ChevronDown, CheckCircle2 } from 'lucide-react';

interface HeavyDeliveryCalculatorProps {
    productWeightKg?: number;
    productPrice?: number;
    className?: string;
}

const TUNISIA_REGIONS = [
    { name: 'Grand Tunis (Tunis, Ariana, Ben Arous, Manouba)', baseFee: 15, delay: '24h Express' },
    { name: 'Cap Bon (Nabeul, Hammamet)', baseFee: 25, delay: '24-48h' },
    { name: 'Sahel (Sousse, Monastir, Mahdia)', baseFee: 25, delay: '24-48h' },
    { name: 'Bizerte & Nord', baseFee: 30, delay: '48h' },
    { name: 'Sfax & Centre', baseFee: 35, delay: '48h' },
    { name: 'Sud (Gabès, Médenine, Djerba, Zarzis)', baseFee: 45, delay: '48-72h' },
    { name: 'Centre-Ouest (Kairouan, Sidi Bouzid, Kasserine, Gafsa)', baseFee: 40, delay: '48-72h' }
];

export const HeavyDeliveryCalculator: React.FC<HeavyDeliveryCalculatorProps> = ({
    productWeightKg = 45,
    productPrice = 350,
    className = ''
}) => {
    const [selectedRegion, setSelectedRegion] = useState(TUNISIA_REGIONS[0]);
    const [floorOption, setFloorOption] = useState<'rdc' | 'etage'>('rdc');
    const [includeAssembly, setIncludeAssembly] = useState(false);

    // Calculate delivery fee
    const isFreeDeliveryEligible = productPrice >= 1000;
    const heavyWeightSurcharge = productWeightKg > 40 ? 15 : 0;
    const floorFee = floorOption === 'etage' ? 20 : 0;
    const assemblyFee = includeAssembly ? 45 : 0;

    const baseDelivery = isFreeDeliveryEligible ? 0 : (selectedRegion.baseFee + heavyWeightSurcharge);
    const totalShipping = baseDelivery + floorFee + assemblyFee;

    return (
        <div className={`bg-slate-50 dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 ${className}`}>
            
            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#84cc16]/15 text-[#4d7c0f] dark:text-[#84cc16] flex items-center justify-center">
                        <Truck className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <div>
                        <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wide">
                            Livraison Matériel Lourd Tunisie
                        </h4>
                        <p className="text-[10px] text-slate-500">
                            Poids estimé : ~{productWeightKg} kg · Transport spécialisé avec hayon
                        </p>
                    </div>
                </div>

                {isFreeDeliveryEligible && (
                    <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-black text-[10px] uppercase rounded-md tracking-wider">
                        Livraison Offerte dès 1 000 DT
                    </span>
                )}
            </div>

            {/* Region Selector */}
            <div className="space-y-3">
                <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1 block">
                        Votre Région / Gouvernorat :
                    </label>
                    <div className="relative">
                        <select 
                            value={selectedRegion.name}
                            onChange={(e) => {
                                const found = TUNISIA_REGIONS.find(r => r.name === e.target.value);
                                if (found) setSelectedRegion(found);
                            }}
                            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 text-xs font-semibold appearance-none focus:outline-none focus:border-[#84cc16] cursor-pointer pr-10 shadow-2xs"
                        >
                            {TUNISIA_REGIONS.map((region) => (
                                <option key={region.name} value={region.name}>
                                    {region.name} ({region.delay})
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
                    </div>
                </div>

                {/* Floor and Handling options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <button
                        type="button"
                        onClick={() => setFloorOption('rdc')}
                        className={`p-2.5 rounded-xl border text-left transition-all text-xs cursor-pointer ${
                            floorOption === 'rdc' 
                                ? 'bg-white dark:bg-slate-800 border-[#84cc16] text-slate-900 dark:text-white font-bold shadow-2xs' 
                                : 'bg-slate-100/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-500'
                        }`}
                    >
                        <span className="block text-[10px] uppercase text-[#84cc16] font-black">Option standard</span>
                        <span>Rez-de-chaussée / Ascenseur</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setFloorOption('etage')}
                        className={`p-2.5 rounded-xl border text-left transition-all text-xs cursor-pointer ${
                            floorOption === 'etage' 
                                ? 'bg-white dark:bg-slate-800 border-[#84cc16] text-slate-900 dark:text-white font-bold shadow-2xs' 
                                : 'bg-slate-100/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-500'
                        }`}
                    >
                        <span className="block text-[10px] uppercase text-[#84cc16] font-black">+20 DT</span>
                        <span>Étage sans ascenseur (2 livreurs)</span>
                    </button>
                </div>

                {/* Assembly service add-on */}
                <div 
                    onClick={() => setIncludeAssembly(!includeAssembly)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        includeAssembly 
                            ? 'bg-[#84cc16]/10 border-[#84cc16]' 
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/80'
                    }`}
                >
                    <div className="flex items-center gap-2.5">
                        <Wrench className={`w-4 h-4 ${includeAssembly ? 'text-[#84cc16]' : 'text-slate-400'}`} />
                        <div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white block">
                                Service Montage & Assemblage Professionnel
                            </span>
                            <span className="text-[10px] text-slate-500">
                                Technicien qualifié sur place pour un montage 100% sécurisé
                            </span>
                        </div>
                    </div>
                    <span className="text-xs font-black font-mono text-[#84cc16] shrink-0">
                        +45.000 DT
                    </span>
                </div>

                {/* Calculation Summary Result */}
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                        <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">
                            Délai estimé : {selectedRegion.delay}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Transport sécurisé avec assurance casse incluse</span>
                        </div>
                    </div>

                    <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Frais estimés</span>
                        <span className="text-base font-black font-mono text-slate-900 dark:text-white">
                            {totalShipping === 0 ? (
                                <span className="text-emerald-600 dark:text-emerald-400">GRATUIT</span>
                            ) : (
                                `${totalShipping.toFixed(3)} DT`
                            )}
                        </span>
                    </div>
                </div>

            </div>

        </div>
    );
};
