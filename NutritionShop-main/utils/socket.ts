
import { io } from 'socket.io-client';

// Laisse vide pour utiliser le proxy défini dans vite.config.ts
// Cela redirigera automatiquement vers localhost:3000/socket.io -> localhost:8080/socket.io
const URL = ''; 

export const socket = io(URL, {
    path: '/socket.io',
    autoConnect: false,
    withCredentials: true,
    transports: ['polling', 'websocket'], // Essaye polling d'abord (plus compatible), puis upgrade en websocket
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
});
