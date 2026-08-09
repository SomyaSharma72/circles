import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const socketUrl = import.meta.env.VITE_API_URL || window.location.origin;
    socket = io(socketUrl, {
      autoConnect: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });
  }
  return socket;
};

export const joinUserRoom = (userId: string) => {
  const s = getSocket();
  if (s.connected) {
    s.emit('user:join', userId);
  } else {
    s.once('connect', () => {
      s.emit('user:join', userId);
    });
  }
};

export const joinRequestRoom = (requestId: string) => {
  const s = getSocket();
  if (s.connected) {
    s.emit('request:join', requestId);
  } else {
    s.once('connect', () => {
      s.emit('request:join', requestId);
    });
  }
};

export const leaveRequestRoom = (requestId: string) => {
  const s = getSocket();
  s.emit('request:leave', requestId);
};

export const joinAreaScanRoom = (lat: number, lng: number) => {
  const s = getSocket();
  if (s.connected) {
    s.emit('area_scan:join', { lat, lng });
  } else {
    s.once('connect', () => {
      s.emit('area_scan:join', { lat, lng });
    });
  }
};

export const leaveAreaScanRoom = (lat: number, lng: number) => {
  const s = getSocket();
  s.emit('area_scan:leave', { lat, lng });
};
