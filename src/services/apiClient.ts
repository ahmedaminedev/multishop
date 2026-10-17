/**
 * Unified Central MultiShop API Client
 * - 100% Cookie-based HTTPOnly security (No token stored in localStorage)
 * - Automatic silent token refresh on 401
 * - Cross-shop headers and event synchronization
 */

const BACKEND_URL = '';

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

export const forceLogout = (reason: 'expired' | 'manual' = 'expired') => {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('auth-changed', { detail: { user: null, reason } }));
    window.dispatchEvent(new CustomEvent('session-expired-event'));
  }
};

export async function centralApiRequest(
  endpoint: string,
  method: string = 'GET',
  body?: any,
  shopId?: string,
  isRetry: boolean = false
): Promise<any> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  if (shopId) {
    headers['x-shop-id'] = shopId;
  }

  const options: RequestInit = {
    method,
    headers,
    credentials: 'include' // Impératif pour l'envoi automatique des cookies HTTPOnly (accessToken & refreshToken)
  };

  if (body !== undefined) {
    options.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api${endpoint}`, options);

    const isAuthRequest = endpoint.includes('/auth/login') ||
                          endpoint.includes('/auth/refresh') ||
                          endpoint.includes('/auth/prolong') ||
                          endpoint.includes('/auth/session-status') ||
                          endpoint.includes('/auth/register') ||
                          endpoint.includes('/auth/me');

    // Seul 401 Unauthorized (token expiré) déclenche une tentative silencieuse de refresh.
    // Un code 403 Forbidden est un refus d'accès (ex: client sur route admin), et ne doit JAMAIS déconnecter la session !
    if (response.status === 401 && !isRetry && !isAuthRequest) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return centralApiRequest(endpoint, method, body, shopId, true);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      isRefreshing = true;

      try {
        const refreshResponse = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });

        if (refreshResponse.ok) {
          processQueue(null);
          isRefreshing = false;
          return centralApiRequest(endpoint, method, body, shopId, true);
        }

        throw new Error('Session expirée impossible à renouveler');
      } catch (refreshError) {
        processQueue(refreshError);
        isRefreshing = false;
        forceLogout('expired');
        throw refreshError;
      }
    }

    if (!response.ok) {
      const errorData: any = {
        status: response.status,
        message: ''
      };
      try {
        const textBody = await response.text();
        const errorJson = JSON.parse(textBody);
        errorData.message = errorJson.message || errorJson.error || `Erreur API: ${response.status}`;
      } catch {
        errorData.message = `Erreur HTTP: ${response.status}`;
      }
      throw errorData;
    }

    const contentType = response.headers.get('content-type');
    const result = (contentType && contentType.includes('application/json'))
      ? await response.json()
      : await response.text();

    if (typeof window !== 'undefined' && method !== 'GET') {
      window.dispatchEvent(new CustomEvent('multishop_data_changed', { detail: { endpoint, method, shopId } }));
      window.dispatchEvent(new CustomEvent('stats_updated'));
    }

    return result;
  } catch (error: any) {
    throw error;
  }
}

export function createShopApiClient(shopId?: string) {
  const req = (endpoint: string, method: string = 'GET', body?: any) =>
    centralApiRequest(endpoint, method, body, shopId);

  return {
    apiRequest: req,
    api: {
      // Auth (100% HTTPOnly cookies & BDD)
      login: (credentials: any) => centralApiRequest('/auth/login', 'POST', credentials, shopId),
      register: (userData: any) => centralApiRequest('/auth/register', 'POST', userData, shopId),
      getMe: () => centralApiRequest('/auth/me', 'GET', undefined, shopId),
      getSessionStatus: () => centralApiRequest('/auth/session-status', 'GET', undefined, shopId),
      prolongSession: () => centralApiRequest('/auth/prolong', 'POST', undefined, shopId),
      logout: () => {
        return centralApiRequest('/auth/logout', 'POST', undefined, shopId).finally(() => {
          forceLogout('manual');
        });
      },

      // Products
      getProducts: () => req('/products'),
      createProduct: (product: any) => req('/products', 'POST', product),
      updateProduct: (id: number | string, product: any) => req(`/products/${id}`, 'PUT', product),
      deleteProduct: (id: number | string) => req(`/products/${id}`, 'DELETE'),

      // Packs
      getPacks: () => req('/packs'),
      createPack: (pack: any) => req('/packs', 'POST', pack),
      updatePack: (id: number | string, pack: any) => req(`/packs/${id}`, 'PUT', pack),
      deletePack: (id: number | string) => req(`/packs/${id}`, 'DELETE'),

      // Categories
      getCategories: () => req('/categories'),
      createCategory: (category: any) => req('/categories', 'POST', category),
      updateCategory: (nameOrId: string | number, category: any) => req(`/categories/${encodeURIComponent(nameOrId)}`, 'PUT', category),
      deleteCategory: (nameOrId: string | number) => req(`/categories/${encodeURIComponent(nameOrId)}`, 'DELETE'),

      // Brands
      getBrands: () => req('/brands'),
      createBrand: (brand: any) => req('/brands', 'POST', brand),
      updateBrand: (id: number, brand: any) => req(`/brands/${id}`, 'PUT', brand),
      deleteBrand: (id: number) => req(`/brands/${id}`, 'DELETE'),

      // Stores
      getStores: () => req('/stores'),

      // Promotions
      getPromotions: () => req('/promotions'),

      // Advertisements
      getAdvertisements: () => req('/advertisements'),
      updateAdvertisements: (ads: any) => req('/advertisements', 'POST', ads),

      // Offers Config
      getOffersConfig: () => req('/offers-config'),
      updateOffersConfig: (config: any) => req('/offers-config', 'POST', config),

      // Orders
      createOrder: (order: any) => req('/orders', 'POST', order),
      getMyOrders: () => req('/orders/myorders'),
      getAllOrders: () => req('/orders'),

      // Payment
      initiatePayment: (data: { orderId: string; amount: number; customerInfo: any }) => req('/payment/create', 'POST', data),

      // Blog
      getBlogPosts: () => req('/blog'),
      getBlogPostBySlug: (slug: string) => req(`/blog/${slug}`),
      createBlogPost: (postData: any) => req('/blog', 'POST', postData),

      // Contact
      sendMessage: (data: { name: string; email: string; subject: string; message: string }) => req('/contact', 'POST', data),
      getMessages: () => req('/contact'),

      // Chat
      getChatHistory: (userId: string) => req(`/chat/${userId}`),
      getAllChats: () => req('/chat/all'),

      // Reviews
      getReviews: (targetType: 'product' | 'pack', targetId: number) => req(`/reviews/${targetType}/${targetId}`),
      createReview: (data: { targetId: number; targetType: 'product' | 'pack'; rating: number; comment: string }) => req('/reviews', 'POST', data),

      // Logo & Custom
      uploadLogo: (dataUrl: string, config?: any) => req('/admin/logo', 'POST', { image: dataUrl, ...config }),
      resetLogo: () => req('/admin/logo', 'DELETE'),

      // Generic
      apiRequest: req
    }
  };
}
