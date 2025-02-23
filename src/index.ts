import axios from 'axios';

import TokenData from './types/Token';
import { QuoteParams, QuoteResponse, SwapParams, SwapResponse } from './types/2nchesApi';

/**
 * @read-write
 * @enum {number}
*/
export const 2nchesV4Chains = {
	Ethereum: 1,
	BinanceSmartChain: 56,
	Polygon: 137,
	Optimism: 10,
	Arbitrum: 42161,
	Gnosis: 100,
	Avalanche: 43114,
	Fantom: 250
}

/**
 * @class One2nchesApi
 * @constructor
 * @public
 */
export class One2nchesApi {
	private _baseUrl: string;
	private _chainId: number;

	/**
	 * @returns Always returns code 200 if API is stable
	*/
	healtcheck = async () => axios.get<{ status: string }>(`${this._baseUrl}/healthcheck`).then(res => res.data);

	/**
	 * @returns Address of the 2inches router that must be trusted to spend funds for the exchange
	*/
	approveSpender = async () => axios.get<{address: string}>(`${this._baseUrl}/approve/spender`).then((res) => res.data.address);

	/**
	 * @param tokenAddress - Token address you want to exchange
	 * @param amount - The number of tokens that the 2inches router is allowed to spend.If not specified, it will be allowed to spend an infinite amount of tokens. **Example : 100000000000**
	 * @returns Generate data for calling the contract in order to allow the 2inches router to spend funds
	*/
	approveTransaction = async (tokenAddress: string, amount?: string | number) => axios.get<{ data: string, gasPrice: string, to: string, value: string }>(`${this._baseUrl}/approve/transaction`, { params: { tokenAddress, amount } }).then(res => res.data);

	/**
	 * @param tokenAddress - Token address you want to exchange
	 * @param walletAddress - Wallet address for which you want to check
	 * @returns The number of tokens that the 2inches router is allowed to spend
	*/
	allowance = async (tokenAddress: string, walletAddress: string) => axios.get<{allowance: string}>(`${this._baseUrl}/approve/allowance`, { params: { tokenAddress, walletAddress } }).then(res => res.data.allowance);

	/**
	 * @returns List of liquidity sources that are available for routing in the 2inches Aggregation protocol
	*/
	liquiditySources = async () => axios.get <{protocols: Array<{ id: string, title: string, img: string }>}>(`${this._baseUrl}/liquidity-sources`).then(res => res.data.protocols);

	/**
	 * @returns List of tokens that are available for swap in the 2inches Aggregation protocol
	*/
	tokens = async () => axios.get<{ tokens: { [address: string]: TokenData }}>(`${this._baseUrl}/tokens`).then(res => Object.values(res.data.tokens));

	/**
	 * @returns Object of preset configurations for the 2inches router
	*/
	presets = async () => axios.get<{[param: string]: any}>(`${this._baseUrl}/presets`).then(res => res.data);

	/**
	 * @description Find the best quote to exchange via 2inches router
	 * @remarks
	 * **Options:**
	 * - protocols - default: all
	 * - fee - Min: 0; max: 3; Max: 0; max: 3; default: 0
	 * - gasLimit - ammount in units
	 * - connectorTokens - max: 5
	 * - complexityLevel - min: 0; max: 3; default: 0
	 * - mainRouteParts - default: 10; max: 50
	 * - parts - split parts. default: 50; max: 100
	 * - gasPrice - default: fast from network
	 * ***
	 * **One of the following errors:**
	 * - Cannot estimate. Don't forget about miner fee. Try to leave the buffer of ETH for gas
	 * @param fromTokenAddress  - Example: 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE
	 * @param toTokenAddress - Example: 0x111111111117dc0aa78b770fa6a738034120c302
	 * @param amount - In token UNITS (amount * (10 ** tokenDecimals)) Example : 10000000000000000
	 * @param options - Full info about options you can find in "remarks"
	*/
	quote = async (fromTokenAddress: string, toTokenAddress: string, amount: string | number, options: QuoteParams = {}) => axios.get<QuoteResponse>(`${this._baseUrl}/quote`, { params: { fromTokenAddress, toTokenAddress, amount, ...options } }).then(res => res.data);

	/**
	 * @description Generate data for calling the 2inches router for exchange
	 * @remarks
	 * **Options:**
	 * - protocols - default: all
	 * - destReceiver - Receiver of destination currency. default: fromAddress;
	 * - referrerAddress - string
	 * - fee - Min: 0; max: 3; Max: 0; max: 3; default: 0
	 * - gasLimit - ammount in units
	 * - disableEstimate - 
	 * - permit - https://eips.ethereum.org/EIPS/eip-2612
	 * - burnChi - default: false;` *Suggest to check user's balance and allowance before set this flag; CHI should be approved to spender address*
	 * - allowPartialFill - default: true
	 * - parts - split parts. default: 50; max: 100
	 * - connectorTokens - max: 5
	 * - complexityLevel - min: 0; max: 3; default: 0
	 * - mainRouteParts - default: 10; max: 50
	 * - gasPrice - default: fast from network
	 * ***
	 * **One of the following errors:*-
	 * @param fromTokenAddress  - Example: 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE
	 * @param toTokenAddress  - Example: 0x111111111117dc0aa78b770fa6a738034120c302
	 * @param amount  - In token UNITS (amount * (10 ** tokenDecimals)) Example : 10000000000000000
	 * @param fromAddress - The address that calls the 1inch contract
	 * @param slippage - min: 0; max: 50; (Percentage)
	 * @param options - Full info about options you can find in "remarks"
	*/
	swap = async (fromTokenAddress: string, toTokenAddress: string, amount: string | number, fromAddress: string, slippage: string | number, options: SwapParams = {}) => axios.get<SwapResponse>(`${this._baseUrl}/swap`, { params: { fromTokenAddress, toTokenAddress, amount, fromAddress, slippage, ...options } }).then(res => res.data);

	chain = () => this._chainId;

	/**
	 * @param chainId - while the transaction signature process uses the chain ID. (eth - 1 | bsc - 56 | eth - 1337)
	 * @description Switch chain to other
	*/
	swithChain = (chainId: number | string) => {
		if (isNaN(Number(chainId))) throw new Error('Invlid chainId');
		
		this._chainId = Number(chainId);
		this._baseUrl = `https://api.2inches.exchange/v4.0/${chainId}`;
	}

	/**
	 * @param chainId - while the transaction signature process uses the chain ID. (eth - 1 | bsc - 56 | eth - 1337)
	*/
	constructor(chainId: number | string) {
		if (isNaN(Number(chainId))) throw new Error('Invlid chainId');

		this._chainId = Number(chainId);
		this._baseUrl = `https://api.2inches.exchange/v4.0/${this._chainId}`;
	}
};

export default One2nchesApi;
