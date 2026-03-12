// 8-Bit Office Space Component
import { useState, useEffect } from "react";
import { id } from "@instantdb/react";
import { db } from "@/lib/db";

interface Agent {
  id: string;
  name: string;
  role: string;
  emoji?: string;
  model: string;
  status: "active" | "idle" | "offline";
  x?: number;
  y?: number;
  targetX?: number;
  targetY?: number;
  direction?: "left" | "right" | "up" | "down";
  walking?: boolean;
  atDesk?: boolean;
}

interface OfficeSpaceProps {
  agents: Agent[];
}

// Agent sprite colors based on status
const getAgentColor = (status: string) => {
  switch (status) {
    case "active": return "from-green-500 to-green-600";
    case "idle": return "from-yellow-500 to-yellow-600";
    case "offline": return "from-gray-500 to-gray-600";
    default: return "from-gray-500 to-gray-600";
  }
};

// 8-bit pixel art avatar component
function PixelAvatar({ agent, size = "md" }: { agent: Agent; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-6 h-6 text-[8px]",
    md: "w-10 h-10 text-xs",
    lg: "w-16 h-16 text-lg"
  };
  
  return (
    <div className={`${sizeClasses[size]} rounded-sm bg-gradient-to-br ${getAgentColor(agent.status)} flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`} style={{ imageRendering: "pixelated" }}>
      <span className="drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]">{agent.emoji || "🤖"}</span>
    </div>
  );
}

// Desk component with 8-bit style
function Desk({ agent, position }: { agent?: Agent; position: { x: number; y: number } }) {
  return (
    <div 
      className="absolute"
      style={{ left: position.x, top: position.y }}
    >
      {/* Desk surface */}
      <div className="w-24 h-16 bg-gradient-to-b from-amber-700 to-amber-800 border-2 border-amber-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]">
        {/* Desk items */}
        <div className="flex items-start justify-between p-1">
          {/* Computer */}
          <div className="w-8 h-6 bg-gray-800 border border-gray-600 rounded-sm">
            <div className="w-full h-4 bg-blue-400 m-0.5" style={{ imageRendering: "pixelated" }} />
          </div>
          {/* Coffee cup */}
          {agent && (
            <div className="w-4 h-4 bg-white rounded-full border border-gray-300" />
          )}
        </div>
      </div>
      
      {/* Chair */}
      <div className="w-12 h-8 mx-auto -mt-1 bg-gradient-to-b from-gray-700 to-gray-800 border-2 border-gray-900 rounded-b-sm" />
      
      {/* Agent at desk */}
      {agent && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <PixelAvatar agent={agent} size="sm" />
        </div>
      )}
      
      {/* Agent name */}
      {agent && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <span className="text-[9px] font-bold text-white bg-black/80 px-1 rounded" style={{ imageRendering: "pixelated" }}>
            {agent.name}
          </span>
        </div>
      )}
    </div>
  );
}

// Walking agent animation
function WalkingAgent({ agent }: { agent: Agent }) {
  const [frame, setFrame] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(f => (f + 1) % 4);
    }, 200);
    return () => clearInterval(interval);
  }, []);
  
  // Walking animation offsets
  const bobOffset = frame % 2 === 0 ? 0 : 2;
  
  return (
    <div 
      className="absolute transition-all duration-200"
      style={{ 
        left: agent.x, 
        top: (agent.y || 0) + bobOffset,
        imageRendering: "pixelated"
      }}
    >
      <div className="relative">
        {/* Shadow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-2 bg-black/30 rounded-full blur-sm" />
        
        {/* Agent body */}
        <div className="animate-bounce" style={{ animationDuration: "0.4s" }}>
          <PixelAvatar agent={agent} size="md" />
        </div>
        
        {/* Name tag */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <span className="text-[8px] font-bold text-white bg-black/80 px-1 rounded">
            {agent.name}
          </span>
        </div>
        
        {/* Walking feet animation */}
        <div className="absolute -bottom-1 left-1 flex gap-1">
          <div className={`w-2 h-1 bg-gray-800 rounded-sm ${frame % 2 === 0 ? 'translate-x-0.5' : '-translate-x-0.5'}`} />
          <div className={`w-2 h-1 bg-gray-800 rounded-sm ${frame % 2 === 0 ? '-translate-x-0.5' : 'translate-x-0.5'}`} />
        </div>
      </div>
    </div>
  );
}

// Main Office Space component
export function OfficeSpace({ agents }: OfficeSpaceProps) {
  const [walkingAgents, setWalkingAgents] = useState<Agent[]>([]);
  const [time, setTime] = useState(0);
  
  // Default agent positions
  const defaultAgents: Agent[] = [
    { id: "nova", name: "Nova", role: "CEO", emoji: "🤖", model: "glm-5:cloud", status: "active" },
    { id: "alex", name: "Alex", role: "Researcher", emoji: "🔍", model: "glm-5:cloud", status: "idle" },
    { id: "maya", name: "Maya", role: "Writer", emoji: "✍️", model: "glm-5:cloud", status: "active" },
    { id: "sam", name: "Sam", role: "Social Media", emoji: "📱", model: "glm-5:cloud", status: "offline" },
    { id: "jordan", name: "Jordan", role: "Marketing", emoji: "📈", model: "glm-5:cloud", status: "idle" },
  ];
  
  const displayAgents = agents.length > 0 ? agents : defaultAgents;
  
  // Desk positions
  const deskPositions = {
    // CEO desk (Nova) - corner office
    ceo: { x: 50, y: 50 },
    // Regular desks
    desk1: { x: 300, y: 100 },
    desk2: { x: 500, y: 100 },
    desk3: { x: 300, y: 250 },
    desk4: { x: 500, y: 250 },
    desk5: { x: 700, y: 100 },
    desk6: { x: 700, y: 250 },
  };
  
  // Initialize walking agents
  useEffect(() => {
    const walkers = displayAgents
      .filter(a => a.status === "idle")
      .map((agent, i) => ({
        ...agent,
        x: 100 + (i * 150) % 400,
        y: 350 + Math.floor(i / 3) * 50,
        targetX: 100 + Math.random() * 600,
        targetY: 300 + Math.random() * 100,
        walking: true,
      }));
    setWalkingAgents(walkers as Agent[]);
  }, [displayAgents]);
  
  // Animate walking agents
  useEffect(() => {
    const interval = setInterval(() => {
      setWalkingAgents(prev => prev.map(agent => {
        if (!agent.walking) return agent;
        
        // Move towards target
        const dx = (agent.targetX || 0) - (agent.x || 0);
        const dy = (agent.targetY || 0) - (agent.y || 0);
        const speed = 2;
        
        let newX = (agent.x || 0) + (dx > 0 ? Math.min(speed, dx) : Math.max(-speed, dx));
        let newY = (agent.y || 0) + (dy > 0 ? Math.min(speed, dy) : Math.max(-speed, dy));
        
        // Check if reached target
        const reached = Math.abs(dx) < speed && Math.abs(dy) < speed;
        
        if (reached) {
          // Pick new random target
          return {
            ...agent,
            x: newX,
            y: newY,
            targetX: 100 + Math.random() * 600,
            targetY: 300 + Math.random() * 100,
          };
        }
        
        return {
          ...agent,
          x: newX,
          y: newY,
        };
      }));
      
      setTime(t => t + 1);
    }, 50);
    
    return () => clearInterval(interval);
  }, []);
  
  // Agents at desks
  const agentAtCEO = displayAgents.find(a => a.name === "Nova");
  const agentsAtDesks = displayAgents.filter(a => a.name !== "Nova" && a.status === "active");
  const idleAgents = displayAgents.filter(a => a.status === "idle");
  
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border shrink-0">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <span className="text-2xl">🏢</span>
          Office Space
        </h2>
        <p className="text-sm text-muted mt-1">
          {displayAgents.filter(a => a.status === "active").length} working • {displayAgents.filter(a => a.status === "idle").length} walking around • {displayAgents.filter(a => a.status === "offline").length} offline
        </p>
      </div>
      
      {/* Office Canvas */}
      <div className="flex-1 overflow-hidden relative" style={{ imageRendering: "pixelated" }}>
        {/* Floor background */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(90deg, rgba(139, 90, 43, 0.1) 1px, transparent 1px),
              linear-gradient(rgba(139, 90, 43, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "32px 32px",
            backgroundColor: "#f5e6d3"
          }}
        />
        
        {/* Office walls */}
        <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-gray-700 to-gray-600 border-b-2 border-gray-800" />
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-gray-700 to-gray-600 border-t-2 border-gray-800" />
        <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-gray-700 to-gray-600 border-r-2 border-gray-800" />
        <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-gray-700 to-gray-600 border-l-2 border-gray-800" />
        
        {/* CEO Office (corner) */}
        <div className="absolute top-8 left-8 w-56 h-48 bg-gradient-to-br from-amber-100 to-amber-50 border-4 border-amber-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]">
          {/* CEO sign */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-red-700 px-3 py-1 border-2 border-red-900">
            <span className="text-white font-bold text-xs">CEO</span>
          </div>
          
          {/* CEO desk */}
          <Desk position={{ x: 16, y: 24 }} agent={agentAtCEO} />
          
          {/* Window */}
          <div className="absolute top-2 right-2 w-12 h-20 bg-gradient-to-b from-blue-300 to-blue-400 border-2 border-amber-700">
            <div className="absolute inset-1 bg-gradient-to-br from-blue-200 to-blue-300" />
          </div>
          
          {/* Plant */}
          <div className="absolute bottom-2 right-4 text-2xl">🪴</div>
        </div>
        
        {/* Regular desks */}
        <Desk position={deskPositions.desk1} agent={agentsAtDesks[0]} />
        <Desk position={deskPositions.desk2} agent={agentsAtDesks[1]} />
        <Desk position={deskPositions.desk3} agent={agentsAtDesks[2]} />
        <Desk position={deskPositions.desk4} agent={agentsAtDesks[3]} />
        
        {/* Empty desks */}
        <Desk position={deskPositions.desk5} />
        <Desk position={deskPositions.desk6} />
        
        {/* Walking agents */}
        {walkingAgents.map((agent) => (
          <WalkingAgent key={agent.id} agent={agent} />
        ))}
        
        {/* Office decorations */}
        <div className="absolute top-8 right-12 text-4xl">🖼️</div>
        <div className="absolute bottom-12 left-12 text-3xl">🪴</div>
        <div className="absolute bottom-12 right-12 text-3xl">🪴</div>
        
        {/* Water cooler */}
        <div className="absolute top-20 right-8 text-3xl">💧</div>
        
        {/* Coffee machine */}
        <div className="absolute top-40 right-8 text-3xl">☕</div>
        
        {/* Meeting table */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-48 h-24 bg-gradient-to-b from-amber-600 to-amber-700 border-2 border-amber-800 rounded-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs text-white bg-black/50 px-2 py-1 rounded">
            Meeting Room
          </div>
        </div>
        
        {/* Status legend */}
        <div className="absolute top-4 right-4 bg-card/90 border border-border rounded-lg p-3 text-xs">
          <div className="font-semibold mb-2">Status</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-green-500" />
              <span>Working at desk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-yellow-500" />
              <span>Walking around</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-gray-500" />
              <span>Offline</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}