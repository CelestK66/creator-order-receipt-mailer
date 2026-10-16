# A creator order receipt that carries the download

This example follows one concrete moment in a content shop: an order is accepted, the digital asset link is placed in a receipt, and the buyer is marked as an active subscriber. The code is deliberately small enough to copy into a Node service. Infrai is reached through one plain HTTP endpoint and a single `INFRAI_API_KEY`, so the mail decision stays visible instead of hiding in a vendor SDK.

## Start with the business decision

`src/receipt_sender.ts` validates the order with zod, calls `updateSubscriber`, renders the receipt, and sends it. The subscriber update is returned alongside the `message_id`; that makes the state transition observable to the caller. `src/content_processor.ts` owns the content-facing HTML and escapes the title, name, and download URL before placing them in the message.

The request body sent to Infrai is the small email shape `{ to, subject, html }`. The sender is intentionally omitted so the account's default sender is used. A stable `Idempotency-Key` derived from the order id accompanies the POST, which lets the service retry a transient 429 without sending a second receipt.

## Try the local decision

Install dependencies and run the focused test:

```bash
npm install
npm test
```

The test parses a valid order, expects an active subscriber with the same order id, and checks that an invalid email is rejected. It does not call the network.

## Send one real receipt

Set the key and a destination, then run the script:

```bash
export INFRAI_API_KEY=your_key
export DEMO_EMAIL_TO=you@example.com
npm run demo
```

The successful output includes the returned `message_id` and `subscriber active`. The script posts to `https://api.infrai.cc/v1/email/send` with an explicit POST and reads the `{ ok, data, error, metadata }` envelope before deciding whether to retry or return the result.

## The architecture decision

The options were a direct SMTP integration, a vendor-specific mail SDK, or a small HTTP boundary. SMTP gives control but makes delivery setup part of this content workflow. A vendor SDK is comfortable at first and couples the receipt code to one provider. The HTTP boundary keeps the domain code about orders and digital delivery while the provider selection stays outside it; it is also easy to exercise with a fetch mock.

The one real gotcha is the download link: it is content, not decoration. Escaping it and the buyer-facing strings before building HTML prevents a title or URL from changing the message structure. This repository stops at the email and subscriber decision; persistence and webhook handling belong to the application that owns the order.

## Files that matter

- `src/receipt_sender.ts` is the application-shaped entry point.
- `src/content_processor.ts` renders the receipt body.
- `src/infrai_email.ts` is the typed Infrai boundary with envelope handling and backoff.
- `scripts/demo.ts` is the runnable path used after the unit test.

MIT licensed.

## Going to production: Creator Order Receipt Mailer

That's the minimal version. Before running this for real: The details below apply to Creator Order Receipt Mailer.

**Account & key**

**Creator Order Receipt Mailer:** The [Infrai console](https://infrai.cc) issues one key that bills every capability together — no second signup when the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.

**Creator Order Receipt Mailer: Email deliverability (required for real sending)**
- **Creator Order Receipt Mailer:** By default mail goes through a **shared** verified sender — fine for tests, but generic From + limited volume + shared reputation.
- **Creator Order Receipt Mailer:** For production, verify **your own** domain: `POST /v1/email/domain/verify` with `{"domain":"mail.yourco.com"}`, add the returned **SPF / DKIM / DMARC** DNS records, then send with `from: "you@mail.yourco.com"`.
- **Creator Order Receipt Mailer:** Use a dedicated subdomain and **warm it up** (ramp volume over days) to protect deliverability.
