export const schema = `
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL, -- 'daily', 'todo', 'habit', 'reward'
  text TEXT NOT NULL,
  priority REAL DEFAULT 1,
  position REAL,
  due TEXT,
  notes TEXT,
  up INTEGER DEFAULT 0,
  down INTEGER DEFAULT 0,
  streak INTEGER,
  attribute TEXT,
  frequency TEXT,
  everyX INTEGER,
  startDate TEXT,
  completed BOOLEAN DEFAULT 0,
  isGroup BOOLEAN DEFAULT 0
);

CREATE TABLE IF NOT EXISTS checklists (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT 0,
  position INTEGER,
  FOREIGN KEY(task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS task_tags (
  task_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  PRIMARY KEY (task_id, tag_id),
  FOREIGN KEY(task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY(tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS task_repeats (
  task_id TEXT NOT NULL,
  day TEXT NOT NULL, -- 'm', 't', 'w', 'th', 'f', 's', 'su'
  active BOOLEAN DEFAULT 0,
  PRIMARY KEY (task_id, day),
  FOREIGN KEY(task_id) REFERENCES tasks(id) ON DELETE CASCADE
);
`;
