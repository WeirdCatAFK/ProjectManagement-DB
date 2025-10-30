CREATE TABLE "Users" (
    "id" integer NOT NULL,
    "name" varchar(100) NOT NULL,
    "email" varchar(255) NOT NULL,
    "password_hash" text NOT NULL,
    "phone" varchar(20),
    "active" boolean NOT NULL,
    "created_at" timestamp NOT NULL,
    "user_key" varchar(500),
    "role" varchar(20),
    "company" varchar(200),
    CONSTRAINT "pk_Users_id" PRIMARY KEY ("id")
);

CREATE TABLE "Clients" (
    "id" integer NOT NULL,
    "name" varchar(100) NOT NULL,
    "email" varchar(255),
    "phone" varchar(20),
    "company" varchar(100),
    "created_at" timestamp,
    CONSTRAINT "pk_Clients_id" PRIMARY KEY ("id")
);

CREATE TABLE "Projects" (
    "id" integer NOT NULL,
    "name" varchar(100) NOT NULL,
    "description" text,
    "client_id" integer NOT NULL,
    "team_leader_id" integer NOT NULL,
    "start" timestamp,
    "end" timestamp,
    "database_path" varchar(255) NOT NULL,
    CONSTRAINT "pk_Projects_id" PRIMARY KEY ("id")
);

CREATE TABLE "Notifications" (
    "id" integer NOT NULL,
    "user_id" integer NOT NULL,
    "message" text,
    "read" boolean,
    "date" timestamp,
    CONSTRAINT "pk_Notifications_id" PRIMARY KEY ("id")
);

CREATE TABLE "Reports" (
    "id" integer NOT NULL,
    "project_id" integer NOT NULL,
    "user_id" integer NOT NULL,
    "type" varchar(50) NOT NULL,
    "parameters" jsonb,
    "format" varchar(20) NOT NULL,
    "path" varchar(255),
    "created_at" timestamp NOT NULL,
    CONSTRAINT "pk_Reports_id" PRIMARY KEY ("id")
);

-- Foreign key constraints
-- Schema: public
ALTER TABLE "Reports" ADD CONSTRAINT "fk_Reports_project_id_Projects_id" FOREIGN KEY("project_id") REFERENCES "Projects"("id");
ALTER TABLE "Notifications" ADD CONSTRAINT "fk_Notifications_user_id_Users_id" FOREIGN KEY("user_id") REFERENCES "Users"("id");
ALTER TABLE "Reports" ADD CONSTRAINT "fk_Reports_user_id_Users_id" FOREIGN KEY("user_id") REFERENCES "Users"("id");
ALTER TABLE "Projects" ADD CONSTRAINT "fk_Projects_team_leader_id_Users_id" FOREIGN KEY("team_leader_id") REFERENCES "Users"("id");
ALTER TABLE "Projects" ADD CONSTRAINT "fk_Projects_client_id_Clients_id" FOREIGN KEY("client_id") REFERENCES "Clients"("id");