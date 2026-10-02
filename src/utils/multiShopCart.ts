// Unified Multi-Store Cart Infrastructure
// Synchronizes cart selections across all 4 sub-shops (Pharma Shop, Fitness Shop, Cosmetics Shop, Electro Shop)

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
  para: {
    id: 'para',
    name: 'Pharma Shop',
    icon: '🌿',
    color: '#008b5e',
    badge: 'Santé & Bio',
    borderColor: 'border-emerald-200 dark:border-emerald-800/60',
    bgColor: 'bg-emerald-50/80 dark:bg-emerald-950/40',
    textColor: 'text-emerald-800 dark:text-emerald-300'
  },
  nutrition: {
    id: 'nutrition',
    name: 'Fitness Shop',
    icon: '⚡',
    color: '#84cc16',
    badge: 'Fitness & Pro',
    borderColor: 'border-amber-200 dark:border-amber-800/60',
    bgColor: 'bg-amber-50/80 dark:bg-amber-950/40',
    textColor: 'text-amber-800 dark:text-amber-300'
  },
  cosmetic: {
    id: 'cosmetic',
    name: 'Cosmetics Shop',
    icon: '💄',
    color: '#ec4899',
    badge: 'Luxe & Beauté',
    borderColor: 'border-rose-200 dark:border-rose-800/60',
    bgColor: 'bg-rose-50/80 dark:bg-rose-950/40',
    textColor: 'text-rose-800 dark:text-rose-300'
  },
  electro: {
    id: 'electro',
    name: 'Electro Shop',
    icon: '🔌',
    color: '#3b82f6',
    badge: 'High-Tech',
    borderColor: 'border-blue-200 dark:border-blue-800/60',
    bgColor: 'bg-blue-50/80 dark:bg-blue-950/40',
    textColor: 'text-blue-800 dark:text-blue-300'
  }
};

export const UNIFIED_CART_EVENT = 'multishop-cart-sync';

export function getUnifiedCartKey(userId?: string | null): string {
  return userId ? `multishop_unified_cart_${userId}` : 'multishop_unified_cart_guest';
}

export function inferShopId(item: any, fallbackShopId: string = 'para'): string {
  if (item.shopId && SHOPS_META[item.shopId]) return item.shopId;
  
  const idStr = String(item.id || '');
  const cat = String(item.originalItem?.category || item.category || '').toLowerCase();
  const name = String(item.name || '').toLowerCase();

  if (cat.includes('electro') || cat.includes('informatique') || cat.includes('smartphone') || cat.includes('tv') || cat.includes('audio') || name.includes('tv') || name.includes('samsung') || name.includes('apple') || name.includes('montre connectée')) {
    return 'electro';
  }
  if (cat.includes('cosmétique') || cat.includes('beauté') || cat.includes('parfum') || cat.includes('maquillage') || cat.includes('soin visage') || name.includes('sérum') || name.includes('rouge à lèvres') || name.includes('crème')) {
    return 'cosmetic';
  }
  if (cat.includes('nutrition') || cat.includes('whey') || cat.includes('musculation') || cat.includes('protéine') || cat.includes('créatine') || cat.includes('bcaa') || name.includes('whey') || name.includes('isolate') || name.includes('mass gainer')) {
    return 'nutrition';
  }
  if (cat.includes('pharma') || cat.includes('santé') || cat.includes('bio') || cat.includes('cure') || cat.includes('vitamine') || cat.includes('phytothérapie')) {
    return 'para';
  }
  return fallbackShopId;
}

export function enrichCartItem(item: any, currentShopId: string = 'para'): any {
  const shopId = inferShopId(item, currentShopId);
  const meta = SHOPS_META[shopId] || SHOPS_META.para;
  return {
    ...item,
    shopId,
    shopName: meta.name,
    shopIcon: meta.icon,
    shopColor: meta.color,
    shopBadge: meta.badge
  };
}

export function loadUnifiedCart(userId?: string | null, currentShopId: string = 'para'): any[] {
  try {
    const key = getUnifiedCartKey(userId);
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(item => enrichCartItem(item, currentShopId));
      }
    }

    // Auto-migration from legacy isolated cart keys
    const legacyKeys = [
      userId ? `cart_${userId}` : 'cart_guest',
      'cart_guest',
      'electroShopCart'
    ];

    const mergedMap = new Map<string, any>();
    for (const lKey of legacyKeys) {
      const data = localStorage.getItem(lKey);
      if (data) {
        try {
          const arr = JSON.parse(data);
          if (Array.isArray(arr)) {
            arr.forEach(item => {
              if (item && item.id) {
                const sId = lKey === 'electroShopCart' ? 'electro' : inferShopId(item, currentShopId);
                const enriched = enrichCartItem({ ...item, shopId: sId }, sId);
                const uniqueKey = `${enriched.id}_${enriched.selectedColor || ''}`;
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
    localStorage.setItem(key, JSON.stringify(items));
    if (broadcast && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(UNIFIED_CART_EVENT, { detail: { items, userId } }));
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
    const sId = inferShopId(item, 'para');
    const meta = SHOPS_META[sId] || SHOPS_META.para;
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
