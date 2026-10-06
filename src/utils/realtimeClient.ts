import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

/**
 * Initializes and manages a singleton Socket.IO connection for real-time synchronization
 */
export function getRealtimeSocket(): Socket | null {
  if (typeof window === 'undefined') return null;

  if (!socket) {
    try {
      socket = io({
        path: '/socket.io',
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 10,
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
      });

      socket.on('site_visibility_changed', (vis) => {
        try {
          if (vis && typeof vis === 'object') {
            localStorage.setItem('multishop_site_visibility', JSON.stringify(vis));
          }
        } catch {}
        window.dispatchEvent(new CustomEvent('site-visibility-changed', { detail: vis }));
      });

      ['nutrition', 'youpi'].forEach((shopKey) => {
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
