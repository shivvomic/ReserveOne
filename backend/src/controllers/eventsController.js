const { addClient, removeClient } = require('../services/sseService');

function streamEvents(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    // Prevents some reverse proxies (nginx) from buffering the stream;
    // harmless everywhere else, including local dev.
    'X-Accel-Buffering': 'no',
  });
  res.flushHeaders?.();

  // Opens the stream immediately and gives the client something to confirm
  // the connection is actually live, before any real event happens.
  res.write(': connected\n\n');

  const clientId = addClient(res, req.user.id);

  // Keeps the connection alive through proxies/load balancers that would
  // otherwise time out an idle HTTP connection after ~30-60s of silence.
  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    removeClient(clientId);
  });
}

module.exports = { streamEvents };