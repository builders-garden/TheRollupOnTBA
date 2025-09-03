export * from "./client-to-server.type";
export * from "./server-to-client.type";

export type EventCallback<T> = (data: T) => void;
