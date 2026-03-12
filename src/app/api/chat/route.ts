import { NextRequest, NextResponse } from 'next/server';

const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || 'http://127.0.0.1:18789';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, agentId, conversationId } = body;

    // For now, all messages go to Nova (main agent)
    // In the future, we can route to specific agents
    const gatewayPayload = {
      message,
      conversationId: conversationId || 'mission-control',
      channel: 'mission-control',
      // Agent-specific routing would happen here
    };

    // Send to OpenClaw Gateway
    const response = await fetch(`${GATEWAY_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(gatewayPayload),
    });

    if (!response.ok) {
      // If Gateway isn't available, return a simulated response
      return NextResponse.json({
        response: `[${agentId || 'Nova'}] Gateway connection pending. To enable real-time chat:\n\n1. Ensure OpenClaw Gateway is running (port 18789)\n2. Set OPENCLAW_GATEWAY_URL env variable\n3. Restart Mission Control\n\nFor now, I'm running in demo mode.`,
        status: 'demo',
      });
    }

    const data = await response.json();
    return NextResponse.json({
      response: data.response || data.message || data.content,
      status: 'live',
    });

  } catch (error) {
    console.error('Chat API error:', error);
    
    // Return demo response if Gateway isn't available
    const agentName = request.json ? 'Nova' : 'Nova';
    const responses = [
      "I'm here to help. What would you like me to work on?",
      "Understood. Let me process that request.",
      "I'll coordinate with the team on this.",
      "Got it. I'll start working on that right away.",
    ];
    
    return NextResponse.json({
      response: `[${agentName}] ${responses[Math.floor(Math.random() * responses.length)]}\n\n*(Gateway offline - running in demo mode)*`,
      status: 'demo',
    });
  }
}

// Stream endpoint for real-time responses
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const message = searchParams.get('message');
  const agentId = searchParams.get('agentId') || 'Nova';

  if (!message) {
    return NextResponse.json({ error: 'Message required' }, { status: 400 });
  }

  // For streaming, we'd connect to Gateway's SSE endpoint
  // For now, return a simple response
  return new Response(
    JSON.stringify({
      response: `[${agentId}] Received: "${message}"\n\nConnect to Gateway at port 18789 for real-time responses.`,
      status: 'demo',
    }),
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}