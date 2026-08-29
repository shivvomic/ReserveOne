// In-memory registry of connected SSE clients. This only works correctly
// for a single server instance (no shared state across processes) — same
// deliberate single-instance tradeoff as the Phase 6 advisory-lock pattern.
// Fine for this project's scale; would need a shared pub/sub (Redis, etc.)
// to survive horizontal scaling, which is explicitly out of scope here.
const clients = new Map(); // clientId -> { res, userId }
let nextClientId = 1;

function addClient(res, userId) {
  const clientId = nextClientId++;
  clients.set(clientId, { res, userId });
  return clientId;
}

function removeClient(clientId) {
  clients.delete(clientId);
}

// Broadcasts to every connected client regardless of role or ownership —
// the payload is intentionally minimal (bookingId, status, the booking's
// owner id) so a client that isn't actually interested can just ignore it.
function broadcast(event) {
  const payload = `data: ${JSON.stringify(event)}\n\n`;
  for (const [clientId, client] of clients) {
    try {
      client.res.write(payload);
    } catch (error) {
      // A dead connection that hasn't been cleaned up yet — drop it
      // defensively here too, in addition to the normal 'close' handler.
      clients.delete(clientId);
    }
  }
}

module.exports = { addClient, removeClient, broadcast };