-- SQLite database export
PRAGMA foreign_keys = ON;

BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "Projects" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "start_date" TIMESTAMP,
    "end_date" TIMESTAMP,
    "status" TEXT,
    "created_at" TIMESTAMP DEFAULT CURRENT_DATE,
    "updated_at" TIMESTAMP DEFAULT CURRENT_DATE
);


CREATE TABLE IF NOT EXISTS "Tasks" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "project_id" INTEGER,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priority" TEXT,
    "estimated_hours" REAL,
    "status" TEXT,
    "created_at" TIMESTAMP DEFAULT CURRENT_DATE,
    "updated_at" TIMESTAMP DEFAULT CURRENT_DATE,
    FOREIGN KEY("project_id") REFERENCES "Projects"("id")
);


COMMIT;
