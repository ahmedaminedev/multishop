/**
 * Modélisation du catalogue MultiShop avec héritage orienté objet
 * Classe de base Produit et sous-classes ProduitFiliale par filiale
 */

export enum FilialeType {
  PRODUIT_MYSHOPS_ELECTRO = 'produit_myshops_electro',
  PRODUIT_MYSHOPS_NUTRITION = 'produit_myshops_nutrition',
  PRODUIT_MYSHOPS_COSMETIQUE = 'produit_myshops_cosmetique',
  PRODUIT_MYSHOPS_PARA = 'produit_myshops_para',
  PRODUIT_MYSHOPS_YOUPI = 'produit_myshops_youpi'
}

export type FilialeId = 'electro' | 'nutrition' | 'cosmetic' | 'para' | 'youpi';

export const FILIALE_CONFIG: Record<FilialeType, { id: FilialeId; name: string; badgeColor: string; icon: string }> = {
  [FilialeType.PRODUIT_MYSHOPS_ELECTRO]: {
    id: 'electro',
    name: 'Electro Shop',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300',
    icon: '🔌'
  },
  [FilialeType.PRODUIT_MYSHOPS_NUTRITION]: {
    id: 'nutrition',
    name: 'Fitness Shop',
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
    name: 'PharmaShop',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300',
    icon: '🌿'
  },
  [FilialeType.PRODUIT_MYSHOPS_YOUPI]: {
    id: 'youpi',
    name: 'YoupiShop',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300',
    icon: '🧸'
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
  quantité_enstock: number;
  existe_dans_boutique: boolean;
  fournisseurId?: string;
  fournisseurNom?: string;
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
    this.quantité_enstock = typeof data.quantité_enstock === 'number' ? data.quantité_enstock : (typeof data.quantity === 'number' ? data.quantity : 10);
    this.quantity = this.quantité_enstock;
    this.existe_dans_boutique = data.existe_dans_boutique !== undefined ? Boolean(data.existe_dans_boutique) : true;
    this.fournisseurId = data.fournisseurId;
    this.fournisseurNom = data.fournisseurNom;
    this.rating = data.rating || 4.5;
    this.reviewsCount = data.reviewsCount || 12;
    this.specifications = data.specifications || [];
    this.colors = data.colors || [];
    this.dateAdded = data.dateAdded || new Date().toISOString();
  }
}

/**
 * Type de vente pour les sources de produit
 */
export type TypeVenteSource = 'engros' | 'detail' | 'les_deux';

/**
 * Classe SourceProduit : pour tracer l'origine de prospection (Instagram, TikTok, Facebook, grossiste...)
 */
export class SourceProduit {
  id: string;
  nom: string;
  lien: string;
  numero?: string;
  localisation?: string;
  type_vente: TypeVenteSource;
  notes?: string;
  dateCreation: string;

  constructor(data: Partial<SourceProduit>) {
    this.id = data.id || `src-${Date.now()}`;
    this.nom = data.nom || '';
    this.lien = data.lien || '';
    this.numero = data.numero || '';
    this.localisation = data.localisation || '';
    this.type_vente = data.type_vente || 'les_deux';
    this.notes = data.notes || '';
    this.dateCreation = data.dateCreation || new Date().toISOString();
  }
}

/**
 * Statut d'un Futur Produit en cours de prospection
 */
export type StatutFutureProduit = 'en_prospection' | 'converti_en_stock' | 'abandonne';

/**
 * Classe FutureProduit : produit repéré chez une source, pas encore en stock
 */
export class FutureProduit {
  id: string;
  nom: string;
  image?: string;
  lien?: string;
  prix_source: number;
  quantite?: number;
  quantite_enstock?: number;
  sourceId: string;
  sourceNom?: string;
  site: string; // 'fitnessshop' | 'parashop' | 'cosmetic' | 'electro' | 'autre'
  is_futur_site: boolean;
  futur_site?: string;
  categorie: string;
  statut: StatutFutureProduit;
  notes?: string;
  dateCreation: string;

  constructor(data: Partial<FutureProduit>) {
    this.id = data.id || `fut-${Date.now()}`;
    this.nom = data.nom || '';
    this.image = data.image || '';
    this.lien = data.lien || '';
    this.prix_source = data.prix_source || 0;
    this.quantite = data.quantite ?? data.quantite_enstock ?? 10;
    this.quantite_enstock = this.quantite;
    this.sourceId = data.sourceId || '';
    this.sourceNom = data.sourceNom || '';
    this.site = data.site || 'fitnessshop';
    this.is_futur_site = Boolean(data.is_futur_site);
    this.futur_site = data.futur_site || '';
    this.categorie = data.categorie || '';
    this.statut = data.statut || 'en_prospection';
    this.notes = data.notes || '';
    this.dateCreation = data.dateCreation || new Date().toISOString();
  }
}

/**
 * Article dans l'historique d'approvisionnement d'un fournisseur
 */
export interface ItemAchatFournisseur {
  productId?: number | string;
  futureProductId?: string;
  nom: string;
  quantite: number;
  prixAchat?: number;
  site: string;
  siteName?: string;
  image?: string;
  notes?: string;
}

/**
 * Historique d'une réception de stock chez un fournisseur
 */
export interface AchatFournisseur {
  id: string;
  date: string;
  type: 'produit_existant' | 'future_produit';
  items: ItemAchatFournisseur[];
  montantTotal?: number;
  notes?: string;
}

/**
 * Classe Fournisseur : pour gérer les partenaires et l'historique des achats
 */
export class Fournisseur {
  id: string;
  nom: string;
  localisation: string;
  lien: string;
  image: string;
  telephone?: string;
  notes?: string;
  historique_achats: AchatFournisseur[];
  dateCreation: string;

  constructor(data: Partial<Fournisseur>) {
    this.id = data.id || `frn-${Date.now()}`;
    this.nom = data.nom || '';
    this.localisation = data.localisation || '';
    this.lien = data.lien || '';
    this.image = data.image || 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=300';
    this.telephone = data.telephone || '';
    this.notes = data.notes || '';
    this.historique_achats = data.historique_achats || [];
    this.dateCreation = data.dateCreation || new Date().toISOString();
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
    super(data, FilialeType.PRODUIT_MYSHOPS_NUTRITION, 'Fitness Shop');
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
    super(data, FilialeType.PRODUIT_MYSHOPS_PARA, 'PharmaShop');
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
 * Filiale Jeux d'enfant, Jouets & Éveil (YoupiShop)
 */
export class ProduitYoupi extends ProduitFiliale {
  trancheAge: string;
  materiauPrincipal: string;
  normeSecurite: string;
  nbJoueurs?: string;
  pilesRequises: boolean;

  constructor(data: any) {
    super(data, FilialeType.PRODUIT_MYSHOPS_YOUPI, 'YoupiShop');
    this.trancheAge = data.trancheAge || '3 - 8 ans';
    this.materiauPrincipal = data.materiauPrincipal || 'Bois naturel certifié FSC & Plastique sans BPA';
    this.normeSecurite = data.normeSecurite || 'Conforme normes CE & EN-71';
    this.nbJoueurs = data.nbJoueurs || '1 à 4 joueurs';
    this.pilesRequises = data.pilesRequises !== undefined ? data.pilesRequises : false;
  }

  getSpecificAttributes() {
    return {
      'Tranche d\'âge recommandée': this.trancheAge,
      'Matériaux': this.materiauPrincipal,
      'Normes de sécurité': this.normeSecurite,
      'Nombre de joueurs': this.nbJoueurs,
      'Piles requises': this.pilesRequises ? 'Oui (Incluses ou non)' : 'Non (Mécanique / Éveil manuel)'
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
    case FilialeType.PRODUIT_MYSHOPS_YOUPI:
      return new ProduitYoupi(data);
    case FilialeType.PRODUIT_MYSHOPS_PARA:
    default:
      return new ProduitPara(data);
  }
}
