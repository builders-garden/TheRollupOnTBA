"use client";

import React, { createContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import {
  ClientToServerEvents,
  ServerToClientEvents,
  type EventCallback,
} from "@/lib/types/socket/index";
import { env } from "@/lib/zod";

export type SocketContextType = {
  socket: React.RefObject<Socket<
    ServerToClientEvents,
    ClientToServerEvents
  > | null>;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  emit: <T extends keyof ClientToServerEvents>(
    key: T,
    data: ClientToServerEvents[T],
  ) => void;
  subscribe: <T extends keyof ServerToClientEvents>(
    event: T,
    callback: EventCallback<ServerToClientEvents[T]>,
  ) => void;
  unsubscribe: <T extends keyof ServerToClientEvents>(
    event: T,
    callback: EventCallback<ServerToClientEvents[T]>,
  ) => void;
};

export const SocketContext = createContext<SocketContextType>({
  socket: { current: null },
  isConnected: false,
  connect: () => {},
  disconnect: () => {},
  emit: () => {},
  subscribe: () => {},
  unsubscribe: () => {},
});

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const socket = useRef<Socket<
    ServerToClientEvents,
    ClientToServerEvents
  > | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  // Registry for event listeners with proper typing
  const listeners = useRef<{
    [K in keyof ServerToClientEvents]?: Array<
      EventCallback<ServerToClientEvents[K]>
    >;
  }>({});

  const subscribe = <T extends keyof ServerToClientEvents>(
    event: T,
    callback: EventCallback<ServerToClientEvents[T]>,
  ) => {
    // Create an array for the event if it does not yet exist
    if (!listeners.current[event]) {
      listeners.current[event] = [] as any;
    }

    (listeners.current[event] as any).push(callback);

    // If socket is connected, ensure we have a listener attached
    if (socket.current && socket.current.connected) {
      // Remove any existing listeners for this event
      socket.current.off(event as any);
      // Add a single listener that will handle all callbacks
      socket.current.on(event as any, (data: any) => {
        handleEvent(event as any, data);
      });
    }
  };

  const unsubscribe = <T extends keyof ServerToClientEvents>(
    event: T,
    callback: EventCallback<ServerToClientEvents[T]>,
  ) => {
    if (!listeners.current[event]) return;

    listeners.current[event] = (listeners.current[event] as any).filter(
      (cb: any) => cb !== callback,
    );

    // If no more callbacks remain for this event, detach the socket listener
    if (
      socket.current &&
      listeners.current[event] &&
      (listeners.current[event] as any).length === 0
    ) {
      socket.current.off(event as any);
      delete listeners.current[event];
    }
  };

  const handleEvent = <T extends keyof ServerToClientEvents>(
    event: T,
    data: ServerToClientEvents[T],
  ) => {
    if (listeners.current[event]) {
      (
        listeners.current[event] as Array<
          EventCallback<ServerToClientEvents[T]>
        >
      ).forEach((cb) => cb(data));
    }
  };

  const connect = () => {
    if (!socket.current) {
      socket.current = io(
        env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001",
        {
          autoConnect: true,
          reconnection: true,
          reconnectionDelay: 1000,
          withCredentials: true,
          transports: ["websocket", "polling"],
        },
      );

      socket.current.on("connect", () => {
        console.log("Socket connected");
        setIsConnected(true);
      });

      socket.current.on("disconnect", () => {
        console.log("Socket disconnected");
        setIsConnected(false);
      });

      // Attach listeners for events that were subscribed before socket connection
      (
        Object.keys(listeners.current) as Array<keyof ServerToClientEvents>
      ).forEach((event) => {
        // Remove any existing listeners and add a single new one
        socket.current!.off(event);
        socket.current!.on(event, ((
          data: ServerToClientEvents[typeof event],
        ) => {
          console.log("[SOCKET EVENT]", event, data);
          handleEvent(event, data);
        }) as any);
      });
    }
  };

  const disconnect = () => {
    if (socket.current) {
      socket.current.disconnect();
      socket.current = null;
    }
  };

  const emit = <T extends keyof ClientToServerEvents>(
    key: T,
    data: ClientToServerEvents[T],
  ) => {
    if (socket.current && socket.current.connected) {
      (socket.current as any).emit(key, data);
      console.log(`Sent message: ${key}`, data);
    } else {
      console.warn(
        `Socket not connected. Cannot send message: ${key}. Socket will reconnect automatically.`,
        data,
      );
    }
  };

  useEffect(() => {
    console.log("Connecting socket");
    connect();

    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        connect,
        disconnect,
        emit,
        subscribe,
        unsubscribe,
      }}>
      {children}
    </SocketContext.Provider>
  );
};
