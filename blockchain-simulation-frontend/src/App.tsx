import React from "react";
import VerticalTabs from "./components/verticalTabs";
import Button from "@mui/material/Button";
import { useAccount, useConnect } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";

const SocketEvents: React.FC = () => {
  const { connect } = useConnect({
    connector: new InjectedConnector(),
    chainId: 1,
  });
  const { address } = useAccount();

  return (
    <div>
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          padding: "5px",
          marginBottom: "50",
          backgroundColor: "ButtonShadow",
          borderRadius: "10px",
        }}
      >
        <div>
          {address ? (
            <p>{address}</p>
          ) : (
            <Button style={{ marginTop: "10" }} onClick={() => connect()}>
              Connect wallet
            </Button>
          )}
        </div>
      </div>
      <div>
        <div className="left-div">
          <VerticalTabs />
        </div>
      </div>
    </div>
  );
};

export default SocketEvents;
