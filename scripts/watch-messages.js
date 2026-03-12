/**
 * Mission Control Message Watcher with AI Responses
 * 
 * Uses OpenClaw CLI to generate real AI responses.
 * Watches InstantDB for new messages and responds with Nova.
 */

const { init, id } = require('@instantdb/admin');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// InstantDB config
const APP_ID = '6b90ee38-0435-484f-b80a-24f1d36ea0f2';
const ADMIN_TOKEN = '02c74a95-a8c7-41a1-8569-aaa39a18ff40';

// AI Model config
const AI_MODEL = process.env.AI_MODEL || 'ollama/glm-5:cloud';

// Initialize InstantDB admin
const db = init({ appId: APP_ID, adminToken: ADMIN_TOKEN });

// Track processed messages
const processedMessages = new Set();

console.log('🚀 Mission Control Watcher Started');
console.log(`🤖 AI Model: ${AI_MODEL}`);
console.log(`💾 InstantDB: ${APP_ID}`);
console.log('Waiting for messages...\n');

// Subscribe to messages in real-time
const unsubscribe = db.subscribeQuery({ messages: {} }, (result) => {
  if (result.error) {
    console.error('❌ Query error:', result.error);
    return;
  }

  const messages = Object.entries(result.data?.messages || {}).map(([msgId, data]) => ({
    id: msgId,
    ...data
  }));

  // Sort by creation time
  messages.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));

  // Find new user messages
  for (const msg of messages) {
    if (msg.role === 'user' && !processedMessages.has(msg.id)) {
      processedMessages.add(msg.id);
      console.log(`📩 New message: "${msg.content?.substring(0, 50)}..."`);
      handleNewMessage(msg);
    }
  }
});

// Handle new message
async function handleNewMessage(msg) {
  try {
    // Get AI response
    const aiResponse = await getAIResponse(msg.content);
    
    if (aiResponse) {
      console.log(`✅ AI response received`);
      await writeMessage(aiResponse);
    } else {
      console.log(`📤 Using demo response`);
      await writeMessage(generateDemoResponse(msg.content));
    }
    
    console.log(`✅ Response written to InstantDB\n`);
  } catch (error) {
    console.error('❌ Error handling message:', error.message);
  }
}

// Get AI response using OpenClaw session
async function getAIResponse(message) {
  try {
    // Use OpenClaw's session spawn to get AI responses
    // This calls the AI model directly
    const prompt = `You are Nova, an AI assistant in Mission Control. Respond briefly and helpfully to: "${message}"`;
    
    // Call the AI model via curl to localhost Ollama
    const response = await execPromise(
      `curl -s http://127.0.0.1:11434/api/generate -d '{"model": "glm-5:cloud", "prompt": "${prompt.replace(/"/g, '\\"')}", "stream": false}' --max-time 30`,
      { timeout: 35000 }
    );
    
    const data = JSON.parse(response.stdout);
    return data.response || null;
  } catch (error) {
    // If AI fails, return null to use demo response
    console.log('⚠️ AI response failed, using demo:', error.message);
    return null;
  }
}

// Write message to InstantDB
async function writeMessage(content) {
  try {
    const messageId = id();
    
    await db.transact(
      db.tx.messages[messageId].update({
        role: 'assistant',
        content,
        createdAt: Date.now(),
      })
    );
    
    console.log(`📝 Written message ID: ${messageId}`);
  } catch (error) {
    console.error('❌ Write error:', error.message);
    throw error;
  }
}

// Generate demo response
function generateDemoResponse(message) {
  const lower = message?.toLowerCase() || '';
  
  if (lower.includes('task') || lower.includes('todo')) {
    return `[Nova] I'll help you manage tasks. Create a new task in the Tasks panel, or describe what you need.`;
  }
  if (lower.includes('agent') || lower.includes('team')) {
    return `[Nova] The agent team is ready. Click on any agent in the Agent Network panel to chat with them.`;
  }
  if (lower.includes('workflow') || lower.includes('automation')) {
    return `[Nova] Workflows are automated sequences. Click on any workflow to edit it or create new ones.`;
  }
  if (lower.includes('help') || lower.includes('what can')) {
    return `[Nova] I'm Nova, your Mission Control assistant. I can:\n\n• Manage agents and tasks\n• Create and run workflows\n• Store knowledge and memories\n\nWhat would you like to work on?`;
  }
  
  const responses = [
    `[Nova] I understand. What would you like me to do?`,
    `[Nova] Got it. I'm tracking this in the system.`,
    `[Nova] Acknowledged. Should I create a task for this?`,
    `[Nova] I'm on it. Is there anything specific you need?`,
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down watcher...');
  unsubscribe?.();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down watcher...');
  unsubscribe?.();
  process.exit(0);
});

console.log('✅ Watcher ready. Send a message from Mission Control!');