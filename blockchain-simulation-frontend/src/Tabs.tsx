import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { Socket, io } from "socket.io-client";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import HorizontalTabs from "./horizontalTabs";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `vertical-tab-${index}`,
    "aria-controls": `vertical-tabpanel-${index}`,
  };
}

export interface DataItem {
  originalNoInterferenceTransaction: {
    tokenIn: string;
    tokenOut: string;
    fee: string;
    amountIn: { hex: string; _isBigNumber: true };
    sqrtPriceLimitX96: string;
  };
  originalExpectedOutput: number;
  originalNoInterferenceTransactionOutput: number;
  originalSlippage: number;
  frontrun: {
    tokenIn: string;
    tokenOut: string;
    fee: string;
    amountIn: { _hex: string; _isBigNumber: true };
    sqrtPriceLimitX96: string;
  };
  originalTransactionwithInterferenceOutput: number;
  MEV: number;
  frontrunnable: boolean;
  PriceImact: number;
  txn: {
    hash: string;
    type: number;
    accessList: [];
    blockHash: string;
    blockNumber: number;
    transactionIndex: number;
    confirmations: number;
    from: string;
    gasPrice: { _hex: string; _isBigNumber: true };
    maxPriorityFeePerGas: { _hex: string; _isBigNumber: true };
    maxFeePerGas: { _hex: string; _isBigNumber: true };
    gasLimit: { _hex: string; _isBigNumber: true };
    to: string;
    value: { _hex: string; _isBigNumber: true };
    nonce: number;
    data: string;
    r: string;
    s: string;
    v: number;
    creates: null;
    chainId: number;
  };
}

const SOCKET_URL = "ws://localhost:3070"; // Replace with your server URL

const useSocket = () => {
  const [socket, setSocket] = React.useState<Socket | null>(null);
  const [events, setEvents] = React.useState<DataItem>();

  React.useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on("decoded", (eventData: DataItem) => {
      setEvents(eventData);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return { socket, events };
};

export default function VerticalTabs() {
  const [value, setValue] = React.useState(0);
  const [tabData, setTabData] = React.useState<DataItem[]>([]);
  const { socket, events } = useSocket();

  React.useEffect(() => {
    if (events) {
      setTabData((prevData) => [...prevData, events]);
    }
  }, [events]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  function createData(
    name: string,
    calories: number,
    fat: number,
    carbs: number,
    protein: number
  ) {
    return { name, calories, fat, carbs, protein };
  }

  return (
    <Box
      sx={{
        flexGrow: 1,
        bgcolor: "background.paper",
        display: "flex",
        height: 850,
      }}
    >
      <Tabs
        orientation="vertical"
        variant="scrollable"
        value={value}
        onChange={handleChange}
        aria-label="Vertical tabs example"
        sx={{ borderRight: 1, borderColor: "divider" }}
      >
        {tabData.length === 0 ? (
          <Tab label="Empty" disabled />
        ) : (
          tabData.map((_data, index) => (
            <Tab
              key={index}
              label={_data.txn.hash ? _data.txn.hash.slice(0, 15) : "Empty"}
              {...a11yProps(index)}
            />
          ))
        )}
      </Tabs>
      {tabData.length === 0 ? (
        <TabPanel value={value} index={0}>
          <Typography>No data available</Typography>
        </TabPanel>
      ) : (
        tabData.map((dataItem, index) => (
          <>
            <TabPanel key={index} value={value} index={index}>
              {/* <Typography>Final Amount: {dataItem.originalExpectedOutput}</Typography>
            <Typography>Amount Output: {dataItem.originalNoInterferenceTransaction.tokenIn}</Typography>
            <Typography>Amount Input: {dataItem.originalSlippage}</Typography>
            <Typography>Slippage: {dataItem.frontrunnable}</Typography> */}
              <HorizontalTabs dataItem={dataItem} />
            </TabPanel>
          </>
        ))
      )}
    </Box>
  );
}
