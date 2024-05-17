import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketProvider";
const LobbyScreen = () => {
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");

  const socket = useSocket();
  const navigate = useNavigate();

  const handleSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      socket.emit("room:join", { email, room });
    },
    [email, room, socket],
  );

  const handleJoinRoom = useCallback(
    (data) => {
      const { email, room } = data;
      navigate(`/room/${room}`);
    },
    [navigate],
  );

  useEffect(() => {
    socket.on("room:join", handleJoinRoom);
    return () => {
      socket.off("room:join", handleJoinRoom);
    };
  }, [socket, handleJoinRoom]);

  return (
    <div className="container">
      <div className="row">
        <h1 className="col">Lobby</h1>
      </div>
      <form onSubmit={handleSubmitForm}>
        <div className="row">
          <label className="mt-2 col-2" htmlFor="email">
            Email ID :
          </label>
          <input
            type="email"
            placeholder="Enter Email ID"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-control mt-2 col"
          />
        </div>
        <div className="row">
          <label className="mt-2 col-2" htmlFor="room">
            Room ID :
          </label>
          <input
            type="text"
            placeholder="Enter Room ID"
            id="room"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            className="form-control mt-2 col"
          />
        </div>
        <div className="row justify-content-center">
          <button className="btn btn-primary col-2 mt-2">Join</button>
        </div>
      </form>
    </div>
  );
};
export default LobbyScreen;
