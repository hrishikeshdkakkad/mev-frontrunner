import React, { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import VerticalTabs, { DataItem } from "./Tabs";
import Button from "@mui/material/Button";
declare global {
  interface Window {
    ethereum?: any;
  }
}

interface EventDataType {
  id: number;
  message: string;
}

const useEthereum = () => {
  const [currentAccount, setCurrentAccount] = useState(null);

  const checkWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have Metamask installed!");
      return;
    } else {
      console.log("Wallet exists! We're ready to go!");
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account: ", account);
      setCurrentAccount(account);
    } else {
      console.log("No authorized account found");
    }
  };

  const connectWalletHandler = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      alert("Please install Metamask!");
    }

    try {
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Found an account! Address: ", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    checkWalletIsConnected();
  }, []);

  return { currentAccount, connectWalletHandler };
};



const SocketEvents: React.FC = () => {
  const { currentAccount, connectWalletHandler } = useEthereum();
  const connectWalletButton = () => {
    return (
      <Button sx={{ marginBottom: 5 }} onClick={connectWalletHandler}>
        Connect Wallet
      </Button>
    );
  };

  return (
    <div>
      <h2>Received Events:</h2>
      <div className="container">
        <div style={{ marginBottom: "200" }}>
          <div>{currentAccount ? null : connectWalletButton()}</div>
        </div>
        <div className="left-div">
          <VerticalTabs />
        </div>
      </div>
    </div>
  );
};

export default SocketEvents;
