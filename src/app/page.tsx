"use client";

import { db } from "@/lib/db";
import { useState, useRef, useEffect } from "react";
import { id } from "@instantdb/react";

// Types
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
}

interface Task {
  id: string;
  title: string;
  status: "inbox" | "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high" | "critical";
  createdAt: number;
}

interface Knowledge {
  id: string;
  category: string;
  content: string;
  importance: string;
  source: string;
  createdAt: number;
}

interface Agent {
  id: string;
  name: string;
  role: string;
  emoji?: string;
  model: string;
  status: "active" | "idle" | "offline";
  workspace?: string;
  lastActive?: number;
}

interface Workflow {
  id: string;
  name: string;
  description?: string;
  status: "running" | "paused" | "stopped";
  schedule?: string;
  lastRun?: number;
  nextRun?: number;
  createdAt: number;
  agents?: string[]; // agent ids
  steps?: WorkflowStep[];
}

interface WorkflowStep {
  id: string;
  agentId: string;
  action: string;
  order: number;
}

interface Cron {
  id: string;
  name: string;
  schedule: string;
  command: string;
  enabled: boolean;
  lastRun?: number;
  nextRun?: number;
  createdAt: number;
}

interface Heartbeat {
  id: string;
  type: "morning" | "evening" | "custom";
  schedule: string;
  channel: string;
  enabled: boolean;
  lastRun?: number;
  createdAt: number;
}

// Main App
export default function MissionControl() {
  const [activeTab, setActiveTab] = useState<"chat" | "tasks" | "knowledge" | "agents" | "workflows" | "crons" | "heartbeat">("chat");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  
  // Real-time data from InstantDB
  const { isLoading, data } = db.useQuery({
    messages: {},
    tasks: {},
    knowledge: {},
    agents: {},
    workflows: {},
    crons: {},
    heartbeats: {},
  });

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />
      
      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 overflow-hidden ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Header />
        
        <div className="h-[calc(100vh-4rem)] overflow-hidden">
          {activeTab === "chat" && <ChatPanel messages={data?.messages || []} selectedAgent={selectedAgent} setSelectedAgent={setSelectedAgent} />}
          {activeTab === "tasks" && <TasksPanel tasks={data?.tasks || []} />}
          {activeTab === "knowledge" && <KnowledgePanel knowledge={data?.knowledge || []} />}
          {activeTab === "agents" && <AgentsPanel agents={data?.agents || []} onSelectAgent={setSelectedAgent} selectedAgent={selectedAgent} />}
          {activeTab === "workflows" && <WorkflowsPanel workflows={data?.workflows || []} agents={data?.agents || []} onSelectWorkflow={setSelectedWorkflow} />}
          {activeTab === "crons" && <CronsPanel crons={data?.crons || []} />}
          {activeTab === "heartbeat" && <HeartbeatPanel heartbeats={data?.heartbeats || []} />}
        </div>
      </main>
      
      {/* Agent Detail Modal */}
      {selectedAgent && !selectedAgent.id.startsWith('default-') && (
        <AgentDetailModal agent={selectedAgent} onClose={() => setSelectedAgent(null)} />
      )}
      
      {/* Workflow Detail Modal */}
      {selectedWorkflow && !selectedWorkflow.id.startsWith('default-') && (
        <WorkflowDetailModal workflow={selectedWorkflow} agents={data?.agents || []} onClose={() => setSelectedWorkflow(null)} />
      )}
    </div>
  );
}

// Loading Screen
function LoadingScreen() {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center animate-pulse-glow">
          <span className="text-2xl">🤖</span>
        </div>
        <h1 className="text-xl font-semibold text-glow-red">Mission Control</h1>
        <p className="text-muted text-sm mt-2">Initializing...</p>
      </div>
    </div>
  );
}

// Sidebar
function Sidebar({ activeTab, setActiveTab, collapsed, setCollapsed }: { 
  activeTab: "chat" | "tasks" | "knowledge" | "agents" | "workflows" | "crons" | "heartbeat";
  setActiveTab: (tab: typeof activeTab) => void;
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
}) {
  const navItems = [
    { id: "chat" as const, name: "Command Center", icon: "💬" },
    { id: "agents" as const, name: "Agent Network", icon: "🤖" },
    { id: "tasks" as const, name: "Task Control", icon: "📋" },
    { id: "workflows" as const, name: "Workflows", icon: "⚡" },
    { id: "knowledge" as const, name: "Knowledge Vault", icon: "🧠" },
    { id: "crons" as const, name: "Cron Jobs", icon: "⏰" },
    { id: "heartbeat" as const, name: "Heartbeat", icon: "💓" },
  ];

  return (
    <aside className={`fixed left-0 top-0 h-screen bg-card/50 backdrop-blur-xl border-r border-border transition-all duration-300 z-50 ${collapsed ? 'w-16' : 'w-64'}`}>
      {/* Logo */}
      <div className="flex items-center gap-3 h-16 px-4 border-b border-border">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center glow-red-sm shrink-0">
          <span className="text-lg">🤖</span>
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="font-semibold text-sm whitespace-nowrap">Mission Control</h1>
            <span className="text-xs text-muted whitespace-nowrap">v2.0</span>
          </div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto p-1.5 rounded-lg hover:bg-card-hover text-muted hover:text-foreground transition-colors"
        >
          {collapsed ? "→" : "←"}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-2 space-y-1 overflow-y-auto h-[calc(100vh-8rem)]">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
              activeTab === item.id
                ? "bg-gradient-to-r from-red-600/20 to-red-800/10 text-red-400 border border-red-600/30"
                : "text-muted hover:bg-card-hover hover:text-foreground"
            } ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? item.name : undefined}
          >
            <span className="text-lg">{item.icon}</span>
            {!collapsed && item.name}
          </button>
        ))}
      </nav>

      {/* Status */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
        <div className="flex items-center gap-2 text-xs text-muted">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          {!collapsed && <span>Nova Online</span>}
        </div>
        {!collapsed && (
          <div className="text-xs text-muted mt-1">
            <span className="font-mono">glm-5:cloud</span>
          </div>
        )}
      </div>
    </aside>
  );
}

// Header
function Header() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 border-b border-border bg-card/30 backdrop-blur-xl px-6 flex items-center justify-between shrink-0">
      <div>
        <h2 className="font-semibold">Mission Control</h2>
        <p className="text-xs text-muted">AI-powered operations hub</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-sm font-mono">{time.toLocaleTimeString()}</div>
          <div className="text-xs text-muted">{time.toLocaleDateString()}</div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-border">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-xs text-muted">System Online</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
            <span className="text-xs">S</span>
          </div>
          <span className="text-sm font-medium">Sevreign</span>
        </div>
      </div>
    </header>
  );
}

// Chat Panel - Master Control with Nova
function ChatPanel({ messages, selectedAgent, setSelectedAgent }: { 
  messages: Message[];
  selectedAgent: Agent | null;
  setSelectedAgent: (a: Agent | null) => void;
}) {
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [tokens, setTokens] = useState({ used: 0, total: 203000 });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const sortedMessages = [...messages].sort((a, b) => a.createdAt - b.createdAt);

  const sendMessage = async () => {
    if (!input.trim() || isSending) return;

    const messageText = input.trim();
    setInput("");
    setIsSending(true);

    // Simulate token usage
    const tokensUsed = messageText.split(' ').length * 2;
    setTokens(prev => ({ ...prev, used: prev.used + tokensUsed }));

    try {
      await db.transact(
        db.tx.messages[id()].update({
          role: "user",
          content: messageText,
          createdAt: Date.now(),
        })
      );

      // Simulate AI response
      setTimeout(async () => {
        const responses = [
          "I understand. Let me process that and get back to you.",
          "Working on it. I'll coordinate with the agents if needed.",
          "Got it. I'm analyzing the situation and will provide recommendations.",
          "Acknowledged. I'll track this in the knowledge vault.",
          "I've noted this. Would you like me to create a task or workflow for this?",
        ];
        
        await db.transact(
          db.tx.messages[id()].update({
            role: "assistant",
            content: responses[Math.floor(Math.random() * responses.length)],
            createdAt: Date.now(),
          })
        );
        
        setTokens(prev => ({ ...prev, used: prev.used + Math.floor(Math.random() * 100) + 50 }));
        setIsSending(false);
      }, 800);
    } catch (error) {
      console.error("Error sending message:", error);
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sortedMessages]);

  return (
    <div className="h-full flex">
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {sortedMessages.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center glow-red">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-lg font-semibold text-glow-red">Nova</h3>
              <p className="text-muted text-sm mt-2">Master Control - Talk to me about anything</p>
              <p className="text-muted text-xs mt-1">Or click on an agent in the Agent Network to chat with them</p>
            </div>
          )}
          
          {sortedMessages.map((msg) => (
            <div key={msg.id} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shrink-0">
                  <span className="text-xs">N</span>
                </div>
              )}
              <div className={`max-w-[75%] rounded-xl px-4 py-2 ${msg.role === "user" ? "bg-gradient-to-br from-red-600 to-red-700 text-white glow-red-sm" : "bg-card border border-border"}`}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <p className="text-[10px] mt-1 text-muted">{new Date(msg.createdAt).toLocaleTimeString()}</p>
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center shrink-0">
                  <span className="text-xs">S</span>
                </div>
              )}
            </div>
          ))}
          
          {isSending && (
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shrink-0">
                <span className="text-xs">N</span>
              </div>
              <div className="bg-card border border-border rounded-xl px-4 py-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border bg-card/30">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              disabled={isSending}
              className="flex-1 bg-card border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-red-500/50"
            />
            <button
              onClick={sendMessage}
              disabled={isSending || !input.trim()}
              className="px-4 py-2.5 bg-gradient-to-br from-red-600 to-red-700 rounded-lg text-sm font-medium hover:from-red-500 hover:to-red-600 transition-all disabled:opacity-50 glow-red-sm"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Context Panel with Token Display */}
      <div className="w-72 border-l border-border bg-card/30 p-4 overflow-y-auto">
        <h3 className="font-semibold text-sm mb-4">Context</h3>
        
        <div className="space-y-4">
          {/* Token Usage */}
          <div className="glass rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-muted">Tokens</div>
              <div className="text-xs text-muted">{Math.round((tokens.used / tokens.total) * 100)}%</div>
            </div>
            <div className="w-full h-2 bg-background rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-300"
                style={{ width: `${Math.min((tokens.used / tokens.total) * 100, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-xs">
              <span className="font-mono">{tokens.used.toLocaleString()}</span>
              <span className="text-muted">/ {tokens.total.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="glass rounded-lg p-3">
            <div className="text-xs text-muted mb-1">Model</div>
            <div className="font-mono text-sm">glm-5:cloud</div>
          </div>
          
          <div className="glass rounded-lg p-3">
            <div className="text-xs text-muted mb-1">Session</div>
            <div className="font-mono text-sm text-green-400">Active</div>
          </div>

          {/* Quick Actions */}
          <div className="glass rounded-lg p-3">
            <div className="text-xs text-muted mb-2">Quick Actions</div>
            <div className="space-y-1">
              <button 
                onClick={() => {/* Open agent modal */}}
                className="w-full text-left text-xs px-2 py-1.5 rounded bg-card hover:bg-card-hover transition-colors"
              >
                🤖 Create Agent
              </button>
              <button 
                onClick={() => {/* Open workflow modal */}}
                className="w-full text-left text-xs px-2 py-1.5 rounded bg-card hover:bg-card-hover transition-colors"
              >
                ⚡ New Workflow
              </button>
              <button 
                onClick={() => {/* Open task modal */}}
                className="w-full text-left text-xs px-2 py-1.5 rounded bg-card hover:bg-card-hover transition-colors"
              >
                📝 Add Task
              </button>
              <button 
                onClick={() => {/* Open memory modal */}}
                className="w-full text-left text-xs px-2 py-1.5 rounded bg-card hover:bg-card-hover transition-colors"
              >
                🧠 Add Memory
              </button>
            </div>
          </div>

          {/* Agent Status */}
          <div className="glass rounded-lg p-3">
            <div className="text-xs text-muted mb-2">Active Agents</div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs">Nova (You)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <span className="text-xs">Alex - Idle</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs">Maya - Writing</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Agent Detail Modal - Individual Chat with Agent
function AgentDetailModal({ agent, onClose }: { agent: Agent; onClose: () => void }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Array<{ role: "user" | "agent"; content: string; time: number }>>([]);
  const [isSending, setIsSending] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || isSending) return;
    
    const userMsg = { role: "user" as const, content: input.trim(), time: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsSending(true);

    // Simulate agent response
    setTimeout(() => {
      const responses = [
        `I'm ${agent.name}, your ${agent.role}. How can I help?`,
        `I'll handle this task. Let me process the request.`,
        `Understood. I'll coordinate with other agents if needed.`,
        `Working on it. I'll update you when done.`,
      ];
      setMessages(prev => [...prev, { 
        role: "agent", 
        content: responses[Math.floor(Math.random() * responses.length)], 
        time: Date.now() 
      }]);
      setIsSending(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-2xl">
              {agent.emoji || "🤖"}
            </div>
            <div>
              <h2 className="font-semibold">{agent.name}</h2>
              <p className="text-sm text-muted">{agent.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded text-xs ${agent.status === "active" ? "bg-green-500/20 text-green-400" : agent.status === "idle" ? "bg-yellow-500/20 text-yellow-400" : "bg-gray-500/20 text-gray-400"}`}>
              {agent.status}
            </span>
            <button onClick={onClose} className="text-muted hover:text-foreground text-xl">×</button>
          </div>
        </div>

        {/* Agent Info */}
        <div className="p-4 border-b border-border bg-background/50">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted">Model:</span>
              <span className="ml-2 font-mono">{agent.model}</span>
            </div>
            <div>
              <span className="text-muted">Workspace:</span>
              <span className="ml-2">{agent.workspace || "Default"}</span>
            </div>
            <div>
              <span className="text-muted">Last Active:</span>
              <span className="ml-2">{agent.lastActive ? new Date(agent.lastActive).toLocaleString() : "Now"}</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px]">
          {messages.length === 0 && (
            <div className="text-center py-8 text-muted">
              <p>Start a conversation with {agent.name}</p>
              <p className="text-xs mt-2">Messages here are private to this agent</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "agent" && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shrink-0">
                  <span className="text-xs">{agent.emoji || "🤖"}</span>
                </div>
              )}
              <div className={`max-w-[70%] rounded-xl px-3 py-2 ${msg.role === "user" ? "bg-gradient-to-br from-violet-600 to-violet-700 text-white" : "bg-card border border-border"}`}>
                <p className="text-sm">{msg.content}</p>
              </div>
            </div>
          ))}
          {isSending && (
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shrink-0">
                <span className="text-xs">{agent.emoji || "🤖"}</span>
              </div>
              <div className="bg-card border border-border rounded-xl px-3 py-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder={`Message ${agent.name}...`}
              disabled={isSending}
              className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500/50"
            />
            <button
              onClick={sendMessage}
              disabled={isSending || !input.trim()}
              className="px-4 py-2 bg-gradient-to-br from-red-600 to-red-700 rounded-lg text-sm hover:from-red-500 hover:to-red-600 transition-all disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Workflow Detail Modal - Extra Large for Big Workflows
function WorkflowDetailModal({ workflow, agents, onClose }: { 
  workflow: Workflow; 
  agents: Agent[];
  onClose: () => void;
}) {
  const [name, setName] = useState(workflow.name);
  const [description, setDescription] = useState(workflow.description || "");
  const [status, setStatus] = useState(workflow.status);
  const [schedule, setSchedule] = useState(workflow.schedule || "");
  const [steps, setSteps] = useState<WorkflowStep[]>(workflow.steps || [
    { id: "step-1", agentId: "", action: "Initialize workflow", order: 1 },
    { id: "step-2", agentId: "", action: "Process data", order: 2 },
    { id: "step-3", agentId: "", action: "Output results", order: 3 },
  ]);

  // Default agents if none from DB
  const displayAgents = agents.length > 0 ? agents : [
    { id: "agent-nova", name: "Nova", role: "Primary Operator", emoji: "🤖", model: "glm-5:cloud", status: "active" },
    { id: "agent-alex", name: "Alex", role: "Researcher", emoji: "🔍", model: "glm-5:cloud", status: "idle" },
    { id: "agent-maya", name: "Maya", role: "Writer", emoji: "✍️", model: "glm-5:cloud", status: "active" },
    { id: "agent-sam", name: "Sam", role: "Social Media", emoji: "📱", model: "glm-5:cloud", status: "offline" },
    { id: "agent-jordan", name: "Jordan", role: "Marketing", emoji: "📈", model: "glm-5:cloud", status: "idle" },
  ];

  const addStep = () => {
    setSteps(prev => [...prev, { 
      id: `step-${Date.now()}`, 
      agentId: "", 
      action: "", 
      order: prev.length + 1 
    }]);
  };

  const removeStep = (stepId: string) => {
    setSteps(prev => prev.filter(s => s.id !== stepId).map((s, i) => ({ ...s, order: i + 1 })));
  };

  const updateStep = (stepId: string, field: "agentId" | "action", value: string) => {
    setSteps(prev => prev.map(s => s.id === stepId ? { ...s, [field]: value } : s));
  };

  const moveStepUp = (stepId: string) => {
    setSteps(prev => {
      const idx = prev.findIndex(s => s.id === stepId);
      if (idx <= 0) return prev;
      const newSteps = [...prev];
      [newSteps[idx - 1], newSteps[idx]] = [newSteps[idx], newSteps[idx - 1]];
      return newSteps.map((s, i) => ({ ...s, order: i + 1 }));
    });
  };

  const moveStepDown = (stepId: string) => {
    setSteps(prev => {
      const idx = prev.findIndex(s => s.id === stepId);
      if (idx >= prev.length - 1) return prev;
      const newSteps = [...prev];
      [newSteps[idx], newSteps[idx + 1]] = [newSteps[idx + 1], newSteps[idx]];
      return newSteps.map((s, i) => ({ ...s, order: i + 1 }));
    });
  };

  const saveWorkflow = async () => {
    // In production, this would save to InstantDB
    // For now, just close
    console.log("Saving workflow:", { name, description, status, schedule, steps });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-xl">Edit Workflow</h2>
            <p className="text-sm text-muted mt-1">Define the sequence of agent tasks</p>
          </div>
          <button onClick={onClose} className="text-muted hover:text-foreground text-2xl p-2 hover:bg-card-hover rounded-lg transition-colors">×</button>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* Left Panel - Workflow Details */}
          <div className="w-80 border-r border-border p-6 overflow-y-auto">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted mb-1 block">Workflow Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500/50"
                />
              </div>

              <div>
                <label className="text-sm text-muted mb-1 block">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500/50 h-24 resize-none"
                />
              </div>

              <div>
                <label className="text-sm text-muted mb-1 block">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as typeof status)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500/50"
                >
                  <option value="running">🟢 Running</option>
                  <option value="paused">🟡 Paused</option>
                  <option value="stopped">🔴 Stopped</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-muted mb-1 block">Schedule (Cron)</label>
                <input
                  type="text"
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                  placeholder="0 10 * * *"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500/50 font-mono"
                />
                <p className="text-xs text-muted mt-1">e.g., "0 10 * * *" = Daily at 10am</p>
              </div>

              {/* Workflow Stats */}
              <div className="glass rounded-xl p-4 mt-4">
                <h4 className="text-sm font-semibold mb-3">Workflow Stats</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted">Total Steps</span>
                    <span className="font-mono">{steps.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Assigned Agents</span>
                    <span className="font-mono">{steps.filter(s => s.agentId).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Unassigned</span>
                    <span className="font-mono text-yellow-400">{steps.filter(s => !s.agentId).length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Steps Editor */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Steps Header */}
            <div className="p-4 border-b border-border flex items-center justify-between bg-background/50">
              <div>
                <h3 className="font-semibold">Workflow Steps</h3>
                <p className="text-xs text-muted">Drag to reorder, assign agents to each step</p>
              </div>
              <button
                onClick={addStep}
                className="px-4 py-2 bg-gradient-to-br from-red-600 to-red-700 rounded-lg text-sm hover:from-red-500 hover:to-red-600 transition-all"
              >
                + Add Step
              </button>
            </div>

            {/* Steps List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {steps.map((step, index) => {
                const assignedAgent = displayAgents.find(a => a.id === step.agentId);
                return (
                  <div 
                    key={step.id} 
                    className="glass rounded-xl p-4 border border-border hover:border-red-500/30 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      {/* Step Number */}
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-lg font-bold shrink-0">
                        {index + 1}
                      </div>

                      {/* Step Content */}
                      <div className="flex-1 space-y-3">
                        {/* Agent Assignment */}
                        <div>
                          <label className="text-xs text-muted mb-1 block">Assign Agent</label>
                          <select
                            value={step.agentId}
                            onChange={(e) => updateStep(step.id, "agentId", e.target.value)}
                            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500/50"
                          >
                            <option value="">-- Select Agent --</option>
                            {displayAgents.map((agent) => (
                              <option key={agent.id} value={agent.id}>
                                {agent.emoji || "🤖"} {agent.name} - {agent.role}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Action */}
                        <div>
                          <label className="text-xs text-muted mb-1 block">Task / Action</label>
                          <input
                            type="text"
                            value={step.action}
                            onChange={(e) => updateStep(step.id, "action", e.target.value)}
                            placeholder="What should this agent do?"
                            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500/50"
                          />
                        </div>

                        {/* Assigned Agent Preview */}
                        {assignedAgent && (
                          <div className="flex items-center gap-2 text-xs bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2">
                            <span>{assignedAgent.emoji || "🤖"}</span>
                            <span className="font-medium">{assignedAgent.name}</span>
                            <span className="text-muted">will execute this step</span>
                          </div>
                        )}
                      </div>

                      {/* Step Actions */}
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => moveStepUp(step.id)}
                          disabled={index === 0}
                          className="p-1.5 rounded bg-card border border-border hover:bg-card-hover disabled:opacity-30 disabled:cursor-not-allowed text-xs"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveStepDown(step.id)}
                          disabled={index === steps.length - 1}
                          className="p-1.5 rounded bg-card border border-border hover:bg-card-hover disabled:opacity-30 disabled:cursor-not-allowed text-xs"
                        >
                          ↓
                        </button>
                        <button
                          onClick={() => removeStep(step.id)}
                          className="p-1.5 rounded bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 text-xs mt-2"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {steps.length === 0 && (
                <div className="text-center py-12 text-muted">
                  <div className="text-4xl mb-4">📋</div>
                  <p>No steps yet. Add your first step to get started.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-border flex justify-between items-center bg-background/50">
          <div className="text-sm text-muted">
            {steps.filter(s => !s.agentId).length > 0 && (
              <span className="text-yellow-400">⚠️ {steps.filter(s => !s.agentId).length} unassigned steps</span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-background border border-border rounded-lg text-sm hover:bg-card-hover transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={saveWorkflow}
              className="px-6 py-2.5 bg-gradient-to-br from-red-600 to-red-700 rounded-lg text-sm hover:from-red-500 hover:to-red-600 transition-all"
            >
              Save Workflow
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// [Rest of the panels remain the same - TasksPanel, KnowledgePanel, AgentsPanel, WorkflowsPanel, CronsPanel, HeartbeatPanel]
// [Truncated for brevity - they would be the same as before but with updated types]

// Tasks Panel (Kanban) - Same as before
function TasksPanel({ tasks }: { tasks: Task[] }) {
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"low" | "medium" | "high" | "critical">("medium");
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const columns = [
    { id: "inbox" as const, title: "Inbox", color: "from-gray-600 to-gray-700" },
    { id: "todo" as const, title: "To Do", color: "from-blue-600 to-blue-700" },
    { id: "in_progress" as const, title: "In Progress", color: "from-yellow-600 to-yellow-700" },
    { id: "done" as const, title: "Done", color: "from-green-600 to-green-700" },
  ];

  const addTask = async () => {
    if (!newTaskTitle.trim()) return;
    await db.transact(db.tx.tasks[id()].update({ title: newTaskTitle.trim(), status: "inbox", priority: newTaskPriority, createdAt: Date.now() }));
    setNewTaskTitle("");
  };

  const moveTask = async (taskId: string, newStatus: Task["status"]) => {
    await db.transact(db.tx.tasks[taskId].update({ status: newStatus }));
  };

  const deleteTask = async (taskId: string) => {
    await db.transact(db.tx.tasks[taskId].delete());
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "border-l-red-500";
      case "high": return "border-l-orange-500";
      case "medium": return "border-l-yellow-500";
      case "low": return "border-l-green-500";
      default: return "border-l-gray-500";
    }
  };

  const tasksByStatus = columns.reduce((acc, col) => {
    acc[col.id] = tasks.filter((t) => t.status === col.id).sort((a, b) => b.createdAt - a.createdAt);
    return acc;
  }, {} as Record<string, Task[]>);

  return (
    <div className="h-full p-6 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h2 className="text-xl font-semibold">Task Control</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            placeholder="Add a task..."
            className="bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500/50 w-48"
          />
          <select value={newTaskPriority} onChange={(e) => setNewTaskPriority(e.target.value as typeof newTaskPriority)} className="bg-card border border-border rounded-lg px-3 py-2 text-sm">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          <button onClick={addTask} className="px-4 py-2 bg-gradient-to-br from-red-600 to-red-700 rounded-lg text-sm glow-red-sm">Add</button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 flex-1 overflow-hidden">
        {columns.map((column) => (
          <div key={column.id} className="flex flex-col bg-card/50 rounded-xl border border-border overflow-hidden"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => draggedTask && moveTask(draggedTask.id, column.id)}>
            <div className={`p-3 rounded-t-xl bg-gradient-to-r ${column.color}`}>
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm">{column.title}</h3>
                <span className="text-xs opacity-75">{tasksByStatus[column.id]?.length || 0}</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => draggedTask && moveTask(draggedTask.id, column.id)}>
              {tasksByStatus[column.id]?.map((task) => (
                <div key={task.id} draggable onDragStart={() => setDraggedTask(task)} onDragEnd={() => setDraggedTask(null)}
                  className={`glass rounded-lg p-3 cursor-move hover:border-red-500/50 transition-all border-l-4 ${getPriorityColor(task.priority)}`}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm flex-1">{task.title}</p>
                    <button onClick={() => deleteTask(task.id)} className="text-muted hover:text-red-400 text-xs">×</button>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-muted">{task.priority}</span>
                    <span className="text-[10px] text-muted">{new Date(task.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
              {tasksByStatus[column.id]?.length === 0 && (
                <div className="text-center py-8 text-muted text-xs">Drop tasks here</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Knowledge Panel - Same as before
function KnowledgePanel({ knowledge }: { knowledge: Knowledge[] }) {
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [newItem, setNewItem] = useState({ category: "user", content: "", importance: "medium", source: "" });
  const [showAdd, setShowAdd] = useState(false);

  const categories = ["user", "task", "knowledge", "research", "project"];
  const importances = ["low", "medium", "high", "critical"];

  const addKnowledge = async () => {
    if (!newItem.content.trim()) return;
    await db.transact(db.tx.knowledge[id()].update({ ...newItem, source: newItem.source || "manual", createdAt: Date.now() }));
    setNewItem({ category: "user", content: "", importance: "medium", source: "" });
    setShowAdd(false);
  };

  const deleteKnowledge = async (id: string) => {
    await db.transact(db.tx.knowledge[id].delete());
  };

  const filteredKnowledge = knowledge
    .filter((k) => filter === "all" || k.category === filter)
    .filter((k) => k.content.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.createdAt - a.createdAt);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "user": return "from-violet-600 to-violet-700";
      case "task": return "from-blue-600 to-blue-700";
      case "knowledge": return "from-green-600 to-green-700";
      case "research": return "from-purple-600 to-purple-700";
      case "project": return "from-orange-600 to-orange-700";
      default: return "from-gray-600 to-gray-700";
    }
  };

  const getImportanceBadge = (importance: string) => {
    switch (importance) {
      case "critical": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "high": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "low": return "bg-green-500/20 text-green-400 border-green-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div className="h-full p-6 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h2 className="text-xl font-semibold">Knowledge Vault</h2>
        <div className="flex gap-2">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..."
            className="bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500/50 w-48" />
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="bg-card border border-border rounded-lg px-3 py-2 text-sm">
            <option value="all">All Categories</option>
            {categories.map((cat) => (<option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>))}
          </select>
          <button onClick={() => setShowAdd(!showAdd)} className="px-4 py-2 bg-gradient-to-br from-red-600 to-red-700 rounded-lg text-sm glow-red-sm">+ Add</button>
        </div>
      </div>

      {showAdd && (
        <div className="glass rounded-xl p-4 mb-4 border border-red-500/30 shrink-0">
          <div className="grid grid-cols-4 gap-3 mb-3">
            <select value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })} className="bg-card border border-border rounded-lg px-3 py-2 text-sm">
              {categories.map((cat) => (<option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>))}
            </select>
            <select value={newItem.importance} onChange={(e) => setNewItem({ ...newItem, importance: e.target.value })} className="bg-card border border-border rounded-lg px-3 py-2 text-sm">
              {importances.map((imp) => (<option key={imp} value={imp}>{imp.charAt(0).toUpperCase() + imp.slice(1)}</option>))}
            </select>
            <input type="text" value={newItem.source} onChange={(e) => setNewItem({ ...newItem, source: e.target.value })} placeholder="Source"
              className="bg-card border border-border rounded-lg px-3 py-2 text-sm col-span-2" />
          </div>
          <textarea value={newItem.content} onChange={(e) => setNewItem({ ...newItem, content: e.target.value })} placeholder="What should I remember?"
            className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm mb-3 h-20 resize-none" />
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 bg-card border border-border rounded-lg text-sm hover:bg-card-hover transition-colors">Cancel</button>
            <button onClick={addKnowledge} className="px-4 py-2 bg-gradient-to-br from-red-600 to-red-700 rounded-lg text-sm">Save</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 flex-1 overflow-y-auto">
        {filteredKnowledge.map((item) => (
          <div key={item.id} className="glass rounded-xl overflow-hidden border border-border hover:border-red-500/30 transition-all">
            <div className={`p-2 bg-gradient-to-r ${getCategoryColor(item.category)}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase">{item.category}</span>
                <button onClick={() => deleteKnowledge(item.id)} className="text-white/60 hover:text-white text-xs">×</button>
              </div>
            </div>
            <div className="p-4">
              <p className="text-sm mb-3">{item.content}</p>
              <div className="flex items-center justify-between text-xs">
                <span className={`px-2 py-0.5 rounded border ${getImportanceBadge(item.importance)}`}>{item.importance}</span>
                <span className="text-muted">{item.source}</span>
              </div>
            </div>
          </div>
        ))}
        {filteredKnowledge.length === 0 && (
          <div className="col-span-3 text-center py-12 text-muted">
            <div className="text-4xl mb-4">🧠</div>
            <p>No memories yet. Add something to remember.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Agents Panel - Updated with agent creation and interaction
function AgentsPanel({ agents, onSelectAgent, selectedAgent }: { 
  agents: Agent[]; 
  onSelectAgent: (agent: Agent | null) => void;
  selectedAgent: Agent | null;
}) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAgent, setNewAgent] = useState({ 
    name: "", 
    role: "", 
    emoji: "🤖", 
    model: "glm-5:cloud", 
    status: "idle" as const,
    personality: "",
    mission: "",
    workspace: ""
  });

  const defaultAgents: Agent[] = [
    { id: "default-nova", name: "Nova", role: "Primary Operator", emoji: "🤖", model: "glm-5:cloud", status: "active" },
    { id: "default-alex", name: "Alex", role: "Researcher", emoji: "🔍", model: "glm-5:cloud", status: "idle" },
    { id: "default-maya", name: "Maya", role: "Writer", emoji: "✍️", model: "glm-5:cloud", status: "active" },
    { id: "default-sam", name: "Sam", role: "Social Media", emoji: "📱", model: "glm-5:cloud", status: "offline" },
    { id: "default-jordan", name: "Jordan", role: "Marketing", emoji: "📈", model: "glm-5:cloud", status: "idle" },
  ];

  const displayAgents = agents.length > 0 ? agents : defaultAgents;

  const createAgent = async () => {
    if (!newAgent.name.trim()) return;
    
    // Create agent with all fields including personality and mission
    await db.transact(db.tx.agents[id()].update({ 
      name: newAgent.name,
      role: newAgent.role,
      emoji: newAgent.emoji,
      model: newAgent.model,
      status: newAgent.status,
      workspace: newAgent.workspace || `/agents/${newAgent.name.toLowerCase()}`,
      // Personality and mission would be stored in the agent's SOUL.md file
      createdAt: Date.now()
    }));
    
    // In production, this would also create:
    // - /agents/{name}/MEMORY.md
    // - /agents/{name}/SOUL.md
    
    setNewAgent({ 
      name: "", 
      role: "", 
      emoji: "🤖", 
      model: "glm-5:cloud", 
      status: "idle",
      personality: "",
      mission: "",
      workspace: ""
    });
    setShowCreateModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500";
      case "idle": return "bg-yellow-500";
      case "offline": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="h-full p-6 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h2 className="text-xl font-semibold">Agent Network</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-gradient-to-br from-red-600 to-red-700 rounded-lg text-sm glow-red-sm"
        >
          + Create Agent
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-1 overflow-y-auto">
        {displayAgents.map((agent) => (
          <div 
            key={agent.id} 
            onClick={() => !agent.id.startsWith('default-') && onSelectAgent(agent)}
            className={`glass rounded-xl p-4 border border-border hover:border-red-500/30 transition-all cursor-pointer ${selectedAgent?.id === agent.id ? 'border-red-500/50 bg-red-500/5' : ''}`}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-2xl shrink-0">
                {agent.emoji || "🤖"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{agent.name}</h3>
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(agent.status)}`} />
                </div>
                <p className="text-sm text-muted mb-2">{agent.role}</p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2 py-0.5 rounded bg-card border border-border font-mono">{agent.model}</span>
                  <span className={`capitalize ${agent.status === "active" ? "text-green-400" : agent.status === "idle" ? "text-yellow-400" : "text-muted"}`}>
                    {agent.status}
                  </span>
                </div>
              </div>
            </div>
            {!agent.id.startsWith('default-') && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-xs text-muted">Click to chat with {agent.name}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create Agent Modal - Large */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowCreateModal(false)}>
          <div className="bg-card border border-border rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-xl">Create New Agent</h3>
                <p className="text-sm text-muted mt-1">Give your agent a personality and mission</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-muted hover:text-foreground text-2xl p-2 hover:bg-card-hover rounded-lg transition-colors">×</button>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Left Column - Basic Info */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm text-muted uppercase tracking-wide">Basic Info</h4>
                  
                  <div>
                    <label className="text-sm text-muted mb-1 block">Agent Name</label>
                    <input
                      type="text"
                      value={newAgent.name}
                      onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                      placeholder="e.g., Alex, Maya, Sam..."
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500/50"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-muted mb-1 block">Role / Title</label>
                    <input
                      type="text"
                      value={newAgent.role}
                      onChange={(e) => setNewAgent({ ...newAgent, role: e.target.value })}
                      placeholder="e.g., Researcher, Writer, Marketing..."
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted mb-1 block">Emoji</label>
                      <input
                        type="text"
                        value={newAgent.emoji}
                        onChange={(e) => setNewAgent({ ...newAgent, emoji: e.target.value })}
                        placeholder="🤖"
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500/50"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-muted mb-1 block">Model</label>
                      <select
                        value={newAgent.model}
                        onChange={(e) => setNewAgent({ ...newAgent, model: e.target.value })}
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500/50"
                      >
                        <option value="glm-5:cloud">GLM-5 Cloud</option>
                        <option value="gpt-4">GPT-4</option>
                        <option value="claude-3">Claude 3</option>
                        <option value="gemini-pro">Gemini Pro</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-muted mb-1 block">Initial Status</label>
                    <select
                      value={newAgent.status}
                      onChange={(e) => setNewAgent({ ...newAgent, status: e.target.value as typeof newAgent.status })}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500/50"
                    >
                      <option value="idle">🟡 Idle</option>
                      <option value="active">🟢 Active</option>
                      <option value="offline">⚫ Offline</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm text-muted mb-1 block">Workspace Path</label>
                    <input
                      type="text"
                      value={newAgent.workspace}
                      onChange={(e) => setNewAgent({ ...newAgent, workspace: e.target.value })}
                      placeholder="/agents/{name}"
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500/50 font-mono text-xs"
                    />
                    <p className="text-xs text-muted mt-1">Memory.md and SOUL.md will be created here</p>
                  </div>
                </div>

                {/* Right Column - Personality & Mission */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm text-muted uppercase tracking-wide">Personality & Soul</h4>
                  
                  <div>
                    <label className="text-sm text-muted mb-1 block">Base Personality</label>
                    <textarea
                      value={newAgent.personality}
                      onChange={(e) => setNewAgent({ ...newAgent, personality: e.target.value })}
                      placeholder="Describe the agent's personality traits, communication style, and behavioral tendencies...

e.g., 'Alex is analytical and thorough. Prefers data-driven decisions. Communicates concisely. Always cites sources. Curious and loves deep dives.'"
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500/50 h-40 resize-none"
                    />
                    <p className="text-xs text-muted mt-1">Stored in agent's SOUL.md</p>
                  </div>

                  <div>
                    <label className="text-sm text-muted mb-1 block">Mission & Goals</label>
                    <textarea
                      value={newAgent.mission}
                      onChange={(e) => setNewAgent({ ...newAgent, mission: e.target.value })}
                      placeholder="Define the agent's primary mission, goals, and what success looks like...

e.g., 'Mission: Research and compile comprehensive information on assigned topics.
Goals:
- Find reliable sources and verify facts
- Summarize findings in actionable format
- Flag knowledge gaps for further research
Success: Deliver accurate, well-sourced research reports.'"
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500/50 h-40 resize-none"
                    />
                    <p className="text-xs text-muted mt-1">Stored in agent's MEMORY.md</p>
                  </div>

                  {/* Agent Preview */}
                  <div className="glass rounded-xl p-4 border border-red-500/30">
                    <h5 className="text-sm font-semibold mb-2">Preview</h5>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-xl">
                        {newAgent.emoji || "🤖"}
                      </div>
                      <div>
                        <div className="font-semibold">{newAgent.name || "New Agent"}</div>
                        <div className="text-xs text-muted">{newAgent.role || "Role"}</div>
                      </div>
                      <div className={`ml-auto px-2 py-1 rounded text-xs ${newAgent.status === "active" ? "bg-green-500/20 text-green-400" : newAgent.status === "idle" ? "bg-yellow-500/20 text-yellow-400" : "bg-gray-500/20 text-gray-400"}`}>
                        {newAgent.status}
                      </div>
                    </div>
                    {newAgent.personality && (
                      <p className="text-xs text-muted mt-3 line-clamp-2">{newAgent.personality}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border flex justify-between items-center">
              <div className="text-xs text-muted">
                <span className="text-red-400">📝</span> Creates: MEMORY.md, SOUL.md, workspace folder
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-2.5 bg-background border border-border rounded-lg text-sm hover:bg-card-hover transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createAgent}
                  disabled={!newAgent.name.trim()}
                  className="px-6 py-2.5 bg-gradient-to-br from-red-600 to-red-700 rounded-lg text-sm hover:from-red-500 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Agent
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Workflows Panel - Updated with click-to-view and create
function WorkflowsPanel({ workflows, agents, onSelectWorkflow }: { 
  workflows: Workflow[]; 
  agents: Agent[];
  onSelectWorkflow: (workflow: Workflow | null) => void;
}) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState({ name: "", description: "", schedule: "", status: "paused" as const });

  const defaultWorkflows: Workflow[] = [
    { id: "default-revenue", name: "Revenue Engine", description: "Automated revenue generation pipeline", status: "running", schedule: "Daily", nextRun: Date.now() + 3600000, createdAt: Date.now() },
    { id: "default-twitter", name: "Twitter Growth", description: "Post and engage on X/Twitter", status: "running", schedule: "7x daily", nextRun: Date.now() + 1800000, createdAt: Date.now() },
    { id: "default-morning", name: "Morning Brief", description: "Daily briefing to Telegram", status: "running", schedule: "10:00 AM", nextRun: Date.now() + 7200000, createdAt: Date.now() },
  ];

  const displayWorkflows = workflows.length > 0 ? workflows : defaultWorkflows;

  const createWorkflow = async () => {
    if (!newWorkflow.name.trim()) return;
    await db.transact(db.tx.workflows[id()].update({ ...newWorkflow, createdAt: Date.now() }));
    setNewWorkflow({ name: "", description: "", schedule: "", status: "paused" });
    setShowCreateModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running": return "bg-green-500";
      case "paused": return "bg-yellow-500";
      case "stopped": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="h-full p-6 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h2 className="text-xl font-semibold">Workflows</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-gradient-to-br from-red-600 to-red-700 rounded-lg text-sm glow-red-sm"
        >
          + Create Workflow
        </button>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto">
        {displayWorkflows.map((workflow) => (
          <div 
            key={workflow.id} 
            onClick={() => !workflow.id.startsWith('default-') && onSelectWorkflow(workflow)}
            className={`glass rounded-xl p-4 border border-border hover:border-red-500/30 transition-all ${!workflow.id.startsWith('default-') ? 'cursor-pointer' : ''}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(workflow.status)} animate-pulse`} />
                <h3 className="font-semibold">{workflow.name}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted">{workflow.schedule}</span>
                <div className={`px-2 py-1 rounded text-xs ${workflow.status === "running" ? "bg-green-500/20 text-green-400" : workflow.status === "paused" ? "bg-yellow-500/20 text-yellow-400" : "bg-red-500/20 text-red-400"}`}>
                  {workflow.status}
                </div>
              </div>
            </div>
            <p className="text-sm text-muted mb-3">{workflow.description}</p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted">Next run: {workflow.nextRun ? new Date(workflow.nextRun).toLocaleString() : "Not scheduled"}</span>
              {!workflow.id.startsWith('default-') && (
                <span className="text-red-400">Click to edit →</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Workflow Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowCreateModal(false)}>
          <div className="bg-card border border-border rounded-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-lg mb-4">Create New Workflow</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted mb-1 block">Name</label>
                <input
                  type="text"
                  value={newWorkflow.name}
                  onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
                  placeholder="Workflow name..."
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500/50"
                />
              </div>
              <div>
                <label className="text-sm text-muted mb-1 block">Description</label>
                <textarea
                  value={newWorkflow.description}
                  onChange={(e) => setNewWorkflow({ ...newWorkflow, description: e.target.value })}
                  placeholder="What does this workflow do?"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500/50 h-20 resize-none"
                />
              </div>
              <div>
                <label className="text-sm text-muted mb-1 block">Schedule (Cron)</label>
                <input
                  type="text"
                  value={newWorkflow.schedule}
                  onChange={(e) => setNewWorkflow({ ...newWorkflow, schedule: e.target.value })}
                  placeholder="0 10 * * * (daily at 10am)"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500/50"
                />
              </div>
              <div>
                <label className="text-sm text-muted mb-1 block">Status</label>
                <select
                  value={newWorkflow.status}
                  onChange={(e) => setNewWorkflow({ ...newWorkflow, status: e.target.value as typeof newWorkflow.status })}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500/50"
                >
                  <option value="paused">Paused</option>
                  <option value="running">Running</option>
                  <option value="stopped">Stopped</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 bg-background border border-border rounded-lg text-sm">Cancel</button>
              <button onClick={createWorkflow} className="px-4 py-2 bg-gradient-to-br from-red-600 to-red-700 rounded-lg text-sm">Create Workflow</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Crons Panel - Same as before
function CronsPanel({ crons }: { crons: Cron[] }) {
  const defaultCrons: Cron[] = [
    { id: "default-1", name: "Morning Brief", schedule: "0 10 * * *", command: "Send daily briefing to Telegram", enabled: true, nextRun: Date.now() + 3600000, createdAt: Date.now() },
    { id: "default-2", name: "Twitter Post", schedule: "0 10,12,14,16,18,20,22 * * *", command: "Post to X/Twitter", enabled: true, nextRun: Date.now() + 1800000, createdAt: Date.now() },
    { id: "default-3", name: "Engagement Check", schedule: "0 11,13,15 * * *", command: "Reply to trending tweets", enabled: false, createdAt: Date.now() },
  ];

  const displayCrons = crons.length > 0 ? crons : defaultCrons;

  return (
    <div className="h-full p-6 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h2 className="text-xl font-semibold">Cron Jobs</h2>
        <button className="px-4 py-2 bg-gradient-to-br from-red-600 to-red-700 rounded-lg text-sm glow-red-sm">+ Add Cron</button>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto">
        {displayCrons.map((cron) => (
          <div key={cron.id} className="glass rounded-xl p-4 border border-border hover:border-red-500/30 transition-all">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{cron.name}</h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={cron.enabled} className="sr-only peer" />
                <div className="w-9 h-5 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
            <p className="text-sm text-muted mb-2">{cron.command}</p>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <code className="px-2 py-1 rounded bg-card border border-border font-mono text-red-400">{cron.schedule}</code>
                <span className="text-muted">Next: {cron.nextRun ? new Date(cron.nextRun).toLocaleString() : "Not scheduled"}</span>
              </div>
              <span className={`px-2 py-1 rounded ${cron.enabled ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}`}>
                {cron.enabled ? "Active" : "Paused"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Heartbeat Panel - Same as before
function HeartbeatPanel({ heartbeats }: { heartbeats: Heartbeat[] }) {
  const defaultHeartbeats: Heartbeat[] = [
    { id: "default-1", type: "morning", schedule: "10:00 AM America/Los_Angeles", channel: "telegram", enabled: true, lastRun: Date.now() - 3600000, createdAt: Date.now() },
    { id: "default-2", type: "evening", schedule: "6:00 PM America/Los_Angeles", channel: "telegram", enabled: false, createdAt: Date.now() },
  ];

  const displayHeartbeats = heartbeats.length > 0 ? heartbeats : defaultHeartbeats;

  return (
    <div className="h-full p-6 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h2 className="text-xl font-semibold">💓 Heartbeat</h2>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm text-muted">System Healthy</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 shrink-0">
        <div className="glass rounded-xl p-4 border border-border">
          <div className="text-sm text-muted mb-1">Uptime</div>
          <div className="text-2xl font-mono">99.9%</div>
        </div>
        <div className="glass rounded-xl p-4 border border-border">
          <div className="text-sm text-muted mb-1">Last Check</div>
          <div className="text-2xl font-mono">{new Date().toLocaleTimeString()}</div>
        </div>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto">
        {displayHeartbeats.map((heartbeat) => (
          <div key={heartbeat.id} className="glass rounded-xl p-4 border border-border hover:border-red-500/30 transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{heartbeat.type === "morning" ? "🌅" : heartbeat.type === "evening" ? "🌙" : "🔔"}</span>
                <div>
                  <h3 className="font-semibold capitalize">{heartbeat.type} Briefing</h3>
                  <p className="text-xs text-muted">{heartbeat.channel}</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={heartbeat.enabled} className="sr-only peer" />
                <div className="w-9 h-5 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between text-xs">
              <code className="px-2 py-1 rounded bg-card border border-border">{heartbeat.schedule}</code>
              <span className="text-muted">
                Last run: {heartbeat.lastRun ? new Date(heartbeat.lastRun).toLocaleString() : "Never"}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-4 glass rounded-xl border border-red-500/30 shrink-0">
        <h4 className="font-semibold mb-2">📋 Heartbeat Contents</h4>
        <ul className="text-sm text-muted space-y-1">
          <li>• Check urgent items across active projects</li>
          <li>• Get weather for Los Angeles, CA</li>
          <li>• Review Twitter Growth Schedule (10am daily)</li>
          <li>• Check open issues (WhiteDragon ComfyUI, etc.)</li>
          <li>• Flag items marked NEEDS_HUMAN</li>
        </ul>
      </div>
    </div>
  );
}