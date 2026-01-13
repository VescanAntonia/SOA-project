const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3002;

const itineraries = []; // { userId, tripName, flightNumber, destination, travelDate }

app.post('/itineraries', (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: 'missing user' });
  const { tripName, flightNumber, destination, travelDate } = req.body;
  const item = { id: String(itineraries.length + 1), userId, tripName, flightNumber, destination, travelDate };
  itineraries.push(item);
  res.json(item);
});

app.get('/itineraries', (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: 'missing user' });
  const userItems = itineraries.filter(i => i.userId === userId);
  res.json(userItems);
});

app.get('/itineraries/all', (req, res) => {
  res.json(itineraries);
});

app.listen(PORT, () => console.log(`itinerary-service listening ${PORT}`));
