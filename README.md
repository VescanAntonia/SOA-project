# Smart Travel System – Event-Driven Alerts with RabbitMQ, Kafka & WebSockets

This repository contains a **working example** of a **travel itinerary management system** built using a **microservice architecture** with **event-driven communication** and **real-time notifications**.

The system uses:

- **JWT (JSON Web Tokens)** for authentication
- An **API Gateway** for centralised routing and security
- **RabbitMQ** as a message broker for microservice communication
- **Kafka** for event streaming
- **WebSockets (Socket.IO)** for server-side notifications
- **Microfrontend architecture** for the web application

The project is used as the implementation example for a university assignment tutorial on  
**message brokers, event streaming, and real-time notifications in microservices**.

---

## 🎯 Tutorial Focus: Travel Alerts via RabbitMQ → Kafka → WebSockets

The tutorial and this repository focus on one concrete end-to-end flow:

1. A travel-related event (e.g. flight delay) is sent to the system.
2. The event is received by **Event Ingestion Service** and published to **RabbitMQ**.
3. **Alert Processing Service** consumes the message, publishes it to **Kafka**, and determines affected users.
4. **Notification Service** sends real-time alerts to users via **WebSockets**.
5. The **Alerts Microfrontend** displays the alert instantly in the browser.

---

## 🚀 How to Run

### Prerequisites
- Docker
- Docker Compose

### Start the system
```bash
docker compose up -d --build
```

### Open the applications
- Shell: http://localhost:8081/
- Manage Itineraries: http://localhost:8082/itinerary.html
- Alerts: http://localhost:8083/alerts.html

---

## ✅ Demo Flow

1. Register & login on **Manage Itineraries**
2. Create an itinerary with flight number `W2121`
3. Login on **Alerts** page
4. Trigger an event:

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

The alert should appear instantly in the Alerts UI.

## 📁 Folder Structure (simplified)
```bash
.
├─ services/
│  ├─ api-gateway/
│  ├─ auth-service/
│  ├─ itinerary-service/
│  ├─ event-ingestion-service/
│  ├─ alert-processing-service/
│  ├─ notification-service/
│  └─ analytics-faas/
├─ frontend/
│  ├─ frontend-shell/
│  ├─ frontend-itinerary/
│  └─ frontend-alerts/
├─ nginx/
│  └─ nginx.conf
└─ docker-compose.yml
```
