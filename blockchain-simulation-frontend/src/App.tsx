import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'ws://localhost:3070'; // Replace with your server URL

interface EventDataType {
  // Define the structure of your event data here
  // For example:
  id: number;
  message: string;
}

const SocketEvents: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [events, setEvents] = useState<EventDataType[]>([]);

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('decoded', (eventData: EventDataType) => {
      console.log("In here deccc")
      setEvents((prevEvents) => [...prevEvents, eventData]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <div>
      <h2>Received Events:</h2>
      <ul>
        {events.map((event, index) => (
          <li key={index}>{JSON.stringify(event)}</li>
        ))}
      </ul>
    </div>
  );
};

export default SocketEvents;
