
import { allProducts, packs, categories, initialStores, mockPromotions, initialAdvertisements, blogPosts, contactMessages, sampleOrders } from '../constants';

// Use relative URL to leverage Vite proxy in development
const BACKEND_URL = ''; 

// Flag to prevent multiple refresh calls simultaneously
let isRefreshing = false;
let failedQueue: any[] = [];

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

const apiRequest = async (endpoint: string, method: string = 'GET', body?: any, isRetry: boolean = false): Promise<any> => {
    let token = localStorage.getItem('token');
    
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    
    // Check strict pour éviter d'envoyer "Bearer undefined" ou "Bearer null"
    if (token && token !== 'undefined' && token !== 'null') {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const options: RequestInit = {
        method,
        headers,
        credentials: 'include' // Important for sending cookies (Refresh Token)
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${BACKEND_URL}/api${endpoint}`, options);

        if (!response.ok) {
            // Gestion de l'expiration du token (401) ou 403
            // CRUCIAL: On ne tente le refresh QUE si on avait un token à l'origine.
            // Si on n'avait pas de token, c'est juste un accès non autorisé normal (visiteur).
            if ((response.status === 401 || response.status === 403) && !isRetry && token) {
                if (isRefreshing) {
                    // Si un refresh est déjà en cours, on met cette requête en file d'attente
                    return new Promise((resolve, reject) => {
                        failedQueue.push({ resolve, reject });
                    }).then(newToken => {
                        // Une fois le refresh terminé, on réessaie avec le nouveau token
                        return apiRequest(endpoint, method, body, true);
                    }).catch(err => {
                        return Promise.reject(err);
                    });
                }

                isRefreshing = true;

                try {
                    // Tentative de rafraîchissement (le cookie httpOnly est envoyé automatiquement via credentials: include)
                    const refreshResponse = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include' 
                    });

                    if (refreshResponse.ok) {
                        const data = await refreshResponse.json();
                        // Mise à jour du token d'accès
                        localStorage.setItem('token', data.accessToken);
                        
                        // Traitement de la file d'attente
                        processQueue(null, data.accessToken);
                        isRefreshing = false;

                        // Réessai de la requête initiale
                        return apiRequest(endpoint, method, body, true);
                    } else {
                        // Refresh invalide ou expiré
                        throw new Error("Session expirée");
                    }
                } catch (refreshError) {
                    processQueue(refreshError, null);
                    isRefreshing = false;
                    
                    // Logout complet
                    localStorage.removeItem('token');
                    // On ne redirige pas brutalement si on est sur la page de login, mais sinon oui
                    if (!window.location.hash.includes('login') && !window.location.hash.includes('register')) {
                         // window.location.href = '/#/login'; // Optional: Redirect or just clear state
                    }
                    throw refreshError;
                }
            }

            const errorData = {
                status: response.status,
                message: ''
            };
            
            const textBody = await response.text();
            try {
                const errorJson = JSON.parse(textBody);
                errorData.message = errorJson.message || `API error: ${response.status}`;
            } catch (e) {
                errorData.message = textBody || `API error: ${response.status}`;
            }
            throw errorData;
        }

        if (response.status === 204) {
            return null;
        }
        return await response.json();
    } catch (error: any) {
        // Suppress console error if it's just a session expiry during background check
        if (error.message !== "Session expirée") {
            console.error(`API Request failed: ${method} ${endpoint}`, error);
        }
        throw error;
    }
};

// Helper to wrap API calls with mock fallback
const withMockFallback = async <T>(apiCall: () => Promise<T>, mockData: T): Promise<T> => {
    try {
        return await apiCall();
    } catch (error) {
        // console.warn('Backend unavailable or error, returning fallback data if available.', error);
        return mockData;
    }
};

export const api = {
    // Auth
    login: (credentials: any) => apiRequest('/auth/login', 'POST', credentials),
    register: (userData: any) => apiRequest('/auth/register', 'POST', userData),
    getMe: () => apiRequest('/auth/me'), // Direct API call, no mock fallback
    logout: () => {
        // On appelle le endpoint logout pour nettoyer les cookies, puis on vide le localstorage
        return apiRequest('/auth/logout').finally(() => {
            localStorage.removeItem('token');
        });
    },

    // Products
    getProducts: () => withMockFallback(() => apiRequest('/products'), allProducts),
    createProduct: (product: any) => apiRequest('/products', 'POST', product),
    updateProduct: (id: number | string, product: any) => apiRequest(`/products/${id}`, 'PUT', product),
    deleteProduct: (id: number | string) => apiRequest(`/products/${id}`, 'DELETE'),

    // Packs
    getPacks: () => withMockFallback(() => apiRequest('/packs'), packs),

    // Categories
    getCategories: () => withMockFallback(() => apiRequest('/categories'), categories),

    // Stores
    getStores: () => withMockFallback(() => apiRequest('/stores'), initialStores),

    // Promotions
    getPromotions: () => withMockFallback(() => apiRequest('/promotions'), mockPromotions),

    // Advertisements
    getAdvertisements: () => withMockFallback(() => apiRequest('/advertisements'), initialAdvertisements),

    // Orders
    createOrder: (order: any) => apiRequest('/orders', 'POST', order),
    getMyOrders: () => withMockFallback(() => apiRequest('/orders/myorders'), sampleOrders),
    getAllOrders: () => withMockFallback(() => apiRequest('/orders'), sampleOrders),

    // Payment
    initiatePayment: (data: { orderId: string; amount: number; customerInfo: any }) => apiRequest('/payment/create', 'POST', data),

    // Blog
    getBlogPosts: () => withMockFallback(() => apiRequest('/blog'), blogPosts),
    getBlogPostBySlug: (slug: string) => withMockFallback(() => apiRequest(`/blog/${slug}`), blogPosts.find(p => p.slug === slug)),

    // Contact
    sendMessage: (data: { name: string; email: string; subject: string; message: string }) => apiRequest('/contact', 'POST', data),
    getMessages: () => withMockFallback(() => apiRequest('/contact'), contactMessages),

    // Chat
    getChatHistory: (userId: string) => apiRequest(`/chat/${userId}`),
    getAllChats: () => apiRequest('/chat/all'),
};
