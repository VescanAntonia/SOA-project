const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const jwt = require('jsonwebtoken');

const app = express();
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret';

app.use((req, res, next) => { 
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`); 
  next(); 
});


function proxyRequest(service, port) {
  return (req, res, next) => {
    const options = {
      hostname: service,
      port: port,
      path: req.originalUrl,
      method: req.method,
      headers: req.headers
    };

    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      console.error(`[Proxy Error] ${service}:${port}`, err.message);
      res.status(502).json({ error: 'Bad Gateway', service: service });
    });

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      if (req.body) {
        const bodyString = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyString));
        proxyReq.write(bodyString);
      }
    }
    proxyReq.end();
  };
}


function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}


function proxyRequestAuth(service, port) {
  return (req, res, next) => {
    const options = {
      hostname: service,
      port: port,
      path: req.originalUrl,
      method: req.method,
      headers: { ...req.headers, 'x-user-id': req.user.sub }
    };

    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      console.error(`[Proxy Error] ${service}:${port}`, err.message);
      res.status(502).json({ error: 'Bad Gateway', service: service });
    });

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      if (req.body) {
        const bodyString = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyString));
        proxyReq.write(bodyString);
      }
    }
    proxyReq.end();
  };
}

app.post('/test', (req, res) => res.json({ok: true}));

app.use('/auth', proxyRequest('auth-service', 3001));
app.use('/itineraries', authenticate, proxyRequestAuth('itinerary-service', 3002));
app.use('/events', proxyRequest('event-ingestion-service', 3003));
app.use('/analytics', proxyRequest('analytics-faas', 3005));
app.use('/notify', proxyRequest('notification-service', 3004));

app.listen(PORT, () => console.log(`api-gateway listening ${PORT}`));
