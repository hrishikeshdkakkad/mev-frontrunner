import * as React from "react";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import BasicTable from "./table";
import Card from "./card";
import CardComponent from "./card";
import { Typography } from "@mui/material";
import { DataItem } from "../interfaces/IDataItem";

interface HorizontalTabsProps {
  dataItem: DataItem;
}

export default function HorizontalTabs({ dataItem }: HorizontalTabsProps) {
  const [value, setValue] = React.useState("1");

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: "100%", typography: "body1" }}>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <>
            <Typography variant="caption" color="HighlightText" style={{ textAlign: 'center', paddingLeft: '20' }}>
              <b>MEV</b>: {dataItem.MEV}
            </Typography>
          </>
          <TabList onChange={handleChange} aria-label="lab API tabs example">
            <Tab label="Frontrun Tx" value="1" />
            <Tab label="Original Tx" value="2" />
            <Tab label="Backrun Tx" value="3" />
          </TabList>
        </Box>
        <TabPanel value="1">
          <CardComponent dataItem={dataItem} swap={false} txType={1} />
        </TabPanel>
        <TabPanel value="2">
          <CardComponent dataItem={dataItem} swap={true} txType={2} />
        </TabPanel>
        <TabPanel value="3">
          <CardComponent dataItem={dataItem} swap={false} txType={3} />
        </TabPanel>
      </TabContext>
    </Box>
  );
}
