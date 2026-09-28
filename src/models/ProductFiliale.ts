/**
 * Modélisation du catalogue MultiShop avec héritage orienté objet
 * Classe de base Produit et sous-classes ProduitFiliale par filiale
 */

export enum FilialeType {
  PRODUIT_MYSHOPS_ELECTRO = 'produit_myshops_electro',
  PRODUIT_MYSHOPS_NUTRITION = 'produit_myshops_nutrition',
  PRODUIT_MYSHOPS_COSMETIQUE = 'produit_myshops_cosmetique',
  PRODUIT_MYSHOPS_PARA = 'produit_myshops_para'
}

export type FilialeId = 'electro' | 'nutrition' | 'cosmetic' | 'para';

export const FILIALE_CONFIG: Record<FilialeType, { id: FilialeId; name: string; badgeColor: string; icon: string }> = {
  [FilialeType.PRODUIT_MYSHOPS_ELECTRO]: {
    id: 'electro',
    name: 'Electro Shop',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300',
    icon: '🔌'
  },
  [FilialeType.PRODUIT_MYSHOPS_NUTRITION]: {
    id: 'nutrition',
    name: 'IronFuel Nutrition',
    badgeColor: 'bg-lime-100 text-lime-900 border-lime-300 dark:bg-zinc-800 dark:text-lime-400',
    icon: '⚡'
  },
  [FilialeType.PRODUIT_MYSHOPS_COSMETIQUE]: {
    id: 'cosmetic',
    name: 'Cosmetics Shop',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/40 dark:text-rose-300',
    icon: '💄'
  },
  [FilialeType.PRODUIT_MYSHOPS_PARA]: {
    id: 'para',
    name: 'PharmaNature',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300',
    icon: '🌿'
  }
};

/**
 * Classe de base Produit (commune à tout le groupe MultiShop)
 */
export class Produit {
  id: number;
  name: string;
  brand: string;
  price: number;
  oldPrice?: number;
  imageUrl: string;
  images: string[];
  discount?: number;
  category: string;
  parentCategory?: string;
  promo?: boolean;
  description?: string;
  quantity: number;
  rating?: number;
  reviewsCount?: number;
  specifications?: { name: string; value: string }[];
  colors?: { name: string; hex: string }[];
  dateAdded?: string;

  constructor(data: Partial<Produit>) {
    this.id = data.id || Date.now();
    this.name = data.name || '';
    this.brand = data.brand || 'MultiShop';
    this.price = data.price || 0;
    this.oldPrice = data.oldPrice;
    this.imageUrl = data.imageUrl || 'https://picsum.photos/400/400';
    this.images = data.images && data.images.length > 0 ? data.images : [this.imageUrl];
    this.discount = data.discount;
    this.category = data.category || 'Général';
    this.parentCategory = data.parentCategory;
    this.promo = data.promo || false;
    this.description = data.description || '';
    this.quantity = typeof data.quantity === 'number' ? data.quantity : 10;
    this.rating = data.rating || 4.5;
    this.reviewsCount = data.reviewsCount || 12;
    this.specifications = data.specifications || [];
    this.colors = data.colors || [];
    this.dateAdded = data.dateAdded || new Date().toISOString();
  }
}

/**
 * Classe abstraite ProduitFiliale qui hérite de Produit
 */
export abstract class ProduitFiliale extends Produit {
  filialeType: FilialeType;
  filialeName: string;
  codeArticleFiliale: string;
  garantieOuValidite?: string;
  disponibiliteMagasin?: string;

  constructor(data: any, filialeType: FilialeType, filialeName: string) {
    super(data);
    this.filialeType = filialeType;
    this.filialeName = filialeName;
    this.codeArticleFiliale = data.codeArticleFiliale || `${filialeType.toUpperCase()}-${this.id}`;
    this.garantieOuValidite = data.garantieOuValidite || 'Standard';
    this.disponibiliteMagasin = data.disponibiliteMagasin || 'En stock (Expédition 24/48h)';
  }

  abstract getSpecificAttributes(): Record<string, any>;
}

/**
 * Filiale Électroménager & High-Tech
 */
export class ProduitElectro extends ProduitFiliale {
  garantieMois: number;
  puissanceWatts?: string;
  classeEnergetique?: string;
  referenceTechnique?: string;
  voltage?: string;

  constructor(data: any) {
    super(data, FilialeType.PRODUIT_MYSHOPS_ELECTRO, 'Electro Shop');
    this.garantieMois = data.garantieMois || 24;
    this.puissanceWatts = data.puissanceWatts || '2000W';
    this.classeEnergetique = data.classeEnergetique || 'A++';
    this.referenceTechnique = data.referenceTechnique || `REF-${this.brand.slice(0, 3).toUpperCase()}-${this.id}`;
    this.voltage = data.voltage || '220-240V / 50Hz';
  }

  getSpecificAttributes() {
    return {
      'Garantie constructeur': `${this.garantieMois} mois`,
      'Puissance nominale': this.puissanceWatts,
      'Classe énergétique': this.classeEnergetique,
      'Référence technique': this.referenceTechnique,
      'Tension électrique': this.voltage
    };
  }
}

/**
 * Filiale Nutrition Sportive & Fitness
 */
export class ProduitNutrition extends ProduitFiliale {
  goutSaveur: string;
  poidsKg: number;
  proteinesParPortion: string;
  objectifSportif: string;
  valeurEnergetiqueKcal?: number;

  constructor(data: any) {
    super(data, FilialeType.PRODUIT_MYSHOPS_NUTRITION, 'IronFuel Nutrition');
    this.goutSaveur = data.goutSaveur || 'Chocolat Intense';
    this.poidsKg = data.poidsKg || 2.0;
    this.proteinesParPortion = data.proteinesParPortion || '24g / portion';
    this.objectifSportif = data.objectifSportif || 'Prise de masse & Récupération';
    this.valeurEnergetiqueKcal = data.valeurEnergetiqueKcal || 370;
  }

  getSpecificAttributes() {
    return {
      'Goût / Saveur': this.goutSaveur,
      'Poids net': `${this.poidsKg} kg`,
      'Protéines / portion': this.proteinesParPortion,
      'Objectif ciblé': this.objectifSportif,
      'Énergie (100g)': `${this.valeurEnergetiqueKcal} kcal`
    };
  }
}

/**
 * Filiale Cosmétique & Parfumerie de Luxe
 */
export class ProduitCosmetique extends ProduitFiliale {
  teinte?: string;
  volumeMl: number;
  hypoallergenique: boolean;
  effetSoin: string;
  parfumNotes?: string;

  constructor(data: any) {
    super(data, FilialeType.PRODUIT_MYSHOPS_COSMETIQUE, 'Cosmetics Shop');
    this.teinte = data.teinte || 'Naturel / Universel';
    this.volumeMl = data.volumeMl || 50;
    this.hypoallergenique = data.hypoallergenique !== undefined ? data.hypoallergenique : true;
    this.effetSoin = data.effetSoin || 'Hydratation profonde & Éclat';
    this.parfumNotes = data.parfumNotes || 'Floral doux et poudré';
  }

  getSpecificAttributes() {
    return {
      'Teinte / Nuance': this.teinte,
      'Contenance': `${this.volumeMl} ml`,
      'Hypoallergénique': this.hypoallergenique ? 'Oui (Testé sous contrôle dermatologique)' : 'Non',
      'Effet recherché': this.effetSoin,
      'Pyramide olfactive': this.parfumNotes
    };
  }
}

/**
 * Filiale Parapharmacie & Phytothérapie Naturelle
 */
export class ProduitPara extends ProduitFiliale {
  posologie: string;
  compositionBio: boolean;
  certification: string;
  formeGalenique: string;
  typePeauOuBesoin: string;

  constructor(data: any) {
    super(data, FilialeType.PRODUIT_MYSHOPS_PARA, 'PharmaNature');
    this.posologie = data.posologie || '2 prises par jour avec un grand verre d\'eau';
    this.compositionBio = data.compositionBio !== undefined ? data.compositionBio : true;
    this.certification = data.certification || 'Certifié Bio ECOCERT & ISO 22000';
    this.formeGalenique = data.formeGalenique || 'Gélules végétales';
    this.typePeauOuBesoin = data.typePeauOuBesoin || 'Immunité, Vitalité & Équilibre';
  }

  getSpecificAttributes() {
    return {
      'Posologie conseillée': this.posologie,
      'Composition Biologique': this.compositionBio ? '100% Bio & Naturel' : 'Formule Pharmaceutique Standard',
      'Certifications': this.certification,
      'Forme galénique': this.formeGalenique,
      'Cible / Besoin': this.typePeauOuBesoin
    };
  }
}

/**
 * Factory pour instancier la bonne sous-classe selon le filialeType
 */
export function createProduitFiliale(data: any, defaultFilialeType?: FilialeType): ProduitFiliale {
  const type = data.filialeType || defaultFilialeType || FilialeType.PRODUIT_MYSHOPS_PARA;

  switch (type) {
    case FilialeType.PRODUIT_MYSHOPS_ELECTRO:
      return new ProduitElectro(data);
    case FilialeType.PRODUIT_MYSHOPS_NUTRITION:
      return new ProduitNutrition(data);
    case FilialeType.PRODUIT_MYSHOPS_COSMETIQUE:
      return new ProduitCosmetique(data);
    case FilialeType.PRODUIT_MYSHOPS_PARA:
    default:
      return new ProduitPara(data);
  }
}
