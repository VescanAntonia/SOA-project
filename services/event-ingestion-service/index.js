const express = require('express');
const bodyParser = require('body-parser');
const amqp = require('amqplib');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3003;
const RABBIT = process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672';

let channel;
(async () => {
  const conn = await amqp.connect(RABBIT);
  channel = await conn.createChannel();
  await channel.assertQueue('events', { durable: true });
  console.log('connected to rabbitmq');
})().catch(err => console.error(err));

app.post('/events', async (req, res) => {
  const event = req.body;
  if (!channel) return res.status(503).json({ error: 'no channel' });
  channel.sendToQueue('events', Buffer.from(JSON.stringify(event)), { persistent: true });
  res.json({ ok: true });
});

app.listen(PORT, () => console.log(`event-ingestion listening ${PORT}`));
