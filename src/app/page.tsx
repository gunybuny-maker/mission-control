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

// Main App
export default function MissionControl() {
  const [activeTab, setActiveTab] = useState<"chat" | "tasks" | "knowledge">("chat");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Real-time data from InstantDB
  const { isLoading, data } = db.useQuery({
    messages: {},
    tasks: {},
    knowledge: {},
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
      <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Header />
        
        {activeTab === "chat" && <ChatPanel messages={data?.messages || []} />}
        {activeTab === "tasks" && <TasksPanel tasks={data?.tasks || []} />}
        {activeTab === "knowledge" && <KnowledgePanel knowledge={data?.knowledge || []} />}
      </main>
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
  activeTab: "chat" | "tasks" | "knowledge";
  setActiveTab: (tab: "chat" | "tasks" | "knowledge") => void;
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
}) {
  const navItems = [
    { id: "chat" as const, name: "Command Center", icon: "💬" },
    { id: "tasks" as const, name: "Task Control", icon: "📋" },
    { id: "knowledge" as const, name: "Knowledge Vault", icon: "🧠" },
  ];

  return (
    <aside className={`fixed left-0 top-0 h-screen bg-card/50 backdrop-blur-xl border-r border-border transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
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
      <nav className="p-2 space-y-1">
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
    <header className="h-16 border-b border-border bg-card/30 backdrop-blur-xl px-6 flex items-center justify-between">
      <div>
        <h2 className="font-semibold">Command Center</h2>
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

// Chat Panel
function ChatPanel({ messages }: { messages: Message[] }) {
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sort messages by createdAt
  const sortedMessages = [...messages].sort((a, b) => a.createdAt - b.createdAt);

  const sendMessage = async () => {
    if (!input.trim() || isSending) return;

    const messageText = input.trim();
    setInput("");
    setIsSending(true);

    try {
      // Save user message to InstantDB
      await db.transact(
        db.tx.messages[id()].update({
          role: "user",
          content: messageText,
          createdAt: Date.now(),
        })
      );

      // In production, this would call OpenClaw gateway
      // For now, simulate a response
      setTimeout(async () => {
        await db.transact(
          db.tx.messages[id()].update({
            role: "assistant",
            content: "I received your message. In production, this would connect to OpenClaw's AI for a real response. The real-time sync is working - open this in another tab to see messages appear instantly!",
            createdAt: Date.now(),
          })
        );
        setIsSending(false);
      }, 500);
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

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sortedMessages]);

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {sortedMessages.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center glow-red">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-lg font-semibold text-glow-red">Nova</h3>
              <p className="text-muted text-sm mt-2">What can I help you with?</p>
            </div>
          )}
          
          {sortedMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shrink-0">
                  <span className="text-xs">N</span>
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-xl px-4 py-2 ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-red-600 to-red-700 text-white glow-red-sm"
                    : "bg-card border border-border"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <p className="text-[10px] mt-1 text-muted">
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </p>
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
              className="flex-1 bg-card border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 disabled:opacity-50"
            />
            <button
              onClick={sendMessage}
              disabled={isSending || !input.trim()}
              className="px-4 py-2.5 bg-gradient-to-br from-red-600 to-red-700 rounded-lg text-sm font-medium hover:from-red-500 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed glow-red-sm"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Context Panel */}
      <div className="w-72 border-l border-border bg-card/30 p-4 overflow-y-auto">
        <h3 className="font-semibold text-sm mb-4">Context</h3>
        
        <div className="space-y-4">
          <div className="glass rounded-lg p-3">
            <div className="text-xs text-muted mb-1">Messages</div>
            <div className="font-mono text-lg">{sortedMessages.length}</div>
          </div>
          
          <div className="glass rounded-lg p-3">
            <div className="text-xs text-muted mb-1">Model</div>
            <div className="font-mono text-sm">glm-5:cloud</div>
          </div>
          
          <div className="glass rounded-lg p-3">
            <div className="text-xs text-muted mb-1">Session</div>
            <div className="font-mono text-sm text-green-400">Active</div>
          </div>
          
          <div className="glass rounded-lg p-3">
            <div className="text-xs text-muted mb-2">Quick Actions</div>
            <div className="space-y-1">
              <button className="w-full text-left text-xs px-2 py-1.5 rounded bg-card hover:bg-card-hover transition-colors">
                📝 New Task
              </button>
              <button className="w-full text-left text-xs px-2 py-1.5 rounded bg-card hover:bg-card-hover transition-colors">
                🧠 Add Memory
              </button>
              <button className="w-full text-left text-xs px-2 py-1.5 rounded bg-card hover:bg-card-hover transition-colors">
                📊 View Stats
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Tasks Panel - Kanban Board
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

    await db.transact(
      db.tx.tasks[id()].update({
        title: newTaskTitle.trim(),
        status: "inbox",
        priority: newTaskPriority,
        createdAt: Date.now(),
      })
    );

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
      case "critical": return "border-red-500 bg-red-500/10";
      case "high": return "border-orange-500 bg-orange-500/10";
      case "medium": return "border-yellow-500 bg-yellow-500/10";
      case "low": return "border-green-500 bg-green-500/10";
      default: return "border-gray-500";
    }
  };

  const tasksByStatus = columns.reduce((acc, col) => {
    acc[col.id] = tasks.filter((t: Task) => t.status === col.id).sort((a: Task, b: Task) => b.createdAt - a.createdAt);
    return acc;
  }, {} as Record<string, Task[]>);

  return (
    <div className="h-[calc(100vh-4rem)] p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Task Control</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            placeholder="Add a task..."
            className="bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500/50 w-64"
          />
          <select
            value={newTaskPriority}
            onChange={(e) => setNewTaskPriority(e.target.value as typeof newTaskPriority)}
            className="bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500/50"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          <button
            onClick={addTask}
            className="px-4 py-2 bg-gradient-to-br from-red-600 to-red-700 rounded-lg text-sm hover:from-red-500 hover:to-red-600 transition-all glow-red-sm"
          >
            Add
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 h-[calc(100%-4rem)]">
        {columns.map((column) => (
          <div
            key={column.id}
            className="flex flex-col bg-card/50 rounded-xl border border-border"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => draggedTask && moveTask(draggedTask.id, column.id)}
          >
            {/* Column Header */}
            <div className={`p-3 rounded-t-xl bg-gradient-to-r ${column.color}`}>
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm">{column.title}</h3>
                <span className="text-xs opacity-75">{tasksByStatus[column.id]?.length || 0}</span>
              </div>
            </div>

            {/* Tasks */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {tasksByStatus[column.id]?.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => setDraggedTask(task)}
                  onDragEnd={() => setDraggedTask(null)}
                  className={`glass rounded-lg p-3 cursor-move hover:border-red-500/50 transition-all border-l-2 ${getPriorityColor(task.priority)}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm flex-1">{task.title}</p>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-muted hover:text-red-400 text-xs"
                    >
                      ×
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-muted">{task.priority}</span>
                    <span className="text-[10px] text-muted">
                      {new Date(task.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
              
              {tasksByStatus[column.id]?.length === 0 && (
                <div className="text-center py-8 text-muted text-xs">
                  Drop tasks here
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Knowledge Panel
function KnowledgePanel({ knowledge }: { knowledge: Knowledge[] }) {
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [newItem, setNewItem] = useState({ category: "user", content: "", importance: "medium", source: "" });
  const [showAdd, setShowAdd] = useState(false);

  const categories = ["user", "task", "knowledge", "research", "project"];
  const importances = ["low", "medium", "high", "critical"];

  const addKnowledge = async () => {
    if (!newItem.content.trim()) return;

    await db.transact(
      db.tx.knowledge[id()].update({
        category: newItem.category,
        content: newItem.content.trim(),
        importance: newItem.importance,
        source: newItem.source || "manual",
        createdAt: Date.now(),
      })
    );

    setNewItem({ category: "user", content: "", importance: "medium", source: "" });
    setShowAdd(false);
  };

  const deleteKnowledge = async (id: string) => {
    await db.transact(db.tx.knowledge[id].delete());
  };

  const filteredKnowledge = knowledge
    .filter((k: Knowledge) => filter === "all" || k.category === filter)
    .filter((k: Knowledge) => k.content.toLowerCase().includes(search.toLowerCase()))
    .sort((a: Knowledge, b: Knowledge) => b.createdAt - a.createdAt);

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
    <div className="h-[calc(100vh-4rem)] p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Knowledge Vault</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500/50 w-48"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500/50"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
            ))}
          </select>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="px-4 py-2 bg-gradient-to-br from-red-600 to-red-700 rounded-lg text-sm hover:from-red-500 hover:to-red-600 transition-all glow-red-sm"
          >
            + Add
          </button>
        </div>
      </div>

      {/* Add New Knowledge Form */}
      {showAdd && (
        <div className="glass rounded-xl p-4 mb-4 border border-red-500/30">
          <div className="grid grid-cols-4 gap-3 mb-3">
            <select
              value={newItem.category}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              className="bg-card border border-border rounded-lg px-3 py-2 text-sm"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
              ))}
            </select>
            <select
              value={newItem.importance}
              onChange={(e) => setNewItem({ ...newItem, importance: e.target.value })}
              className="bg-card border border-border rounded-lg px-3 py-2 text-sm"
            >
              {importances.map((imp) => (
                <option key={imp} value={imp}>{imp.charAt(0).toUpperCase() + imp.slice(1)}</option>
              ))}
            </select>
            <input
              type="text"
              value={newItem.source}
              onChange={(e) => setNewItem({ ...newItem, source: e.target.value })}
              placeholder="Source"
              className="bg-card border border-border rounded-lg px-3 py-2 text-sm col-span-2"
            />
          </div>
          <textarea
            value={newItem.content}
            onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
            placeholder="What should I remember?"
            className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm mb-3 h-20 resize-none"
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowAdd(false)}
              className="px-4 py-2 bg-card border border-border rounded-lg text-sm hover:bg-card-hover transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={addKnowledge}
              className="px-4 py-2 bg-gradient-to-br from-red-600 to-red-700 rounded-lg text-sm hover:from-red-500 hover:to-red-600 transition-all"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Knowledge Grid */}
      <div className="grid grid-cols-3 gap-4 overflow-y-auto h-[calc(100%-8rem)]">
        {filteredKnowledge.map((item: Knowledge) => (
          <div
            key={item.id}
            className="glass rounded-xl overflow-hidden border border-border hover:border-red-500/30 transition-all"
          >
            {/* Category Header */}
            <div className={`p-2 bg-gradient-to-r ${getCategoryColor(item.category)}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase">{item.category}</span>
                <button
                  onClick={() => deleteKnowledge(item.id)}
                  className="text-white/60 hover:text-white text-xs"
                >
                  ×
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-4">
              <p className="text-sm mb-3">{item.content}</p>
              <div className="flex items-center justify-between text-xs">
                <span className={`px-2 py-0.5 rounded border ${getImportanceBadge(item.importance)}`}>
                  {item.importance}
                </span>
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