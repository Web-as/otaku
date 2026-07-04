import ws from 'k6/ws';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 10000 }, // Attempt to connect 10k sockets
    { duration: '3m', target: 10000 }, // Hold connections
    { duration: '30s', target: 0 },
  ],
};

const WS_URL = __ENV.WS_URL || 'wss://your-project-ref.supabase.co/realtime/v1/websocket?apikey=YOUR_ANON_KEY';

export default function () {
  // Protocol Gamma Mitigation: Dynamic Channel Sharding
  // Instead of 10,000 VUs joining 'room:dm-tavern' and causing a broadcast overflow,
  // we shard users into instances of 100.
  const vuId = __VU; // The virtual user's unique ID
  const instanceId = Math.floor(vuId / 100) + 1; // e.g., VU 450 goes to instance 5
  const shardTopic = `realtime:room:dm-tavern-instance-${instanceId}`;

  const res = ws.connect(WS_URL, null, function (socket) {
    socket.on('open', function () {
      // 1. Join the sharded DM Tavern Room
      socket.send(JSON.stringify({
        topic: shardTopic,
        event: 'phx_join',
        payload: {},
        ref: '1'
      }));

      // 2. Broadcast a dice roll every 10 seconds to the shard
      socket.setInterval(function timeout() {
        socket.send(JSON.stringify({
          topic: shardTopic,
          event: 'broadcast',
          payload: { type: 'dice_roll', value: Math.floor(Math.random() * 20) + 1 },
          ref: '2'
        }));
      }, 10000);
    });

    socket.on('message', function (msg) {
      // Message received from the thundering herd
    });

    socket.on('close', function () {
      // Connection dropped
    });
    
    // Test runs for 4 minutes max per VU
    socket.setTimeout(function () {
      socket.close();
    }, 240000);
  });

  check(res, { 'status is 101': (r) => r && r.status === 101 });
}
