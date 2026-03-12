// InstantDB Permissions
// Docs: https://www.instantdb.com/docs/permissions

const rules = {
  // Messages: Anyone can read, only authenticated users can write
  messages: {
    allow: {
      view: true, // Public read for now (change to "auth" for authenticated only)
      create: true, // Allow creation (will change to auth)
      update: true, // Allow updates
      delete: true, // Allow deletes
    },
  },
  
  // Tasks: Same rules
  tasks: {
    allow: {
      view: true,
      create: true,
      update: true,
      delete: true,
    },
  },
  
  // Knowledge: Same rules
  knowledge: {
    allow: {
      view: true,
      create: true,
      update: true,
      delete: true,
    },
  },
  
  // Agents: Read-only for regular users
  agents: {
    allow: {
      view: true,
      create: false, // Only admin can create agents
      update: false,
      delete: false,
    },
  },
  
  // Workflows: Read-only for regular users
  workflows: {
    allow: {
      view: true,
      create: false, // Only admin can create workflows
      update: false,
      delete: false,
    },
  },
  
  // Crons: Read-only for regular users
  crons: {
    allow: {
      view: true,
      create: false,
      update: false,
      delete: false,
    },
  },
  
  // Heartbeats: Read-only for regular users
  heartbeats: {
    allow: {
      view: true,
      create: false,
      update: false,
      delete: false,
    },
  },
};

export default rules;