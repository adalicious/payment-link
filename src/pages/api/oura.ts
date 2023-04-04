import { APIEvent } from "@/backend";
import { publishEvent } from "@/backend/event-publisher.server";
import { NextApiRequest, NextApiResponse } from "next";
import { METADATA_LABEL } from "..";

const VARIANT_TRANSACTION = "Transaction";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  // Basic api-key authentication to validate the source of the webhook is oura
  const apiKey = req.headers["x-oura-api-key"]?.toString();

  if (process.env.OURA_WEBHOOK_API_KEY !== apiKey) {
    return res.status(401);
  }

  // Validates the event received is a transaction - this is filtered at Oura level
  // but this is just a safe check
  if (req.body.variant !== VARIANT_TRANSACTION) return res.status(401);

  // Gets the transaction hash and its metadata
  const txHash = req.body.transaction.hash;
  const metadata = req.body.transaction.metadata;

  let pid = "";

  for (const data of metadata) {
    try {
      if (data.label === METADATA_LABEL.toString()) {
        const payload = data.map_json;
        pid = payload.pid;
        break;
      }
    } catch (err) {
      console.log(`Error getting transaction metadata: ${err}`);
    }
  }

  // Publishes the event with teh transaction id confirmed
  await publishEvent(APIEvent.TX_CONFIRMED, { pid, txHash });

  return res.status(200).end();
}
