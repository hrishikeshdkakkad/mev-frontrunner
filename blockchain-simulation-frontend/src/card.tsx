import * as React from "react";
import { styled } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Collapse from "@mui/material/Collapse";
import Avatar from "@mui/material/Avatar";
import IconButton, { IconButtonProps } from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { green, red } from "@mui/material/colors";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Button } from "@mui/material";
import { DataItem } from "./Tabs";
import {
  useAccount,
  useBalance,
  useProvider,
  useSigner,
  useWaitForTransaction,
} from "wagmi";
import useSwap from "./hooks/useSwap";

const tokenMappings: any = {
  "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2": "ETH",
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": "USDC",
};

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}

interface CardProps {
  dataItem: DataItem;
  swap: boolean;
  txType: number;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
  marginLeft: "auto",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));

const UNI_ADDRESS = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984";

export default function CardComponent({ dataItem, swap, txType }: CardProps) {
  const [expanded, setExpanded] = React.useState(false);
  const [txHash, setTxHash] = React.useState("");
  const { status, error, data } = useWaitForTransaction();
  const provider = useProvider();
  const { data: signer } = useSigner()

  const { address } = useAccount();
  const { data: ETHBalance } = useBalance({
    address,
    watch: true,
  });
  const { data: UNIBalance } = useBalance({
    address,
    token: UNI_ADDRESS,
    watch: true,
  });

  const { swap: uniswap } = useSwap();

  const onClickSwapButton = async () => {
    const amount = dataItem.originalNoInterferenceTransaction.amountIn.hex;
    console.log(Number(amount)/Math.pow(10,18), "amount");
    const txn = await uniswap(11);
    setTxHash(txn.hash);
    await txn.wait();
  };

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <>
      {console.log(status, "ssssss")}
      {status === "loading" && (
        <Typography variant="body2" color="text.secondary">
          Transaction pending...
        </Typography>
      )}
      {status === "success" && (
        <Typography variant="body2" color="text.secondary">
          Transaction successful!
        </Typography>
      )}
      {status === "error" && (
        <Typography variant="body2" color="error">
          Transaction failed: {error!.message}
        </Typography>
      )}
      <Card sx={{ maxWidth: 345 }}>
        <CardHeader
          avatar={
            dataItem.frontrunnable ? (
              <Avatar sx={{ bgcolor: red[500] }}>!!!</Avatar>
            ) : (
              <Avatar sx={{ bgcolor: green[500] }}>OK</Avatar>
            )
          }
          action={
            <IconButton aria-label="settings">
              <MoreVertIcon />
            </IconButton>
          }
          title={dataItem.frontrunnable ? "Frontrunnable" : "Not frontrunnable"}
          subheader={
            txType === 2
              ? `Original Expected Output: ${dataItem.originalExpectedOutput}`
              : txType === 1
              ? `FR interference o/p: ${dataItem.originalTransactionwithInterferenceOutput}`
              : txType === 3
              ? `Backrun Output: To be added`
              : null
          }
        />
        <CardContent>
          {txType === 2 ? (
            <Typography variant="body2" color="text.secondary">
              Token In:{" "}
              {
                tokenMappings[
                  dataItem.originalNoInterferenceTransaction.tokenIn
                ]
              }{" "}
              <br />
              Token Out:{" "}
              {
                tokenMappings[
                  dataItem.originalNoInterferenceTransaction.tokenOut
                ]
              }{" "}
              <br />
              {/* Amount In:{" "}
            {dataItem.originalNoInterferenceTransaction.amountIn.hex
              ? web3.utils
                  .toBN(dataItem.originalNoInterferenceTransaction.amountIn.hex)
                  .toNumber()
              : null} */}
            </Typography>
          ) : txType === 1 ? (
            <Typography variant="body2" color="text.secondary">
              {/* Frontrun Tx: {dataItem.originalTransactionwithInterference} */}
            </Typography>
          ) : txType === 3 ? (
            <Typography variant="body2" color="text.secondary">
              Backrun Tx: To be added
            </Typography>
          ) : null}
        </CardContent>
        <CardActions disableSpacing>
          <ExpandMore
            expand={expanded}
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label="show more"
          >
            <ExpandMoreIcon />
          </ExpandMore>
        </CardActions>
        {swap ? (
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <CardContent>
              <Button
                disabled={address ? false : true}
                onClick={onClickSwapButton}
                fullWidth
              >
                SWAP
              </Button>
            </CardContent>
          </Collapse>
        ) : null}
      </Card>
    </>
  );
}
