"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var ethers_1 = require("ethers");
var abi = require("./abi.json");
var axios_1 = require("axios");
var v3_sdk_1 = require("@uniswap/v3-sdk");
// import { JSBI } from 'jsbi';
var jsbi_1 = require("jsbi");
var wssUrl = "ws://127.0.0.1:8545/";
var router = "0xEf1c6E67703c7BD7107eed8303Fbe6EC2554BF6B";
var interfaceI = new ethers_1.ethers.utils.Interface(abi);
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var provider, test;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    provider = new ethers_1.ethers.providers.WebSocketProvider(wssUrl);
                    return [4 /*yield*/, provider.send("eth_pendingTransactions")];
                case 1:
                    test = _a.sent();
                    provider.on("pending", function (tx) { return __awaiter(_this, void 0, void 0, function () {
                        var txnData, decoded, res, decodedResult, error_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    console.log(tx, "tx");
                                    return [4 /*yield*/, provider.getTransaction(tx)];
                                case 1:
                                    txnData = _a.sent();
                                    if (!(txnData && txnData.to)) return [3 /*break*/, 5];
                                    decoded = interfaceI.decodeFunctionData("execute(bytes calldata commands, bytes[] calldata inputs, uint256 deadline)", txnData.data);
                                    console.log(decoded, "td");
                                    _a.label = 2;
                                case 2:
                                    _a.trys.push([2, 4, , 5]);
                                    return [4 /*yield*/, axios_1["default"].post("http://localhost:30000", txnData)];
                                case 3:
                                    res = _a.sent();
                                    decodedResult = decoder(res.data);
                                    return [3 /*break*/, 5];
                                case 4:
                                    error_1 = _a.sent();
                                    console.log(error_1, "error");
                                    return [3 /*break*/, 5];
                                case 5: return [2 /*return*/];
                            }
                        });
                    }); });
                    return [2 /*return*/];
            }
        });
    });
}
function logTxn(data) {
    return __awaiter(this, void 0, void 0, function () {
        var response, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Posting to Webhook: ", data.hash);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, axios_1["default"].post("https://eoi339avn311ljh.m.pipedream.net", data)];
                case 2:
                    response = _a.sent();
                    console.log(response.status, "status");
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    console.log(error_2, "error");
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function priceFromTick(baseToken, quoteToken, inputAmount, currentTick, baseTokenDecimals, quoteTokenDecimals) {
    return __awaiter(this, void 0, void 0, function () {
        var sqrtRationX96, ratioX192, baseAmount, shift, quoteAmount, finalAmount;
        return __generator(this, function (_a) {
            sqrtRationX96 = v3_sdk_1.TickMath.getSqrtRatioAtTick(currentTick);
            ratioX192 = jsbi_1["default"].multiply(sqrtRationX96, sqrtRationX96);
            baseAmount = jsbi_1["default"].BigInt(inputAmount * (Math.pow(10, baseTokenDecimals)));
            shift = jsbi_1["default"].leftShift(jsbi_1["default"].BigInt(1), jsbi_1["default"].BigInt(192));
            quoteAmount = v3_sdk_1.FullMath.mulDivRoundingUp(ratioX192, baseAmount, shift);
            finalAmount = Number(quoteAmount.toString()) / (Math.pow(10, quoteTokenDecimals));
            console.log(finalAmount);
            return [2 /*return*/, finalAmount];
        });
    });
}
function decoder(input) {
    return __awaiter(this, void 0, void 0, function () {
        var finalAmout;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // console.log(input, "input");
                    console.log((parseInt(input.amountIn) / Math.pow(10, 6)), "Amount In");
                    // console.log((parseInt(input.amountOut)/10**18),"Amount Out")
                    console.log(input.path[0], "Token - 0");
                    console.log(input.path[1], "Token - 1");
                    return [4 /*yield*/, priceFromTick(input.path[0], input.path[1], (parseInt(input.amountIn) / Math.pow(10, 6)), 201160, 6, 18)];
                case 1:
                    finalAmout = _a.sent();
                    console.log((parseInt(input.amountOut) / Math.pow(10, 18)), "Amount Out");
                    console.log(finalAmout, "final Amount");
                    return [2 /*return*/];
            }
        });
    });
}
main();
