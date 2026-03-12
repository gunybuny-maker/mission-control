/**
 * Mission Control Message Watcher (JavaScript)
 * 
 * Watches InstantDB for new messages and responds via OpenClaw Gateway.
 * This enables real-time chat between Mission Control (Vercel) and local Nova.
 * 
 * Usage: node scripts/watch-messages.js
 */

const https = require('https');
const http = require('http');

// InstantDB config
const APP_ID = '6b90ee38-0435-484f-b80a-24f1d36ea0f2';
const ADMIN_TOKEN = '02c74a95-a8c7-41a1-8569-aaa39a18ff40';
const INSTANT_API = 'https://api.instantdb.com';

// Gateway config
const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || 'http://127.0.0.1:18789';

// Track processed messages
const processedMessages = new Set();

console.log('🚀 Mission Control Watcher Started');
console.log(`📡 Gateway: ${GATEWAY_URL}`);
console.log(`💾 InstantDB: ${APP_ID}`);
console.log('Waiting for messages...\n');

// Fetch messages from InstantDB
async function fetchMessages() {
  return new Promise((resolve, reject) => {
    const url = `${INSTANT_API}/admin/${APP_ID}/data?token=${ADMIN_TOKEN}`;
    
    https.get(url, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.data?.messages || []);
        } catch (e) {
          resolve([]);
        }
      });
    }).on('error', reject);
  });
}

// Write message to InstantDB
async function writeMessage(content, role = 'assistant') {
  return new Promise((resolve, reject) => {
    const url = `${INSTANT_API}/admin/${APP_ID}/data?token=${ADMIN_TOKEN}`;
    
    const payload = JSON.stringify({
      messages: [{
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        role: role,
        content: content,
        createdAt: Date.now(),
      }]
    });
    
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// Send to Gateway
async function sendToGateway(message) {
  return new Promise((resolve, reject) => {
    const url = `${GATEWAY_URL}/api/message/send`;
    
    const payload = JSON.stringify({
      channel: 'mission-control',
      target: 'main',
      message: message,
    });
    
    const client = GATEWAY_URL.startsWith('https') ? https : http;
    
    const req = client.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve({ response: data });
        }
      });
    });
    
    req.on('error', () => resolve(null));
    req.write(payload);
    req.end();
  });
}

// Process new messages
async function processMessages() {
  try {
    const messages = await fetchMessages();
    
    // Sort by creation time
    const sorted = messages.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    
    // Find unprocessed user messages
    for (const msg of sorted) {
      if (msg.role === 'user' && !processedMessages.has(msg.id)) {
        processedMessages.add(msg.id);
        
        console.log(`📩 New message: "${msg.content?.substring(0, 50)}..."`);
        
        // Try Gateway first
        const gatewayResponse = await sendToGateway(msg.content);
        
        if (gatewayResponse && gatewayResponse.response) {
          console.log(`✅ Gateway response received`);
          await writeMessage(gatewayResponse.response);
        } else {
          // Demo response
          console.log(`📤 Sending demo response`);
          const demoResponse = generateDemoResponse(msg.content);
          await writeMessage(demoResponse);
        }
        
        console.log(`✅ Response written to InstantDB\n`);
      }
    }
  } catch (error) {
    // Silently handle errors
  }
}

// Generate demo response
function generateDemoResponse(message) {
  const lower = message?.toLowerCase() || '';
  
  if (lower.includes('task') || lower.includes('todo')) {
    return `[Nova] I'll help you manage tasks. Create a new task in the Tasks panel, or describe what you need and I'll add it for you.`;
  }
  
  if (lower.includes('agent') || lower.includes('team')) {
    return `[Nova] The agent team is ready. You can chat with any agent by clicking on them in the Agent Network panel. Each agent has their own specialty.`;
  }
  
  if (lower.includes('workflow') || lower.includes('automation')) {
    return `[Nova] Workflows are automated sequences. Click on any workflow to view or edit it. Create new workflows to automate repetitive tasks.`;
  }
  
  if (lower.includes('help') || lower.includes('what can')) {
    return `[Nova] I'm Nova, your Mission Control assistant. I can help you:\n\n• Manage agents and tasks\n• Create and run workflows\n• Store knowledge and memories\n• Monitor system health\n\nWhat would you like to work on?`;
  }
  
  const responses = [
    `[Nova] I understand. Let me know if you need me to take any action.`,
    `[Nova] Got it. I'm tracking this in the system.`,
    `[Nova] Acknowledged. Would you like me to create a task for this?`,
    `[Nova] I'm on it. I'll coordinate with the team if needed.`,
    `[Nova] Understood. Check the relevant panel for updates.`,
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

// Poll every 500ms
setInterval(processMessages, 500);

// Run immediately
processMessages();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down watcher...');
  process.exit(0);
});