import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { Socket, io } from "socket.io-client";

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
  finalAmount: number;
  amountOutput: number;
  amountInput: number;
  slippage: number;
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

  return (
    <Box
      sx={{
        flexGrow: 1,
        bgcolor: "background.paper",
        display: "flex",
        height: 500,
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
        {tabData.map((_data, index) => (
          <Tab key={index} label={`Data ${index + 1}`} {...a11yProps(index)} />
        ))}
      </Tabs>
      {tabData.map((dataItem, index) => (
        <TabPanel key={index} value={value} index={index}>
          <Typography>Final Amount: {dataItem.finalAmount}</Typography>
          <Typography>Amount Output: {dataItem.amountOutput}</Typography>
          <Typography>Amount Input: {dataItem.amountInput}</Typography>
          <Typography>Slippage: {dataItem.slippage}</Typography>
        </TabPanel>
      ))}
    </Box>
  );
}
