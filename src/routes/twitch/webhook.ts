import { HTTPRouteHandler } from "@src/engine/types/Executors";
import { getAppContext } from "@src/engine/utils/Composable";
import { debug, info, warn } from "@src/engine/utils/Logger";
import { Request, Response } from "express";

const TYPE_TWITCH_CHANNEL_MESSAGE = "webhook_callback_verification"
const TYPE_TWITCH_NOTIFICATION_MESSAGE = "notification"
const TYPES_TWITCH_ALLOWED_MESSAGE = ["stream.online"]

const TYPE_TWITCH_STREAM_LIVE = "live"

const HEADER_TWITCH_MESSAGE_TYPE = 'Twitch-Eventsub-Message-Type'.toLowerCase();
const HEADER_TWITCH_MESSAGE_TIMESTAMP = 'Twitch-Eventsub-Message-Timestamp'.toLowerCase();
const HEADER_TWITCH_MESSAGE_SIGNATURE = 'Twitch-Eventsub-Message-Signature'.toLowerCase();

const HMAC_PREFIX = 'sha256=';

export default {
	async get(_req, res) {
		res.status(404).json({ err: true, code: 404, message: "Not found!" });
	},
	async post(req, res) {
		if (!req.headers[HEADER_TWITCH_MESSAGE_TYPE]) {
			res.status(400).json({ err: true, code: 400, message: "Bad Request!" });
			return;
		}
		if (req.headers[HEADER_TWITCH_MESSAGE_TYPE] === TYPE_TWITCH_NOTIFICATION_MESSAGE) {
			info("Twitch Notification Received");
			doWebhookBehavior(req, res);
		} else
			if (req.headers[HEADER_TWITCH_MESSAGE_TYPE] === TYPE_TWITCH_CHANNEL_MESSAGE) {
				info("Twitch Challenge Received");
				doCallbackBehavior(req, res);
			}
			else {
				res.status(400).json({ err: true, code: 400, message: "Bad Request!" });
			}
	}
} satisfies HTTPRouteHandler;
const doCallbackBehavior = async (req: Request, res: Response) => {
	if (!req.body || !req.body.challenge) return res.status(400).json({ err: true, code: 400, message: "Bad Request!" });
	/* Example of a Twitch Webhook Challenge */

	/* const example = {
		"challenge": "pogchamp-kappa-360noscope-vohiyo",
		"subscription": {
			"id": "f1c2a387-161a-49f9-a165-0f21d7a4e1c4",
			"status": "webhook_callback_verification_pending",
			"type": "channel.follow",
			"version": "1",
			"cost": 1,
			"condition": {
				"broadcaster_user_id": "12826"
			},
			"transport": {
				"method": "webhook",
				"callback": "https://example.com/webhooks/callback"
			},
			"created_at": "2019-11-16T10:11:12.634234626Z"
		}
	} */

	res.status(200).send(req.body.challenge);
}
const doWebhookBehavior = async (req: Request, res: Response) => {
	if (!req.body || !req.body.subscription || !req.body.event) return res.status(400).json({ err: true, code: 400, message: "Bad Request!" });
	/* Example of a Twitch Webhook Event */

	/* const example = {
		"subscription": {
			"id": "f1c2a387-161a-49f9-a165-0f21d7a4e1c4",
			"type": "stream.online",
			"version": "1",
			"status": "enabled",
			"cost": 0,
			"condition": {
				"broadcaster_user_id": "1337"
			},
			"transport": {
				"method": "webhook",
				"callback": "https://example.com/webhooks/callback"
			},
			"created_at": "2019-11-16T10:11:12.634234626Z"
		},
		"event": {
			"id": "9001",
			"broadcaster_user_id": "1337",
			"broadcaster_user_login": "cool_user",
			"broadcaster_user_name": "Cool_User",
			"type": "live",
			"started_at": "2020-10-11T10:11:12.123Z"
		}
	} */

	if (!req.body.subscription || !req.body.event) return res.status(400).json({ err: true, code: 400, message: "Bad Request!" });
	if (!req.body.subscription.type || !req.body.event.type) return res.status(400).json({ err: true, code: 400, message: "Bad Request!" });

	res.status(200).json({ error: false, code: 200, message: "Event Received!" });

	if (!TYPES_TWITCH_ALLOWED_MESSAGE.includes(req.body.subscription.type)) return warn("Received a webhook event for an unknown event!");

	const broadcaster_uid = process.env.TWITCH_BROADCASTER_UID || "0";
	if (req.body.event.broadcaster_user_id !== broadcaster_uid) return warn("Received a webhook event for a different broadcaster!");

	if (req.body.event.type === TYPE_TWITCH_STREAM_LIVE) {
		getAppContext().events.emit("twitchStreamStarted");
	}
	else {
		info("Twitch Notification Received but not handled");
		debug(req.body);
	}
}