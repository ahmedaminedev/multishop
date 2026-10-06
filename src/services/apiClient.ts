/**
 * Unified Central MultiShop API Client
 * Centralizes request execution, 401 token refresh queue, error handling,
 * and multi-shop headers across all 4 templates and backoffice.
 */

const BACKEND_URL = '';

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const forceLogout = () => {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('auth-changed', { detail: { user: null, token: null } }));
    window.location.hash = '#/login?error=session_expired';
  }
};

export async function centralApiRequest(
  endpoint: string,
  method: string = 'GET',
  body?: any,
  shopId?: string,
  isRetry: boolean = false
): Promise<any> {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  if (shopId) {
    headers['x-shop-id'] = shopId;
  }

  if (token && token !== 'undefined' && token !== 'null') {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options: RequestInit = {
    method,
    headers,
    credentials: 'include'
  };

  if (body !== undefined) {
    options.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api${endpoint}`, options);

    const isAuthRequest = endpoint.includes('/auth/login') ||
                          endpoint.includes('/auth/refresh') ||
                          endpoint.includes('/auth/register');

    // Token Expired / Forbidden on protected routes
    if ((response.status === 401 || response.status === 403) && !isRetry && !isAuthRequest && token) {
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
          const data = await refreshResponse.json();
          if (data.accessToken) {
            localStorage.setItem('token', data.accessToken);
            processQueue(null, data.accessToken);
            isRefreshing = false;
            return centralApiRequest(endpoint, method, body, shopId, true);
          }
        }

        throw new Error('Session expirée impossible à renouveler');
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        forceLogout();
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
    if (error.message !== 'Session expirée impossible à renouveler' && !(error.status === 401 && endpoint.includes('/auth/login'))) {
      // Non-fatal or expected errors
    }
    throw error;
  }
}

export function createShopApiClient(shopId?: string) {
  const req = (endpoint: string, method: string = 'GET', body?: any) =>
    centralApiRequest(endpoint, method, body, shopId);

  return {
    apiRequest: req,
    api: {
      // Auth
      login: (credentials: any) => centralApiRequest('/auth/login', 'POST', credentials, shopId),
      register: (userData: any) => centralApiRequest('/auth/register', 'POST', userData, shopId),
      getMe: () => centralApiRequest('/auth/me', 'GET', undefined, shopId),
      logout: () => {
        return centralApiRequest('/auth/logout', 'POST', undefined, shopId).finally(() => {
          if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('auth-changed', { detail: { user: null, token: null } }));
          }
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
    }
  };
}
