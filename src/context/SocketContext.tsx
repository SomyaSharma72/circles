import React, { createContext, useContext, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { getSocket } from '../services/socket';

interface SocketContextType {
  socket: Socket;
  isConnected: boolean;
  isReconnecting: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const socket = getSocket();
  const [isConnected, setIsConnected] = useState<boolean>(socket.connected);
  const [isReconnecting, setIsReconnecting] = useState<boolean>(false);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
      setIsReconnecting(false);
    }

    function onDisconnect() {
      setIsConnected(false);
      setIsReconnecting(true);
    }

    function onReconnectAttempt() {
      setIsReconnecting(true);
    }

    function onReconnect() {
      setIsConnected(true);
      setIsReconnecting(false);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.io.on('reconnect_attempt', onReconnectAttempt);
    socket.io.on('reconnect', onReconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.io.off('reconnect_attempt', onReconnectAttempt);
      socket.io.off('reconnect', onReconnect);
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, isReconnecting }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
};
