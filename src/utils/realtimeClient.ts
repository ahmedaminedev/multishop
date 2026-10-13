import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

/**
 * Initializes and manages a singleton Socket.IO connection for real-time synchronization across MultiShop
 */
export function getRealtimeSocket(): Socket | null {
  if (typeof window === 'undefined') return null;

  if (!socket) {
    try {
      socket = io({
        path: '/socket.io',
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 15,
        reconnectionDelay: 1000
      });

      socket.on('connect', () => {
        socket?.emit('admin_join');
      });

      socket.on('stats_updated', (stats) => {
        window.dispatchEvent(new CustomEvent('stats_updated', { detail: stats }));
      });

      socket.on('multishop_data_changed', (data) => {
        window.dispatchEvent(new CustomEvent('multishop_data_changed', { detail: data }));
        window.dispatchEvent(new CustomEvent('multishop-data-changed', { detail: data }));
      });

      socket.on('orders_updated', (data) => {
        window.dispatchEvent(new CustomEvent('orders_updated', { detail: data }));
        window.dispatchEvent(new CustomEvent('multishop_data_changed', { detail: data }));
      });

      socket.on('products_updated', (data) => {
        window.dispatchEvent(new CustomEvent('products_updated', { detail: data }));
        window.dispatchEvent(new CustomEvent('multishop_data_changed', { detail: data }));
      });

      socket.on('stock_updated', (data) => {
        window.dispatchEvent(new CustomEvent('stock_updated', { detail: data }));
        window.dispatchEvent(new CustomEvent('multishop_data_changed', { detail: data }));
      });

      socket.on('site_visibility_changed', (vis) => {
        try {
          if (vis && typeof vis === 'object') {
            localStorage.setItem('multishop_site_visibility', JSON.stringify(vis));
          }
        } catch {}
        window.dispatchEvent(new CustomEvent('site-visibility-changed', { detail: vis }));
      });

      // Synchronize stats for ALL 3 filiales: nutrition, youpi, AND dari
      ['nutrition', 'youpi', 'dari'].forEach((shopKey) => {
        socket?.on(`shop_stats_updated_${shopKey}`, (shopStats) => {
          window.dispatchEvent(new CustomEvent('shop_stats_updated', { detail: { shopKey, stats: shopStats } }));
        });
      });
    } catch (err) {
      console.warn('Realtime socket initialization warning:', err);
    }
  }

  return socket;
}

/**
 * Request instant recalculation and broadcast of stats from server
 */
export function requestRealtimeStatsRefresh() {
  const s = getRealtimeSocket();
  if (s && s.connected) {
    s.emit('request_global_stats');
  }
}

/**
 * Broadcast local change immediately across current tab and notify backend
 */
export function broadcastLocalChange(actionType: string, shopKey: string = 'all') {
  const detail = { type: actionType, shopKey, timestamp: Date.now() };
  window.dispatchEvent(new CustomEvent('multishop_data_changed', { detail }));
  window.dispatchEvent(new CustomEvent('multishop-data-changed', { detail }));
  const s = getRealtimeSocket();
  if (s && s.connected) {
    s.emit('request_global_stats');
  }
}
