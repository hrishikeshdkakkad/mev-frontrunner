/* eslint-disable @typescript-eslint/no-unused-vars */
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
import {
  useAccount,
  useBalance,
  useProvider,
  useSigner,
  useWaitForTransaction,
} from "wagmi";
import useSwap from "../hooks/useSwap";
import { DataItem } from "../interfaces/IDataItem";

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
  const [expanded, setExpanded] = React.useState(true);
  const [txHash, setTxHash] = React.useState("");
  const { status, error, data } = useWaitForTransaction();
  const provider = useProvider();
  const { data: signer } = useSigner();

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
    console.log(Number(amount) / Math.pow(10, 18), "amount");
    const txn = await uniswap(20);
    setTxHash(txn.hash);
    await txn.wait();
  };

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <>
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
          title={dataItem.frontrunnable ? "Frontrunnable" : "Not Frontrunnable"}
          subheader={
            txType === 2
              ? `Original Receivable: $${dataItem.originalNoInterferenceTransactionOutput.toFixed(
                  3
                )}`
              : txType === 1
              ? `Price Impact: ${dataItem.PriceImact.toFixed(3)} %`
              : txType === 3
              ? `Backrun Output: To be added`
              : null
          }
        />
        <CardContent>
          {txType === 2 ? (
            <Typography variant="body2" color="text.secondary">
              Token In: {dataItem.tokenIn} <br />
              Token Out: {dataItem.tokenOut} <br />
              Amount In:{" "}
              {Number(dataItem.originalNoInterferenceTransaction.amountIn.hex) /
                Math.pow(10, dataItem.decimalsIn)}{" "}
              <br />
              Original Expected Output : $
              {dataItem.originalExpectedOutput.toFixed(3)}
              <br />
              Output After Interference: $
              {dataItem.originalTransactionwithInterferenceOutput.toFixed(
                3
              )}{" "}
              <br />
              Original Slippage: {dataItem.originalSlippage.toFixed(3)}%{" "}
            </Typography>
          ) : txType === 1 ? (
            <Typography variant="body2" color="text.secondary">
              Token In: {dataItem.frontrun.inputCurrency} <br />
              Token Out: {dataItem.frontrun.outputCurrency} <br />
              Amount In:{" "}
              {(Number(
                dataItem.originalNoInterferenceTransaction.amountIn.hex
              ) *
                dataItem.frontrunInput) /
                Math.pow(10, dataItem.decimalsIn)}{" "}
              <br />
              Actual Output : ${dataItem.frontrunOutput.toFixed(3)}
              <br />
            </Typography>
          ) : txType === 3 ? (
            <Typography variant="body2" color="text.secondary">
              Backrun Tx: To be added
            </Typography>
          ) : null}
        </CardContent>
        {swap ? (
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
        ) : null}
        {swap ? (
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <CardContent>
              <Button
                defaultChecked={true}
                disabled={address ? false : true}
                onClick={onClickSwapButton}
                fullWidth
              >
                SWAP
              </Button>
              {txHash}
            </CardContent>
          </Collapse>
        ) : null}
      </Card>
    </>
  );
}
