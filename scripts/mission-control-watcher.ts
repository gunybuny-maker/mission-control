/**
 * Mission Control Message Watcher
 * 
 * Watches InstantDB for new messages and responds via OpenClaw Gateway.
 * This enables real-time chat between Mission Control (Vercel) and local Nova.
 * 
 * Usage: node scripts/mission-control-watcher.js
 */

import { init, i } from '@instantdb/nodejs';

// InstantDB config
const APP_ID = '6b90ee38-0435-484f-b80a-24f1d36ea0f2';
const ADMIN_TOKEN = '02c74a95-a8c7-41a1-8569-aaa39a18ff40';

// Gateway config
const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || 'http://127.0.0.1:18789';

// Initialize InstantDB
const db = init({ appId: APP_ID, adminToken: ADMIN_TOKEN });

// Track processed messages to avoid duplicates
const processedMessages = new Set<string>();

// Track active conversations
const conversations = new Map<string, { agentId: string; lastMessage: number }>();

console.log('🚀 Mission Control Watcher Started');
console.log(`📡 Gateway: ${GATEWAY_URL}`);
console.log(`💾 InstantDB: ${APP_ID}`);
console.log('Waiting for messages...\n');

// Query for new messages every 500ms
setInterval(async () => {
  try {
    const result = await db.query({
      messages: {},
    });

    const messages = result.messages || [];
    
    // Find unprocessed user messages
    for (const msg of messages) {
      if (msg.role === 'user' && !processedMessages.has(msg.id)) {
        processedMessages.add(msg.id);
        
        console.log(`📩 New message: "${msg.content.substring(0, 50)}..."`);
        
        // Process and respond
        await processMessage(msg);
      }
    }
  } catch (error) {
    console.error('❌ Query error:', error);
  }
}, 500);

// Process incoming message and send to Gateway
async function processMessage(msg: any) {
  const conversationId = `mission-control-${msg.id}`;
  
  try {
    // Send to OpenClaw Gateway for processing
    const response = await fetch(`${GATEWAY_URL}/api/message/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel: 'mission-control',
        target: 'main', // Main Nova agent
        message: msg.content,
        conversationId: conversationId,
      }),
    });

    if (!response.ok) {
      // Gateway not available, send demo response
      await sendDemoResponse(msg);
      return;
    }

    const data = await response.json();
    
    // Write response back to InstantDB
    await db.transact(
      db.tx.messages[i()].update({
        role: 'assistant',
        content: data.response || data.message || 'Processed successfully.',
        createdAt: Date.now(),
      })
    );

    console.log(`✅ Response sent to InstantDB`);
    
  } catch (error) {
    console.error('❌ Processing error:', error);
    
    // Send fallback response
    await sendDemoResponse(msg);
  }
}

// Send a demo response when Gateway is unavailable
async function sendDemoResponse(msg: any) {
  const responses = [
    `I received your message: "${msg.content.substring(0, 30)}..."\n\nI'm currently running in offline mode. To enable full AI responses, ensure the OpenClaw Gateway is running on port 18789.`,
    `Thanks for the message! I'm in demo mode right now. For real AI responses, start the Gateway with: openclaw gateway`,
    `Message received. Running in offline mode - responses are limited. Start Gateway for full capabilities.`,
  ];

  const response = responses[Math.floor(Math.random() * responses.length)];
  
  await db.transact(
    db.tx.messages[i()].update({
      role: 'assistant',
      content: response,
      createdAt: Date.now(),
    })
  );

  console.log(`📤 Demo response sent`);
}

// Also watch for agent-specific messages
setInterval(async () => {
  try {
    // Check for agent conversations
    // This would be for individual agent chats
    const result = await db.query({
      messages: {},
    });

    // Group by conversation/agent and process
    // For now, we just track all messages
    
  } catch (error) {
    // Silently handle polling errors
  }
}, 1000);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down watcher...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down watcher...');
  process.exit(0);
});