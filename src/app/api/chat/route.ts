import { NextRequest, NextResponse } from 'next/server';

// Real-time chat via InstantDB
// Mission Control writes to InstantDB, local agent watches and responds
// This works from anywhere without exposing the Gateway publicly

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, agentId, agentName, conversationId } = body;

    // The client already writes to InstantDB directly
    // This API route is for Gateway polling / status checking
    
    // For now, return demo response
    // Real implementation: Local OpenClaw agent watches InstantDB and responds
    
    const agent = agentName || 'Nova';
    const demoResponse = getDemoResponse(message, agent);
    
    return NextResponse.json({
      response: demoResponse,
      status: 'instant',
      agent: agent,
      note: 'Messages are synced in real-time via InstantDB. Run local agent to respond.',
    });

  } catch (error) {
    console.error('Chat API error:', error);
    
    return NextResponse.json({
      response: 'Connection error. Please try again.',
      status: 'error',
    }, { status: 500 });
  }
}

// Generate contextual demo responses
function getDemoResponse(message: string, agent: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Task-related
  if (lowerMessage.includes('task') || lowerMessage.includes('todo')) {
    return `I'll help you manage tasks. Create a new task in the Tasks panel, or describe what you need and I'll add it for you.`;
  }
  
  // Agent-related
  if (lowerMessage.includes('agent') || lowerMessage.includes('team')) {
    return `The agent team is ready. You can chat with any agent by clicking on them in the Agent Network panel. Each agent has their own specialty and can handle different types of work.`;
  }
  
  // Workflow-related
  if (lowerMessage.includes('workflow') || lowerMessage.includes('automation')) {
    return `Workflows are automated sequences. Click on any workflow to view or edit it. Create new workflows to automate repetitive tasks.`;
  }
  
  // Knowledge-related
  if (lowerMessage.includes('knowledge') || lowerMessage.includes('memory') || lowerMessage.includes('remember')) {
    return `The Knowledge Vault stores important information. Add entries to build up your team's memory. This persists across sessions.`;
  }
  
  // Help
  if (lowerMessage.includes('help') || lowerMessage.includes('what can')) {
    return `I'm ${agent}, your Mission Control assistant. I can help you:\n\n• Manage agents and tasks\n• Create and run workflows\n• Store knowledge and memories\n• Monitor system health\n\nWhat would you like to work on?`;
  }
  
  // Default
  const responses = [
    "I understand. Let me know if you need me to take any action.",
    "Got it. I'm tracking this in the system.",
    "Acknowledged. Would you like me to create a task or workflow for this?",
    "I'm on it. I'll coordinate with the team if needed.",
    "Understood. Check the relevant panel for updates.",
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

// GET endpoint for health check
export async function GET() {
  return NextResponse.json({
    status: 'connected',
    mode: 'instant',
    note: 'Messages sync in real-time via InstantDB',
  });
}