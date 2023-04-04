import type { EmbedField } from 'discord.js';
import { EmbedBuilder, WebhookClient } from 'discord.js';

/**
 * Setups the Discord Webhook Client
 */
const webhookClient = new WebhookClient({ id: process.env.DISCORD_WEBHOOK_ID!, token: process.env.DISCORD_WEBHOOK_TOKEN! });

/**
 * Publishes a message to discord
 * @param title
 * @param authorName
 * @param content
 * @param fields
 */
export async function publishDiscordMessage(title: string, content: string, fields: EmbedField[]): Promise<void> {
    const embed = new EmbedBuilder()
        .setTitle(title)
        .setColor(0x00ffff);

    embed.setFields(fields);

    await webhookClient.send({
        content,
        embeds: [embed],
    });
}