
// Use relative URL to leverage Vite proxy in development
const BACKEND_URL = ''; 

// Queue pour stocker les requêtes en attente pendant le rafraîchissement du token
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

// Fonction de déconnexion forcée et propre
const forceLogout = () => {
    localStorage.removeItem('token');
    window.location.hash = '#/login?error=session_expired'; // Redirection propre via hash
};

const apiRequest = async (endpoint: string, method: string = 'GET', body?: any, isRetry: boolean = false): Promise<any> => {
    let token = localStorage.getItem('token');
    
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    
    if (token && token !== 'undefined' && token !== 'null') {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const options: RequestInit = {
        method,
        headers,
        credentials: 'include' // CRUCIAL: Permet d'envoyer/recevoir le cookie httpOnly (Refresh Token)
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${BACKEND_URL}/api${endpoint}`, options);

        // SECURE LOGIC FIX:
        // On ne tente JAMAIS de rafraichir le token si l'erreur vient du login (/auth/login)
        // car une 401 ici signifie "Mauvais mot de passe", pas "Token expiré".
        // On évite aussi la récursion sur /auth/refresh.
        const isAuthRequest = endpoint.includes('/auth/login') || endpoint.includes('/auth/refresh') || endpoint.includes('/auth/register');

        // CAS 1: Token Expiré (401) ou Interdit (403) SUR DES ROUTES PROTÉGÉES
        if ((response.status === 401 || response.status === 403) && !isRetry && !isAuthRequest) {
            // Si on est déjà en train de rafraîchir, on met cette requête en file d'attente
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => {
                    // Une fois la file débloquée, on réessaie la requête
                    return apiRequest(endpoint, method, body, true);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            // Sinon, on lance le processus de rafraîchissement
            isRefreshing = true;

            try {
                // Appel au backend pour utiliser le cookie RefreshToken et obtenir un nouveau AccessToken
                const refreshResponse = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include' // Envoie le cookie refreshToken
                });

                if (refreshResponse.ok) {
                    const data = await refreshResponse.json();
                    if (data.accessToken) {
                        localStorage.setItem('token', data.accessToken); // Mise à jour Access Token
                        processQueue(null, data.accessToken); // Débloque la file
                        isRefreshing = false;
                        return apiRequest(endpoint, method, body, true); // Réessaie la requête originale
                    }
                } 
                
                // Si le refresh échoue (ex: refresh token expiré ou invalide)
                throw new Error("Session expirée impossible à renouveler");

            } catch (refreshError) {
                // Échec total : on vide la file avec erreur et on déconnecte
                processQueue(refreshError, null);
                isRefreshing = false;
                forceLogout();
                throw refreshError;
            }
        }

        // CAS 2: Autres Erreurs API (ou erreur 401 sur login qui doit être renvoyée au composant)
        if (!response.ok) {
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
        // On ne loggue pas les erreurs 401 de login car elles sont attendues (mauvais mdp)
        // et gérées par le composant LoginPage
        if (error.message !== "Session expirée impossible à renouveler" && !(error.status === 401 && endpoint.includes('/auth/login'))) {
            console.error(`API Request failed: ${method} ${endpoint}`, error);
        }
        throw error;
    }
};

export const api = {
    // Auth
    login: (credentials: any) => apiRequest('/auth/login', 'POST', credentials),
    register: (userData: any) => apiRequest('/auth/register', 'POST', userData),
    getMe: () => apiRequest('/auth/me'), // Vérifie le token au chargement
    logout: () => {
        return apiRequest('/auth/logout').finally(() => {
            localStorage.removeItem('token');
            // Pas de redirection forcée ici, laissée au composant UI pour l'UX
        });
    },

    // Products
    getProducts: () => apiRequest('/products'),
    createProduct: (product: any) => apiRequest('/products', 'POST', product),
    updateProduct: (id: number | string, product: any) => apiRequest(`/products/${id}`, 'PUT', product),
    deleteProduct: (id: number | string) => apiRequest(`/products/${id}`, 'DELETE'),

    // Packs
    getPacks: () => apiRequest('/packs'),

    // Categories
    getCategories: () => apiRequest('/categories'),

    // Brands
    getBrands: () => apiRequest('/brands'),
    createBrand: (brand: any) => apiRequest('/brands', 'POST', brand),
    updateBrand: (id: number, brand: any) => apiRequest(`/brands/${id}`, 'PUT', brand),
    deleteBrand: (id: number) => apiRequest(`/brands/${id}`, 'DELETE'),

    // Stores
    getStores: () => apiRequest('/stores'),

    // Promotions
    getPromotions: () => apiRequest('/promotions'),

    // Advertisements
    getAdvertisements: () => apiRequest('/advertisements'),
    updateAdvertisements: (ads: any) => apiRequest('/advertisements', 'POST', ads),

    // Offers Config
    getOffersConfig: () => apiRequest('/offers-config'),
    updateOffersConfig: (config: any) => apiRequest('/offers-config', 'POST', config),

    // Orders
    createOrder: (order: any) => apiRequest('/orders', 'POST', order),
    getMyOrders: () => apiRequest('/orders/myorders'),
    getAllOrders: () => apiRequest('/orders'),

    // Payment
    initiatePayment: (data: { orderId: string; amount: number; customerInfo: any }) => apiRequest('/payment/create', 'POST', data),

    // Blog
    getBlogPosts: () => apiRequest('/blog'),
    getBlogPostBySlug: (slug: string) => apiRequest(`/blog/${slug}`),
    createBlogPost: (postData: any) => apiRequest('/blog', 'POST', postData),

    // Contact
    sendMessage: (data: { name: string; email: string; subject: string; message: string }) => apiRequest('/contact', 'POST', data),
    getMessages: () => apiRequest('/contact'),

    // Chat
    getChatHistory: (userId: string) => apiRequest(`/chat/${userId}`),
    getAllChats: () => apiRequest('/chat/all'),

    // Reviews
    getReviews: (targetType: 'product' | 'pack', targetId: number) => apiRequest(`/reviews/${targetType}/${targetId}`),
    createReview: (data: { targetId: number; targetType: 'product' | 'pack'; rating: number; comment: string }) => apiRequest('/reviews', 'POST', data),
};
