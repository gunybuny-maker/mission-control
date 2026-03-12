// 8-Bit Office Space Component - Full Page
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
  talking?: boolean;
  talkingTo?: string;
}

interface OfficeSpaceProps {
  agents: Agent[];
}

// Agent sprite colors based on status
const getAgentColor = (status: string) => {
  switch (status) {
    case "active": return "from-green-500 to-green-600";
    case "idle": return "from-yellow-500 to-yellow-600";
    case "offline": return "from-gray-400 to-gray-500";
    default: return "from-gray-400 to-gray-500";
  }
};

// 8-bit pixel art avatar component
function PixelAvatar({ agent, size = "md" }: { agent: Agent; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-base",
    lg: "w-16 h-16 text-xl"
  };
  
  return (
    <div className={`${sizeClasses[size]} rounded-sm bg-gradient-to-br ${getAgentColor(agent.status)} flex items-center justify-center border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]`} style={{ imageRendering: "pixelated" }}>
      <span className="drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">{agent.emoji || "🤖"}</span>
    </div>
  );
}

// Walking agent animation
function WalkingAgent({ agent, allAgents }: { agent: Agent; allAgents: Agent[] }) {
  const [frame, setFrame] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(f => (f + 1) % 4);
    }, 150);
    return () => clearInterval(interval);
  }, []);
  
  const bobOffset = frame % 2 === 0 ? 0 : 3;
  
  // Check if talking to someone
  const isTalking = agent.talking && agent.talkingTo;
  const talkingPartner = isTalking ? allAgents.find(a => a.id === agent.talkingTo) : null;
  
  return (
    <div 
      className="absolute transition-all duration-75"
      style={{ 
        left: agent.x, 
        top: (agent.y || 0) + bobOffset,
        zIndex: Math.floor((agent.y || 0) / 10)
      }}
    >
      <div className="relative">
        {/* Shadow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-2 bg-black/20 rounded-full blur-sm" />
        
        {/* Agent body with walking animation */}
        <div className="animate-bounce" style={{ animationDuration: "0.5s", imageRendering: "pixelated" }}>
          <PixelAvatar agent={agent} size="md" />
        </div>
        
        {/* Speech bubble if talking */}
        {isTalking && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white border-2 border-black rounded-lg px-2 py-1 text-[8px] font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            💬
          </div>
        )}
        
        {/* Name tag */}
        <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <span className="text-[10px] font-bold text-white bg-black/80 px-1.5 py-0.5 rounded border border-white/30">
            {agent.name}
          </span>
        </div>
        
        {/* Status indicator */}
        <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-black ${
          agent.status === "active" ? "bg-green-500" : 
          agent.status === "idle" ? "bg-yellow-500" : "bg-gray-500"
        }`} />
        
        {/* Walking feet animation */}
        <div className="absolute -bottom-1 left-1.5 flex gap-0.5">
          <div className={`w-2.5 h-1.5 bg-gray-900 rounded-sm transition-transform ${frame % 2 === 0 ? 'translate-x-0.5' : '-translate-x-0.5'}`} />
          <div className={`w-2.5 h-1.5 bg-gray-900 rounded-sm transition-transform ${frame % 2 === 0 ? '-translate-x-0.5' : 'translate-x-0.5'}`} />
        </div>
      </div>
    </div>
  );
}

// Desk component - larger
function Desk({ agent, position, index }: { agent?: Agent; position: { x: number; y: number }; index: number }) {
  const deskColors = [
    "from-amber-700 to-amber-800",
    "from-amber-600 to-amber-700",
    "from-orange-700 to-orange-800",
    "from-yellow-700 to-yellow-800",
  ];
  
  return (
    <div 
      className="absolute"
      style={{ left: position.x, top: position.y }}
    >
      {/* Desk surface */}
      <div className={`w-32 h-20 bg-gradient-to-b ${deskColors[index % deskColors.length]} border-3 border-amber-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.4)]`}>
        {/* Desk items */}
        <div className="flex items-start justify-between p-2">
          {/* Computer monitor */}
          <div className="w-12 h-10 bg-gray-900 border-2 border-gray-700 rounded-sm">
            <div className="w-full h-7 bg-blue-400 m-0.5 border border-blue-300" style={{ imageRendering: "pixelated" }}>
              <div className="w-full h-1 bg-blue-300 mt-1" />
              <div className="w-3/4 h-0.5 bg-blue-300 mt-0.5" />
              <div className="w-1/2 h-0.5 bg-blue-300 mt-0.5" />
            </div>
          </div>
          {/* Coffee mug */}
          {agent && (
            <div className="flex flex-col items-center">
              <div className="w-5 h-5 bg-white rounded-full border-2 border-gray-300" style={{ imageRendering: "pixelated" }}>
                <div className="w-2 h-2 bg-amber-800 rounded-full m-0.5" />
              </div>
              <div className="w-3 h-1 bg-gray-400 rounded-full mt-0.5" />
            </div>
          )}
        </div>
      </div>
      
      {/* Chair */}
      <div className="w-16 h-10 mx-auto -mt-1 bg-gradient-to-b from-gray-700 to-gray-800 border-2 border-gray-900 rounded-b-lg">
        {/* Chair back */}
        <div className="w-14 h-6 bg-gray-800 rounded-t-lg border-2 border-gray-700 mx-auto" />
      </div>
      
      {/* Agent at desk */}
      {agent && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2">
          <PixelAvatar agent={agent} size="md" />
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <span className="text-[10px] font-bold text-white bg-black/80 px-1.5 py-0.5 rounded">
              {agent.name}
            </span>
          </div>
        </div>
      )}
      
      {/* Agent name plate (empty desks) */}
      {!agent && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
          <span className="text-[9px] text-gray-500">Empty Desk</span>
        </div>
      )}
    </div>
  );
}

// Main Office Space component
export function OfficeSpace({ agents }: OfficeSpaceProps) {
  const [walkingAgents, setWalkingAgents] = useState<Agent[]>([]);
  const [talkingPairs, setTalkingPairs] = useState<string[][]>([]);
  
  // Default agents
  const defaultAgents: Agent[] = [
    { id: "nova", name: "Nova", role: "CEO", emoji: "🤖", model: "glm-5:cloud", status: "active" },
    { id: "alex", name: "Alex", role: "Researcher", emoji: "🔍", model: "glm-5:cloud", status: "idle" },
    { id: "maya", name: "Maya", role: "Writer", emoji: "✍️", model: "glm-5:cloud", status: "active" },
    { id: "sam", name: "Sam", role: "Social Media", emoji: "📱", model: "glm-5:cloud", status: "offline" },
    { id: "jordan", name: "Jordan", role: "Marketing", emoji: "📈", model: "glm-5:cloud", status: "idle" },
  ];
  
  const displayAgents = agents.length > 0 ? agents : defaultAgents;
  
  // CEO desk position (corner office)
  const ceoDeskPos = { x: 40, y: 40 };
  
  // Regular desk positions - spread across the office
  const deskPositions = [
    { x: 350, y: 80 },
    { x: 550, y: 80 },
    { x: 750, y: 80 },
    { x: 350, y: 280 },
    { x: 550, y: 280 },
    { x: 750, y: 280 },
    { x: 950, y: 80 },
    { x: 950, y: 280 },
  ];
  
  // Initialize walking agents - ALL agents including offline ones walk around
  useEffect(() => {
    const walkers = displayAgents
      .filter(a => a.status !== "active") // Active agents at desks, others walk
      .map((agent, i) => ({
        ...agent,
        x: 200 + (i * 180) % 800,
        y: 450 + Math.floor(i / 4) * 80,
        targetX: 100 + Math.random() * 900,
        targetY: 400 + Math.random() * 200,
        walking: true,
        talking: false,
      }));
    setWalkingAgents(walkers as Agent[]);
  }, [displayAgents]);
  
  // Animate walking agents
  useEffect(() => {
    const interval = setInterval(() => {
      setWalkingAgents(prev => prev.map(agent => {
        if (!agent.walking) return agent;
        
        const dx = (agent.targetX || 0) - (agent.x || 0);
        const dy = (agent.targetY || 0) - (agent.y || 0);
        const speed = 3;
        
        let newX = (agent.x || 0) + (dx > 0 ? Math.min(speed, dx) : Math.max(-speed, dx));
        let newY = (agent.y || 0) + (dy > 0 ? Math.min(speed, dy) : Math.max(-speed, dy));
        
        // Constrain to office bounds
        newX = Math.max(100, Math.min(1000, newX));
        newY = Math.max(380, Math.min(650, newY));
        
        const reached = Math.abs(dx) < speed && Math.abs(dy) < speed;
        
        if (reached) {
          // Pick new random target
          return {
            ...agent,
            x: newX,
            y: newY,
            targetX: 100 + Math.random() * 900,
            targetY: 400 + Math.random() * 200,
          };
        }
        
        return {
          ...agent,
          x: newX,
          y: newY,
        };
      }));
    }, 30);
    
    return () => clearInterval(interval);
  }, []);
  
  // Occasionally make agents talk to each other
  useEffect(() => {
    const interval = setInterval(() => {
      if (walkingAgents.length >= 2 && Math.random() > 0.7) {
        // Pick two random agents to talk
        const shuffled = [...walkingAgents].sort(() => Math.random() - 0.5);
        const agent1 = shuffled[0];
        const agent2 = shuffled[1];
        
        // Make them walk towards each other and talk
        setWalkingAgents(prev => prev.map(a => {
          if (a.id === agent1.id) {
            return { ...a, targetX: agent2.x, targetY: agent2.y, talking: true, talkingTo: agent2.id };
          }
          if (a.id === agent2.id) {
            return { ...a, targetX: agent1.x, targetY: agent1.y, talking: true, talkingTo: agent1.id };
          }
          return a;
        }));
        
        // Clear talking after 3 seconds
        setTimeout(() => {
          setWalkingAgents(prev => prev.map(a => ({ ...a, talking: false, talkingTo: undefined })));
        }, 3000);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [walkingAgents]);
  
  // Agents at desks
  const agentAtCEO = displayAgents.find(a => a.name === "Nova");
  const agentsAtDesks = displayAgents.filter(a => a.name !== "Nova" && a.status === "active");
  
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border shrink-0">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <span className="text-2xl">🏢</span>
          Office Space
        </h2>
        <p className="text-sm text-muted mt-1">
          {displayAgents.filter(a => a.status === "active").length} at desks • {displayAgents.filter(a => a.status !== "active").length} walking around
        </p>
      </div>
      
      {/* Office Canvas - Full Page */}
      <div className="flex-1 overflow-hidden relative" style={{ imageRendering: "pixelated" }}>
        {/* Floor background */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(90deg, rgba(139, 90, 43, 0.15) 2px, transparent 2px),
              linear-gradient(rgba(139, 90, 43, 0.15) 2px, transparent 2px)
            `,
            backgroundSize: "48px 48px",
            backgroundColor: "#f5e6d3"
          }}
        />
        
        {/* Office walls */}
        <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-gray-800 to-gray-700 border-b-2 border-gray-900" />
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-gray-800 to-gray-700 border-t-2 border-gray-900" />
        <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-gray-800 to-gray-700 border-r-2 border-gray-900" />
        <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-gray-800 to-gray-700 border-l-2 border-gray-900" />
        
        {/* CEO Office (corner) */}
        <div className="absolute top-8 left-8 w-72 h-64 bg-gradient-to-br from-amber-50 to-amber-100 border-4 border-amber-700 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.4)]" style={{ imageRendering: "pixelated" }}>
          {/* CEO sign */}
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-red-700 px-4 py-1 border-3 border-red-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-white font-bold text-sm tracking-wide">CEO</span>
          </div>
          
          {/* CEO desk */}
          <Desk position={{ x: 24, y: 40 }} agent={agentAtCEO} index={0} />
          
          {/* Window */}
          <div className="absolute top-8 right-8 w-20 h-28 bg-gradient-to-b from-blue-300 to-blue-400 border-3 border-amber-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]">
            <div className="absolute inset-1 bg-gradient-to-br from-blue-200 to-blue-300">
              <div className="absolute top-1 left-1 right-1 h-1 bg-white/50" />
              <div className="absolute bottom-2 left-1 right-1 h-1 bg-white/30" />
            </div>
          </div>
          
          {/* Decorations */}
          <div className="absolute bottom-8 right-8 text-4xl">🪴</div>
          <div className="absolute top-16 left-4 text-2xl">🏆</div>
          
          {/* Name plate */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-b from-amber-100 to-amber-200 border-2 border-amber-400 px-3 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]">
            <span className="text-xs font-bold text-amber-900">Nova</span>
          </div>
        </div>
        
        {/* Regular desks */}
        {deskPositions.slice(0, agentsAtDesks.length + 2).map((pos, i) => (
          <Desk key={i} position={pos} agent={agentsAtDesks[i]} index={i} />
        ))}
        
        {/* Walking agents - ALL including offline */}
        {walkingAgents.map((agent) => (
          <WalkingAgent key={agent.id} agent={agent} allAgents={walkingAgents} />
        ))}
        
        {/* Office decorations */}
        <div className="absolute top-8 right-24 text-4xl">🖼️</div>
        <div className="absolute top-24 right-24 text-3xl">🖼️</div>
        
        {/* Plants */}
        <div className="absolute bottom-12 left-12 text-4xl">🪴</div>
        <div className="absolute bottom-12 right-12 text-4xl">🪴</div>
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-4xl">🪴</div>
        
        {/* Water cooler and coffee */}
        <div className="absolute top-20 right-16 text-3xl">💧</div>
        <div className="absolute top-36 right-16 text-3xl">☕</div>
        <div className="absolute top-52 right-16 text-3xl">🖨️</div>
        
        {/* Meeting table */}
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 w-64 h-32 bg-gradient-to-b from-amber-600 to-amber-700 border-3 border-amber-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]" style={{ imageRendering: "pixelated" }}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs text-white bg-black/60 px-2 py-1 rounded">
            Meeting Room
          </div>
        </div>
        
        {/* Status legend */}
        <div className="absolute top-4 right-4 bg-card/95 border-2 border-border rounded-lg p-4 shadow-lg" style={{ imageRendering: "pixelated" }}>
          <div className="font-bold text-sm mb-2">Status</div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm bg-green-500 border border-black" />
              <span>Working at desk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm bg-yellow-500 border border-black" />
              <span>Walking around</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm bg-gray-400 border border-black" />
              <span>Offline (still visible)</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-border text-[10px] text-muted">
            💬 = Agents talking
          </div>
        </div>
        
        {/* Office clock */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 text-3xl bg-white border-2 border-gray-300 rounded-full w-12 h-12 flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]">
          🕐
        </div>
      </div>
    </div>
  );
}