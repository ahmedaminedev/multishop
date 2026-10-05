export type VisibilityScope = 'backoffice' | 'frontoffice' | 'les_deux';
export type VisibilityMode = 'cacher_tout' | 'maintenance';

export interface SiteVisibilityItem {
  siteId: string;
  is_hidden: boolean;
  scope: VisibilityScope;
  mode: VisibilityMode;
  maintenance_message?: string;
}

export type SiteVisibilityMap = Record<string, SiteVisibilityItem>;

export const DEFAULT_SITE_VISIBILITY: SiteVisibilityMap = {
  para: {
    siteId: 'para',
    is_hidden: false,
    scope: 'frontoffice',
    mode: 'cacher_tout',
    maintenance_message: '🌿 PharmaShop est temporairement en maintenance technique. Notre équipe prépare de nouveaux produits de santé et bio.'
  },
  nutrition: {
    siteId: 'nutrition',
    is_hidden: false,
    scope: 'frontoffice',
    mode: 'cacher_tout',
    maintenance_message: '🏋️‍♂️ Fitness Shop fait l\'objet d\'une mise à jour de catalogue et réapprovisionnement technique.'
  },
  cosmetic: {
    siteId: 'cosmetic',
    is_hidden: false,
    scope: 'frontoffice',
    mode: 'cacher_tout',
    maintenance_message: '💄 Cosmetics Shop est temporairement indisponible pour maintenance technique.'
  },
  electro: {
    siteId: 'electro',
    is_hidden: false,
    scope: 'frontoffice',
    mode: 'cacher_tout',
    maintenance_message: '🔌 Electro Shop effectue une maintenance de son infrastructure. Retour très bientôt.'
  }
};

const STORAGE_KEY = 'multishop_site_visibility';

/**
 * Load current site visibility settings (from localStorage or backend)
 */
export const getCachedSiteVisibility = (): SiteVisibilityMap => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_SITE_VISIBILITY, ...JSON.parse(raw) };
    }
  } catch {
    // fallback
  }
  return DEFAULT_SITE_VISIBILITY;
};

/**
 * Fetch and sync site visibility from backend API
 */
export const fetchSiteVisibility = async (): Promise<SiteVisibilityMap> => {
  try {
    const res = await fetch('/api/site-visibility');
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      window.dispatchEvent(new CustomEvent('site-visibility-changed', { detail: data }));
      return { ...DEFAULT_SITE_VISIBILITY, ...data };
    }
  } catch {
    // fallback
  }
  return getCachedSiteVisibility();
};

/**
 * Save site visibility settings to backend and localStorage, and broadcast change
 */
export const saveSiteVisibility = async (newConfig: SiteVisibilityMap): Promise<SiteVisibilityMap> => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
    window.dispatchEvent(new CustomEvent('site-visibility-changed', { detail: newConfig }));

    const res = await fetch('/api/site-visibility', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newConfig)
    });
    if (res.ok) {
      const data = await res.json();
      return { ...DEFAULT_SITE_VISIBILITY, ...data };
    }
  } catch (err) {
    console.error('Error saving site visibility:', err);
  }
  return newConfig;
};

/**
 * Checks if a site should be completely hidden from the Front-Office navbar and routing
 */
export const isSiteHiddenInFrontOffice = (siteId: string, map?: SiteVisibilityMap): boolean => {
  const vis = map?.[siteId] || getCachedSiteVisibility()[siteId];
  if (!vis || !vis.is_hidden) return false;
  const inScope = vis.scope === 'frontoffice' || vis.scope === 'les_deux';
  return inScope && vis.mode === 'cacher_tout';
};

/**
 * Checks if a site is in Maintenance mode in Front-Office
 */
export const isSiteInMaintenanceInFrontOffice = (siteId: string, map?: SiteVisibilityMap): boolean => {
  const vis = map?.[siteId] || getCachedSiteVisibility()[siteId];
  if (!vis || !vis.is_hidden) return false;
  const inScope = vis.scope === 'frontoffice' || vis.scope === 'les_deux';
  return inScope && vis.mode === 'maintenance';
};

/**
 * Checks if a site should be completely hidden from Back-Office sidebar/switchers
 */
export const isSiteHiddenInBackOffice = (siteId: string, map?: SiteVisibilityMap): boolean => {
  const vis = map?.[siteId] || getCachedSiteVisibility()[siteId];
  if (!vis || !vis.is_hidden) return false;
  const inScope = vis.scope === 'backoffice' || vis.scope === 'les_deux';
  return inScope && vis.mode === 'cacher_tout';
};

/**
 * Checks if a site is marked in maintenance in Back-Office
 */
export const isSiteInMaintenanceInBackOffice = (siteId: string, map?: SiteVisibilityMap): boolean => {
  const vis = map?.[siteId] || getCachedSiteVisibility()[siteId];
  if (!vis || !vis.is_hidden) return false;
  const inScope = vis.scope === 'backoffice' || vis.scope === 'les_deux';
  return inScope && vis.mode === 'maintenance';
};
