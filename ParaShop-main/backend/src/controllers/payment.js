
const catchAsync = require('../utils/catchAsync');

// --- CONFIGURATION PAYMEE ---
// Pour ce déploiement de test, on force le mode SANDBOX même si NODE_ENV est 'production'
// Cela permet d'utiliser votre clé API de test sur le serveur Azure.
const USE_SANDBOX = true; 

// NOTE: Assurez-vous d'avoir une clé valide dans .env pour la production
const PAYMEE_API_KEY = process.env.PAYMEE_API_KEY || "8b5dccaa6f411f856cfab0fedbe2fa2ab437f8ba";

const PAYMEE_URL = USE_SANDBOX 
    ? "https://sandbox.paymee.tn/api/v2/payments/create" 
    : "https://app.paymee.tn/api/v2/payments/create";

exports.initiatePayment = catchAsync(async (req, res) => {
    const { orderId, amount, customerInfo } = req.body;

    if (!amount || !orderId || !customerInfo) {
        return res.status(400).json({ message: "Données de paiement incomplètes." });
    }

    // 1. Formatage du téléphone
    // Paymee attend le format international sans '+' (ex: 216XXXXXXXX)
    let cleanPhone = (customerInfo.phone || "").toString().replace(/[^0-9]/g, "");
    
    if (cleanPhone.length === 8) {
        cleanPhone = `216${cleanPhone}`;
    } else if (cleanPhone.startsWith("00216")) {
        cleanPhone = cleanPhone.substring(2);
    }
    // Si le numéro commence par +216 (nettoyé en 216...), c'est bon.

    // 2. Formatage du montant (Nombre pur, float)
    const formattedAmount = parseFloat(Number(amount).toFixed(3));

    // 3. URLs de redirection
    let baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    
    // NOTE IMPORTANTE : Sur le serveur Azure sans SSL (http://IP), nous ne devons PAS forcer https://
    // Sinon le retour de paiement échouera (Page introuvable / Connexion refusée).
    // Paymee Sandbox accepte généralement les URLs HTTP.
    
    // On utilise des query params standards pour éviter les problèmes avec les hash (#) dans les redirections serveur
    const returnUrl = `${baseUrl}/?payment=success&orderId=${orderId}`;
    const cancelUrl = `${baseUrl}/?payment=cancelled`;
    
    // Webhook URL
    const webhookUrl = (process.env.NODE_ENV === 'production' && process.env.BACKEND_URL)
        ? `${process.env.BACKEND_URL}/api/payment/webhook` 
        : "https://google.com";

    const payload = {
        amount: formattedAmount,
        note: `Order ${orderId}`,
        first_name: (customerInfo.firstName || "Client").substring(0, 50),
        last_name: (customerInfo.lastName || "ElectroShop").substring(0, 50),
        email: customerInfo.email || "client@electroshop.tn",
        phone: cleanPhone,
        webhook_url: webhookUrl,
        return_url: returnUrl,
        cancel_url: cancelUrl,
        order_id: orderId.toString()
    };

    console.log(`\n--- [PAYMEE REQUEST] ---`);
    console.log(`Mode: ${USE_SANDBOX ? 'SANDBOX' : 'LIVE'}`);
    console.log("URL:", PAYMEE_URL);
    console.log("Return URL:", returnUrl);
    
    try {
        const response = await fetch(PAYMEE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${PAYMEE_API_KEY}`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        
        // Paymee renvoie status: true en cas de succès, ou status: false avec message d'erreur
        if (data.status) {
            console.log("--- [PAYMEE SUCCESS] ---");
            res.status(200).json({
                success: true,
                payment_url: data.data.payment_url,
                token: data.data.token
            });
        } else {
            console.error("--- [PAYMEE ERROR API] ---", data);
            
            // Gestion spécifique des erreurs de validation (ex: URL invalide)
            let errorMsg = data.message || "Paiement refusé par Paymee.";
            if (data.errors && Array.isArray(data.errors)) {
                const details = data.errors.map(e => Object.values(e).join(', ')).join(' | ');
                errorMsg += ` (${details})`;
            }

            res.status(400).json({ 
                message: errorMsg, 
                details: data
            });
        }

    } catch (error) {
        console.error("--- [PAYMEE NETWORK ERROR] ---", error);
        res.status(500).json({ message: "Erreur de connexion au service de paiement.", error: error.message });
    }
});

exports.handleWebhook = catchAsync(async (req, res) => {
    const { payment_status, order_id } = req.body;
    console.log(`[WEBHOOK PAYMEE] Commande ${order_id} - Statut: ${payment_status}`);
    // TODO: Mettre à jour le statut de la commande en base de données si nécessaire
    res.status(200).send('OK');
});
