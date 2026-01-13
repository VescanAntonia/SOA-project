const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3005;


app.get('/analytics', (req, res) => {
  const analytics = {
    totalItineraries: 42, 
    totalEvents: 15, 
    alertsSent: 8, 
    timestamp: new Date().toISOString()
  };
  res.json(analytics);
});

app.listen(PORT, () => console.log(`analytics-faas listening on ${PORT}`));