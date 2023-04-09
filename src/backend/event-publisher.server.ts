import { EmbedField } from "discord.js";
import { APIEvent } from ".";
import { publishDiscordMessage } from "./discord.server";

/**
 * Publishes an Event to discord through a webhook
 * @param event
 * @param body
 */
export async function publishEvent(event: APIEvent, body: any): Promise<void> {
  try {
    const fields: EmbedField[] = [
      {
        name: "Tx Hash",
        value: body.txHash || "",
        inline: false,
      },
      {
        name: "Unique Id",
        value: body.pid || "",
        inline: false,
      },
    ];

    if (body.ada) {
      fields.push(
        {
          name: 'ADA',
          value: `₳ ${(body.ada  / 1_000_000).toFixed(6)}`,
          inline: false,
        });
    }

    console.log(`publishing event: ${event}`);

    await publishDiscordMessage(event, "new event published from ada payments", fields);
  } catch (err) {
    // @TODO: Handle error properly
    console.log(err);
  }
}
