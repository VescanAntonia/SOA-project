# Real-Time Travel Alerts with RabbitMQ, Kafka & WebSockets

## 1. Introduction

Modern travel applications must react to external events such as flight delays, cancellations, or destination disruptions. In a microservice architecture, handling these events using direct service-to-service calls leads to tight coupling and poor scalability.

This tutorial presents a **working example** of an **event-driven alert pipeline** implemented in the *Smart Travel System*. The system uses:

- **RabbitMQ** for reliable message-based communication
- **Kafka** for event streaming
- **WebSockets (Socket.IO)** for real-time notifications to users
- **Node.js microservices**
- **Docker Compose** for deployment

🎯 **Goal of the tutorial**  
When a travel-related event (e.g. flight delay) is sent to the system, all affected users receive an alert instantly in their browser, without polling.

---

## 2. Core Concepts

### 2.1 REST APIs for Event Ingestion

The system exposes a REST endpoint for receiving travel events:

```
POST /events
```

Example request body:

```json
{
  "type": "FLIGHT_DELAY",
  "flightNumber": "W2121",
  "payload": {
    "minutes": 90,
    "reason": "weather"
  }
}
```

REST is used as an integration boundary. External systems can send events without needing to know how the internal infrastructure works.

---

### 2.2 RabbitMQ – Message Broker

RabbitMQ is used as a **message broker** to decouple services.

In this system:
- The **Event Ingestion Service** publishes messages to the RabbitMQ queue `events`
- The **Alert Processing Service** consumes messages from this queue

Benefits:
- Loose coupling between services
- Reliable delivery even if consumers restart
- Easy horizontal scaling by adding consumers

---

### 2.3 Kafka – Event Streaming

Kafka is used to store a durable stream of alert events.

In this system:
- The Alert Processing Service publishes each event to the Kafka topic `alerts`

Why Kafka:
- Events are persisted and replayable
- Multiple consumers can subscribe independently
- Suitable for analytics, auditing, or monitoring use cases

---

### 2.4 WebSockets – Real-Time Notifications

REST APIs follow a request-response model, which is inefficient for notifications.  
WebSockets allow the server to push messages to clients instantly.

In this system:
- The **Notification Service** uses Socket.IO
- Each user joins a room identified by their `userId`
- Alerts are emitted only to the affected users

---

## 3. End-to-End Alert Flow

### Scenario: Flight Delay Alert

1. A user registers and logs in.
2. The user creates an itinerary with a flight number.
3. An external system sends a flight delay event to `POST /events`.
4. Event Ingestion Service publishes the event to RabbitMQ.
5. Alert Processing Service consumes the message.
6. The event is published to Kafka.
7. Alert Processing matches itineraries by flight number and destination.
8. Notification Service is called to emit alerts.
9. The browser receives the alert via WebSockets.

This flow demonstrates a complete event-driven pipeline:
**REST → RabbitMQ → Kafka → WebSockets → Browser**

---

## 4. Prerequisites

To run the example:

- Docker
- Docker Compose
- Optional: PowerShell or Postman for sending test events

---

## 5. Implementation Guide

### Step 1: Event Ingestion Service

- Exposes `POST /events`
- Connects to RabbitMQ
- Publishes incoming JSON events to queue `events`

This service contains no business logic and acts only as an entrypoint.

---

### Step 2: Alert Processing Service

Responsibilities:
- Consume messages from RabbitMQ
- Publish events to Kafka topic `alerts`
- Fetch itineraries from Itinerary Service
- Identify affected users
- Call Notification Service

This service contains the main business logic of the alert pipeline.

---

### Step 3: Notification Service

- Runs a Socket.IO server
- Clients join user-specific rooms
- Receives HTTP notifications and emits WebSocket events

This design allows real-time alerts without client-side polling.

---

## 6. Running the System

Start the full stack:

```bash
docker compose up -d --build
```

Open the applications:
- Itinerary UI: http://localhost:8082/itinerary.html
- Alerts UI: http://localhost:8083/alerts.html

---

## 7. Testing the Alert Pipeline

### Step A: Create Test Data

1. Register and login on the Itinerary page
2. Create an itinerary with flight number `W2121`
3. Login on the Alerts page and keep it open

---

### Step B: Send a Test Event

Send a flight delay event using PowerShell:

```powershell
$body = @{
  type = "FLIGHT_DELAY"
  flightNumber = "W2121"
  payload = @{
    minutes = 90
    reason  = "weather"
  }
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Method Post `
  -Uri "http://localhost:3003/events" `
  -ContentType "application/json" `
  -Body $body
```

Expected result:
- Event appears in RabbitMQ queue
- Kafka topic `alerts` receives the event
- Alert appears instantly in the Alerts UI

---

## 8. Assignment Requirements Coverage

This tutorial demonstrates:
- Message brokers (RabbitMQ)
- Event streaming (Kafka)
- Server-side notifications (WebSockets)
- Microservice communication
- Containerised deployment

---

## 9. Conclusion

This tutorial presented a complete example of building an event-driven alert system using RabbitMQ, Kafka, and WebSockets. The architecture is scalable, loosely coupled, and suitable for real-world distributed systems where real-time feedback is required.
