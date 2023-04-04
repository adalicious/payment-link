import { paymentCoin } from "@/config/coin";

type PriceInfo = { [blockchain: string]: { [currency: string]: number } };

/**
 * Implemented as an abstraction for extending easily with different providers
 */
export interface ADARateFetcher {
  fetch(currency: string): Promise<number>;
}

/**
 * Returns the rate for the ADA in the given currency by using the coinGecko API
 */
export const coinGeckoADARate: ADARateFetcher = {
  fetch: async function (currency: string): Promise<number> {
    const baseUrl = process.env.ADA_RATE_API!;
    const url = `${baseUrl}?ids=${paymentCoin.blockchain.toLowerCase()}&vs_currencies=${currency.toLowerCase()}`;

    // Fetches the ADA Price information
    const res = await fetch(url);

    const priceInfo: PriceInfo = await res.json();

    return priceInfo[paymentCoin.blockchain.toLowerCase()][currency.toLowerCase()];
  },
};
