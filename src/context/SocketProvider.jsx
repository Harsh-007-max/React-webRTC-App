import React, { createContext, useMemo, useContext } from "react";
import { io } from "socket.io-client";
const SocketContext = createContext(null);
export const useSocket = () => {
  const socket = useContext(SocketContext);
  return socket;
};
export const SocketProvider = (props) => {
  const socket = useMemo(
    // () => io("https://node-socket-server-nine.vercel.app"),
    // () => io("localhost:8000"),
    () => io("https://fluffy-telegram-44g5ggx555g2qjjp-8000.app.github.dev"),
    [],
  );
  return (
    <SocketContext.Provider value={socket}>
      {props.children}
    </SocketContext.Provider>
  );
};
