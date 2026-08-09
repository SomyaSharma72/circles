import { Server as SocketIOServer, Socket } from 'socket.io';

let ioInstance: SocketIOServer | null = null;

export function getGeoCellKey(lat: number, lng: number): string {
  const roundedLat = (Math.round(lat * 100) / 100).toFixed(2);
  const roundedLng = (Math.round(lng * 100) / 100).toFixed(2);
  return `geo:${roundedLat}:${roundedLng}`;
}

export const initSocket = (server: any, corsOrigin: string) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: corsOrigin || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  ioInstance = io;

  io.on('connection', (socket: Socket) => {
    console.log(`⚡ Socket client connected: ${socket.id}`);

    // Join user-specific room for targeted notifications
    socket.on('user:join', (userId: string) => {
      if (userId) {
        socket.join(`user:${userId}`);
        console.log(`Socket ${socket.id} joined user room: user:${userId}`);
      }
    });

    // Handle joinRoom event (both object and string)
    socket.on('joinRoom', (payload: any) => {
      const reqId = typeof payload === 'object' ? payload?.requestId : payload;
      if (reqId) {
        socket.join(`request:${reqId}`);
        console.log(`Socket ${socket.id} joined room: request:${reqId}`);
      }
    });

    socket.on('leaveRoom', (payload: any) => {
      const reqId = typeof payload === 'object' ? payload?.requestId : payload;
      if (reqId) {
        socket.leave(`request:${reqId}`);
      }
    });

    // Join specific request chat/updates room
    socket.on('request:join', (payload: any) => {
      const reqId = typeof payload === 'object' ? payload?.requestId : payload;
      if (reqId) {
        socket.join(`request:${reqId}`);
        console.log(`Socket ${socket.id} joined request room: request:${reqId}`);
      }
    });

    socket.on('request:leave', (payload: any) => {
      const reqId = typeof payload === 'object' ? payload?.requestId : payload;
      if (reqId) {
        socket.leave(`request:${reqId}`);
      }
    });

    // Area Scan Room Join
    socket.on('area_scan:join', ({ lat, lng }: { lat: number; lng: number }) => {
      if (typeof lat === 'number' && typeof lng === 'number') {
        const geoKey = getGeoCellKey(lat, lng);
        socket.join(geoKey);
        console.log(`Socket ${socket.id} joined geo scan room: ${geoKey}`);
      }
    });

    socket.on('area_scan:leave', ({ lat, lng }: { lat: number; lng: number }) => {
      if (typeof lat === 'number' && typeof lng === 'number') {
        const geoKey = getGeoCellKey(lat, lng);
        socket.leave(geoKey);
      }
    });

    socket.on('disconnect', () => {
      console.log(`⚡ Socket client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): SocketIOServer => {
  if (!ioInstance) {
    throw new Error('Socket.io instance has not been initialized');
  }
  return ioInstance;
};
