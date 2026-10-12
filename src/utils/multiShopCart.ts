// Unified Multi-Store Cart Infrastructure
// Synchronizes cart selections seamlessly across sub-shops (Fitness Shop, YoupiShop, DariShop)

export interface ShopMeta {
  id: string;
  name: string;
  icon: string;
  color: string;
  badge: string;
  borderColor: string;
  bgColor: string;
  textColor: string;
}

export const SHOPS_META: Record<string, ShopMeta> = {
  nutrition: {
    id: 'nutrition',
    name: 'Fitness Shop',
    icon: '⚡',
    color: '#84cc16',
    badge: 'Fitness & Pro',
    borderColor: 'border-lime-200 dark:border-lime-800/60',
    bgColor: 'bg-lime-50/90 dark:bg-lime-950/40',
    textColor: 'text-lime-800 dark:text-lime-300'
  },
  youpi: {
    id: 'youpi',
    name: 'YoupiShop',
    icon: '🧸',
    color: '#f59e0b',
    badge: 'Jeux & Éveil',
    borderColor: 'border-amber-200 dark:border-amber-800/60',
    bgColor: 'bg-amber-50/90 dark:bg-amber-950/40',
    textColor: 'text-amber-800 dark:text-amber-300'
  },
  dari: {
    id: 'dari',
    name: 'DariShop',
    icon: '🏠',
    color: '#0f3e37',
    badge: 'Maison & Déco',
    borderColor: 'border-emerald-200 dark:border-emerald-800/60',
    bgColor: 'bg-emerald-50/90 dark:bg-emerald-950/40',
    textColor: 'text-emerald-800 dark:text-emerald-300'
  }
};

export const UNIFIED_CART_EVENT = 'multishop-cart-sync';

export function getUnifiedCartKey(userId?: string | null): string {
  return userId ? `multishop_unified_cart_${userId}` : 'multishop_unified_cart_guest';
}

export function inferShopId(item: any, fallbackShopId: string = 'nutrition'): string {
  if (item.shopId && SHOPS_META[item.shopId]) return item.shopId;
  if (item.filialeKey && SHOPS_META[item.filialeKey]) return item.filialeKey;
  if (item.product?.filialeKey && SHOPS_META[item.product.filialeKey]) return item.product.filialeKey;
  if (item.originalItem?.filialeKey && SHOPS_META[item.originalItem.filialeKey]) return item.originalItem.filialeKey;

  const cat = String(item.product?.category || item.originalItem?.category || item.category || '').toLowerCase();
  const name = String(item.product?.name || item.name || '').toLowerCase();

  // YoupiShop patterns
  if (
    cat.includes('jouet') || cat.includes('jeu') || cat.includes('lego') || 
    cat.includes('peluche') || cat.includes('éveil') || cat.includes('bébé') ||
    name.includes('lego') || name.includes('peluche') || name.includes('poupée') || 
    name.includes('figurine') || name.includes('youpi') || name.includes('circuit')
  ) {
    return 'youpi';
  }

  // DariShop patterns
  if (
    cat.includes('meuble') || cat.includes('salon') || cat.includes('déco') || 
    cat.includes('chambre') || cat.includes('cuisine') || cat.includes('luminaire') ||
    cat.includes('table') || cat.includes('chaise') || cat.includes('canapé') ||
    name.includes('canapé') || name.includes('table') || name.includes('fauteuil') ||
    name.includes('miroir') || name.includes('lampe') || name.includes('meuble') ||
    name.includes('dari') || name.includes('buffet') || name.includes('tapis de salon')
  ) {
    return 'dari';
  }

  // Fitness / Nutrition patterns
  if (
    cat.includes('nutrition') || cat.includes('whey') || cat.includes('musculation') || 
    cat.includes('protéine') || cat.includes('créatine') || cat.includes('haltère') || 
    cat.includes('banc') || cat.includes('rack') || cat.includes('cardio') ||
    name.includes('whey') || name.includes('isolate') || name.includes('haltère') || 
    name.includes('banc') || name.includes('rack') || name.includes('tapis de course') ||
    name.includes('fitness') || name.includes('kettlebell') || name.includes('disque')
  ) {
    return 'nutrition';
  }

  return fallbackShopId;
}

export function normalizeProductId(id: any): string {
  if (id === null || id === undefined) return '';
  return String(id).replace(/^prod(uct)?-/, '').trim();
}

export function deduplicateCartItems(items: any[], currentShopId: string = 'nutrition'): any[] {
  if (!Array.isArray(items)) return [];
  const map = new Map<string, any>();
  for (const item of items) {
    if (!item) continue;
    const sId = inferShopId(item, item.shopId || currentShopId);
    const rawProdId = item.productId || item.product?.id || item.originalItem?.id || item.id;
    const cleanId = normalizeProductId(rawProdId);
    const color = item.selectedColor || '';
    const groupKey = `${sId}_${cleanId || rawProdId}_${color}`;

    const enriched = enrichCartItem({ ...item, shopId: sId, productId: cleanId || rawProdId }, sId);
    if (map.has(groupKey)) {
      map.get(groupKey).quantity += (Number(item.quantity) || 1);
    } else {
      map.set(groupKey, { ...enriched });
    }
  }
  return Array.from(map.values());
}

export function enrichCartItem(item: any, currentShopId: string = 'nutrition'): any {
  const shopId = inferShopId(item, currentShopId);
  const meta = SHOPS_META[shopId] || SHOPS_META.nutrition;
  
  // Extract standard fields
  const rawProductId = item.productId || item.product?.id || item.originalItem?.id || item.id;
  const cleanId = normalizeProductId(rawProductId);
  const productId = cleanId || rawProductId;
  const name = item.name || item.product?.name || item.originalItem?.name || 'Produit';
  const price = Number(item.price ?? item.product?.price ?? item.originalItem?.price ?? 0);
  const imageUrl = item.imageUrl || item.product?.imageUrl || item.originalItem?.imageUrl || (item.product?.images?.[0]) || '';
  const quantity = Number(item.quantity) || 1;
  const category = item.category || item.product?.category || item.originalItem?.category || '';

  const rawProduct = item.product || item.originalItem || {
    id: productId,
    name,
    price,
    imageUrl,
    category,
    filialeKey: shopId
  };

  const canonicalId = `cart_${shopId}_${productId}${item.selectedColor ? `_${item.selectedColor}` : ''}`;

  return {
    id: canonicalId,
    productId,
    name,
    price,
    imageUrl,
    quantity,
    category,
    selectedColor: item.selectedColor,
    shopId,
    shopName: meta.name,
    shopIcon: meta.icon,
    shopColor: meta.color,
    shopBadge: meta.badge,
    product: rawProduct,       // Guarantees item.product.id / name works in Youpi & Dari
    originalItem: rawProduct   // Guarantees item.originalItem works in Nutrition
  };
}

export function loadUnifiedCart(userId?: string | null, currentShopId: string = 'nutrition'): any[] {
  try {
    const key = getUnifiedCartKey(userId);
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const deduplicated = deduplicateCartItems(parsed, currentShopId);
        // If duplicates were merged, update storage cleanly
        if (deduplicated.length !== parsed.length) {
          localStorage.setItem(key, JSON.stringify(deduplicated));
        }
        return deduplicated;
      }
    }

    // Auto-migration from legacy sub-site isolated cart keys
    const legacyKeys = [
      userId ? `cart_${userId}` : 'cart_guest',
      'cart_guest',
      'nutritionShopCart',
      'youpiShopCart',
      'youpi_cart',
      'multishop_dari_cart'
    ];

    const mergedMap = new Map<string, any>();
    for (const lKey of legacyKeys) {
      const data = localStorage.getItem(lKey);
      if (data) {
        try {
          const arr = JSON.parse(data);
          if (Array.isArray(arr)) {
            arr.forEach(item => {
              if (item) {
                const sId = lKey.includes('youpi') 
                  ? 'youpi' 
                  : (lKey.includes('dari') 
                    ? 'dari' 
                    : (lKey.includes('nutrition') ? 'nutrition' : inferShopId(item, currentShopId)));
                const enriched = enrichCartItem({ ...item, shopId: sId }, sId);
                const uniqueKey = `${enriched.productId || enriched.id}_${enriched.shopId}_${enriched.selectedColor || ''}`;
                if (mergedMap.has(uniqueKey)) {
                  mergedMap.get(uniqueKey).quantity += (enriched.quantity || 1);
                } else {
                  mergedMap.set(uniqueKey, enriched);
                }
              }
            });
          }
        } catch {}
      }
    }

    const migrated = Array.from(mergedMap.values());
    if (migrated.length > 0) {
      localStorage.setItem(key, JSON.stringify(migrated));
      return migrated;
    }

    return [];
  } catch {
    return [];
  }
}

export function saveUnifiedCart(items: any[], userId?: string | null, broadcast: boolean = true): void {
  try {
    const key = getUnifiedCartKey(userId);
    const deduplicated = deduplicateCartItems(items);
    localStorage.setItem(key, JSON.stringify(deduplicated));
    
    // Also update legacy keys for resilience across templates
    try {
      localStorage.setItem('youpi_cart', JSON.stringify(deduplicated));
      localStorage.setItem('multishop_dari_cart', JSON.stringify(deduplicated));
    } catch {}

    if (broadcast && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(UNIFIED_CART_EVENT, { detail: { items: deduplicated, userId } }));
    }
  } catch (e) {
    console.error('Error saving unified cart:', e);
  }
}

export interface GroupedShopCart {
  meta: ShopMeta;
  items: any[];
  subtotal: number;
  itemCount: number;
}

export function groupCartByShop(items: any[]): GroupedShopCart[] {
  const groups: Record<string, GroupedShopCart> = {};

  items.forEach(item => {
    const sId = inferShopId(item, 'nutrition');
    const meta = SHOPS_META[sId] || SHOPS_META.nutrition;
    if (!groups[sId]) {
      groups[sId] = {
        meta,
        items: [],
        subtotal: 0,
        itemCount: 0
      };
    }
    groups[sId].items.push(item);
    groups[sId].subtotal += (Number(item.price) || 0) * (Number(item.quantity) || 1);
    groups[sId].itemCount += (Number(item.quantity) || 1);
  });

  return Object.values(groups);
}
