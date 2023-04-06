import { Product } from "@/config/products";
import axios, { AxiosRequestConfig } from "axios";

/**
 * Type of events to publish
 */
export enum APIEvent {
  TX_SUBMITTED = "tx-submitted",
  TX_CONFIRMED = "tx-confirmed",
}

/**
 * Executes an HTTP Post to the internal API
 * @param route 
 * @param body 
 * @returns 
 */
async function post(route: string, body = {}) {
  const postData: AxiosRequestConfig = {
    method: "POST",
    url: `/api/${route}`,
    headers: { "content-type": "application/json" },
    data: {
      ...body,
    },
  };

  return await axios(postData);
}

/**
 * Publishes the tx submitted event to the internal route
 * @param pid 
 * @param txHash 
 * @returns 
 */
export async function postPublishTxSubmittedEvent(pid: string, txHash: string) {
  return await post(`${pid}/submitted`, { txHash });
}

/**
 * Publishes to the generate token link
 * @param pid 
 * @param name 
 * @param price 
 * @param currency 
 * @returns 
 */
export async function postGenerateToken(pid: string, products: Product[], jwt: string) {
  return await post(`/token`, { pid, products, jwt });
}
