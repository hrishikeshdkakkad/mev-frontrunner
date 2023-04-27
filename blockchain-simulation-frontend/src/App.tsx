import React, { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import VerticalTabs from "./Tabs";
import Button from "@mui/material/Button";
import { useAccount, useConnect, Chain } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";

interface EventDataType {
  id: number;
  message: string;
}


const SocketEvents: React.FC = () => {
  const { connect } = useConnect({
    connector: new InjectedConnector(),
    chainId: 1,
  });
  const { address } = useAccount();

  return (
    <div>
      <div style={{ position: "absolute", top: 0, right: 10, marginBottom: '50' }}>
          <div>
            {address ? (
              <p>{address}</p>
            ) : (
              <Button onClick={() => connect()}>Connect wallet</Button>
            )}
          </div>
        </div>
      <h2>Received Events:</h2>
      <div>
        <div className="left-div">
          <VerticalTabs />
        </div>
      </div>
    </div>
  );
};

export default SocketEvents;
