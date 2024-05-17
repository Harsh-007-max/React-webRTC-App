import React, { useEffect, useCallback, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import ReactPlayer from "react-player";
import peer from "../service/peer";
const RoomPage = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();

  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`Email ${email} joined room`);
    setRemoteSocketId(id);
  }, []);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
    setMyStream(stream);
  }, [remoteSocketId, socket]);

  const handleIncommingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      console.log(`Incomming Call`, from, offer);
      const answer = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, answer });
    },
    [socket],
  );

  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    ({ from, answer }) => {
      peer.setLocalDescription(answer);
      console.log("Call Accepted!");
      sendStreams();
    },
    [sendStreams],
  );
  const handleNegotiation = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  const handleNegotiationIncomming = useCallback(
    async ({ from, offer }) => {
      const answer = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, answer });
    },
    [socket],
  );

  const handleNegotiationFinal = useCallback(async ({ from, answer }) => {
    await peer.setLocalDescription(answer);
  }, []);
  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegotiation);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegotiation);
    };
  }, [handleNegotiation]);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegotiationIncomming);
    socket.on("peer:nego:final", handleNegotiationFinal);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegotiationIncomming);
      socket.off("peer:nego:final", handleNegotiationFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncommingCall,
    handleCallAccepted,
    handleNegotiationIncomming,
    handleNegotiationFinal,
  ]);

  return (
    <div className="container justify-content-center">
      <div className="row">
        <h1 className="col-4">Room Page</h1>
      </div>
      <div className="row ">
        <h4 className="col-4 ">
          {remoteSocketId ? "Connected" : "No one in room"}
        </h4>
      </div>
      {myStream && (
        <div>
          <button onClick={sendStreams} className="btn btn-primary  col-2 m-3">
            Send Stream
          </button>
        </div>
      )}
      <div className="row ">
        {remoteSocketId && (
          <button
            onClick={handleCallUser}
            className="btn btn-primary col-2 m-3"
          >
            CALL
          </button>
        )}
      </div>
      {myStream && (
        <>
          <h2>My Stream</h2>
          <div className="row">
            <ReactPlayer
              url={myStream}
              height="300px"
              width="500px"
              playing
              muted
            />
          </div>
        </>
      )}
      {remoteStream && (
        <>
          <h2>Remote Stream</h2>
          <div className="row">
            <ReactPlayer
              url={remoteStream}
              height="300px"
              width="500px"
              playing
              muted
            />
          </div>
        </>
      )}
    </div>
  );
};
export default RoomPage;
