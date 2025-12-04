DO $ $ BEGIN IF NOT EXISTS (
    SELECT
        1
    FROM
        pg_roles
    WHERE
        rolname = 'replaceme'
) THEN PERFORM format(
    'CREATE ROLE %I LOGIN PASSWORD %L',
    'replaceme',
    'replaceme'
);

END IF;

END $ $;

GRANT USAGE ON SCHEMA public TO replaceme;

GRANT CREATE ON SCHEMA public TO replaceme;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO replaceme;

CREATE TABLE "project_members" (
    "project_id" varchar NOT NULL,
    "user_id" serial,
    CONSTRAINT "pk_table_5_id" PRIMARY KEY ("project_id", "user_id")
);

CREATE TABLE "users" (
    "id" serial NOT NULL,
    "name" varchar(100) NOT NULL,
    "email" varchar(255) NOT NULL,
    "password_hash" text NOT NULL,
    "phone" varchar(20),
    "active" boolean NOT NULL,
    "created_at" timestamp NOT NULL,
    "user_key" varchar(32) NOT NULL,
    "role" varchar(20) NOT NULL,
    CONSTRAINT "pk_users_id" PRIMARY KEY ("id")
);

CREATE TABLE "projects" (
    "id" varchar(8) NOT NULL,
    "name" varchar(100) NOT NULL,
    "description" text,
    "client_id" integer NOT NULL,
    "team_leader_id" integer NOT NULL,
    "start" timestamp,
    "end" timestamp,
    "database_path" varchar(255) NOT NULL,
    CONSTRAINT "pk_projects_id" PRIMARY KEY ("id")
);

CREATE TABLE "reports" (
    "id" serial NOT NULL,
    "project_id" integer NOT NULL,
    "type" varchar(50) NOT NULL,
    "parameters" jsonb,
    "format" varchar(20) NOT NULL,
    "path" varchar(255) NOT NULL,
    "created_at" timestamp NOT NULL,
    CONSTRAINT "pk_reports_id" PRIMARY KEY ("id")
);

CREATE TABLE "notifications" (
    "id" serial NOT NULL,
    "user_id" integer NOT NULL,
    "project_id" varchar NOT NULL,
    "message" text NOT NULL,
    "read" boolean,
    "date" timestamp NOT NULL,
    CONSTRAINT "pk_notifications_id" PRIMARY KEY ("id")
);

-- Foreign key constraints
-- Schema: public
ALTER TABLE
    "notifications"
ADD
    CONSTRAINT "fk_notifications_project_id_projects_id" FOREIGN KEY("project_id") REFERENCES "projects"("id");

ALTER TABLE
    "reports"
ADD
    CONSTRAINT "fk_reports_project_id_projects_id" FOREIGN KEY("project_id") REFERENCES "projects"("id");

ALTER TABLE
    "projects"
ADD
    CONSTRAINT "fk_projects_team_leader_id_users_id" FOREIGN KEY("team_leader_id") REFERENCES "users"("id");

ALTER TABLE
    "project_members"
ADD
    CONSTRAINT "fk_project_members_user_id_users_id" FOREIGN KEY("user_id") REFERENCES "users"("id");

ALTER TABLE
    "project_members"
ADD
    CONSTRAINT "fk_project_members_project_id_projects_id" FOREIGN KEY("project_id") REFERENCES "projects"("id");