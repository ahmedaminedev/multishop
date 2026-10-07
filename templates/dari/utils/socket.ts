import { io } from 'socket.io-client';

const URL = ''; 

export const socket = io(URL, {
  path: '/socket.io',
  autoConnect: false,
  withCredentials: true,
  transports: ['polling', 'websocket'],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});
