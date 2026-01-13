const amqp = require('amqplib');
const { Kafka } = require('kafkajs');
const fetch = require('node-fetch');

const RABBIT = process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672';
const KAFKA_BROKER = process.env.KAFKA_BROKER || 'kafka:9092';

(async () => {
  try {
    const conn = await amqp.connect(RABBIT);
    const ch = await conn.createChannel();
    await ch.assertQueue('events', { durable: true });
    console.log('alert-processor connected to rabbitmq');

    const kafka = new Kafka({ brokers: [KAFKA_BROKER] });
    const producer = kafka.producer();
    await producer.connect();
    console.log('connected to kafka');

    ch.consume('events', async msg => {
      if (!msg) return;
      const raw = msg.content.toString();
      console.log('received event', raw);
      const event = JSON.parse(raw);

      await producer.send({ topic: 'alerts', messages: [{ value: JSON.stringify(event) }] });

      try {
        const resp = await fetch('http://itinerary-service:3002/itineraries/all');
        const list = await resp.json();
const eventFlight = (event.flightNumber || '').trim();
const eventCity = (event.city || event.destination || '').trim().toLowerCase();

const affected = list.filter(i => {
  const itFlight = (i.flightNumber || '').trim();
  const itCity = (i.destination || '').trim().toLowerCase();

  return (eventFlight && itFlight === eventFlight) ||
         (eventCity && itCity === eventCity);
});
        for (const it of affected) {
          const alert = { userId: it.userId, itineraryId: it.id, type: event.type, payload: event };
          await fetch('http://notification-service:3004/notify', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(alert) });
        }
      } catch (e) {
        console.error('matching error', e.message);
      }

      ch.ack(msg);
    });
  } catch (e) {
    console.error('startup error', e);
    process.exit(1);
  }
})();
