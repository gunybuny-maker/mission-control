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