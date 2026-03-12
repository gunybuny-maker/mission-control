// Docs: https://www.instantdb.com/docs/modeling-data

import { i } from "@instantdb/react";

const _schema = i.schema({
  entities: {
    $files: i.entity({
      path: i.string().unique().indexed(),
      url: i.string(),
    }),
    $users: i.entity({
      email: i.string().unique().indexed().optional(),
      imageURL: i.string().optional(),
      type: i.string().optional(),
    }),
    // Messages for chat
    messages: i.entity({
      role: i.string(), // "user" | "assistant"
      content: i.string(),
      createdAt: i.number(),
    }),
    // Tasks for task board
    tasks: i.entity({
      title: i.string(),
      status: i.string(), // "inbox" | "todo" | "in_progress" | "done"
      priority: i.string(), // "low" | "medium" | "high" | "critical"
      createdAt: i.number(),
    }),
    // Knowledge/memory entries
    knowledge: i.entity({
      category: i.string(),
      content: i.string(),
      importance: i.string(),
      source: i.string(),
      createdAt: i.number(),
    }),
    // Agents
    agents: i.entity({
      name: i.string(),
      role: i.string(),
      emoji: i.string().optional(),
      model: i.string(),
      status: i.string(), // "active" | "idle" | "offline"
      workspace: i.string().optional(),
      lastActive: i.number().optional(),
    }),
    // Workflows
    workflows: i.entity({
      name: i.string(),
      description: i.string().optional(),
      status: i.string(), // "running" | "paused" | "stopped"
      schedule: i.string().optional(), // cron expression
      lastRun: i.number().optional(),
      nextRun: i.number().optional(),
      createdAt: i.number(),
    }),
    // Cron jobs
    crons: i.entity({
      name: i.string(),
      schedule: i.string(), // cron expression
      command: i.string(),
      enabled: i.boolean(),
      lastRun: i.number().optional(),
      nextRun: i.number().optional(),
      createdAt: i.number(),
    }),
    // Heartbeats
    heartbeats: i.entity({
      type: i.string(), // "morning" | "evening" | "custom"
      schedule: i.string(),
      channel: i.string(), // "telegram" | "discord" | "email"
      enabled: i.boolean(),
      lastRun: i.number().optional(),
      createdAt: i.number(),
    }),
  },
  links: {
    $usersLinkedPrimaryUser: {
      forward: {
        on: "$users",
        has: "one",
        label: "linkedPrimaryUser",
        onDelete: "cascade",
      },
      reverse: {
        on: "$users",
        has: "many",
        label: "linkedGuestUsers",
      },
    },
    workflowAgents: {
      forward: {
        on: "workflows",
        has: "many",
        label: "agents",
      },
      reverse: {
        on: "agents",
        has: "many",
        label: "workflows",
      },
    },
  },
  rooms: {
    todos: {
      presence: i.entity({}),
    },
    chat: {
      presence: i.entity({}),
    },
  },
});

// This helps TypeScript display nicer intellisense
type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;