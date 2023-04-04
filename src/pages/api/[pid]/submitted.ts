import { NextApiRequest, NextApiResponse } from "next";
import { APIEvent } from "@/backend";
import { publishEvent } from "@/backend/event-publisher.server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { pid } = req.query;
  await publishEvent(APIEvent.TX_SUBMITTED, { pid, txHash: req.body.txHash });
  res.status(200).end();
}
