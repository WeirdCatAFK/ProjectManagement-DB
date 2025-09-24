CREATE TABLE "TeamUsers" (
    "team_id" integer NOT NULL,
    "user_id" integer NOT NULL,
    CONSTRAINT "pk_team_users" PRIMARY KEY ("team_id", "user_id")
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

CREATE TABLE "Roles" (
    "id" integer NOT NULL,
    "name" varchar(100) NOT NULL,
    "description" text,
    CONSTRAINT "pk_Roles_id" PRIMARY KEY ("id")
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

CREATE TABLE "Users" (
    "id" integer NOT NULL,
    "name" varchar(100) NOT NULL,
    "email" varchar(255) NOT NULL,
    "password_hash" text NOT NULL,
    "phone" varchar(20),
    "active" boolean NOT NULL,
    "created_at" timestamp NOT NULL,
    "user_key" varchar,
    CONSTRAINT "pk_Users_id" PRIMARY KEY ("id")
);

CREATE TABLE "Messages" (
    "id" integer NOT NULL,
    "project_id" integer,
    "user_id" integer,
    "content" text,
    "date" timestamp,
    CONSTRAINT "pk_Messages_id" PRIMARY KEY ("id")
);

CREATE TABLE "UserRoles" (
    "user_id" integer NOT NULL,
    "role_id" integer NOT NULL,
    CONSTRAINT "pk_user_roles" PRIMARY KEY ("user_id", "role_id")
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

CREATE TABLE "Teams" (
    "team_id" integer NOT NULL,
    "project_id" integer NOT NULL,
    "name" varchar(100) NOT NULL,
    CONSTRAINT "pk_Teams_team_id" PRIMARY KEY ("team_id")
);

-- Foreign key constraints
-- Schema: public
ALTER TABLE "Messages" ADD CONSTRAINT "fk_Messages_project_id_Projects_id" FOREIGN KEY("project_id") REFERENCES "Projects"("id");
ALTER TABLE "Messages" ADD CONSTRAINT "fk_Messages_user_id_Users_id" FOREIGN KEY("user_id") REFERENCES "Users"("id");
ALTER TABLE "Notifications" ADD CONSTRAINT "fk_Notifications_user_id_Users_id" FOREIGN KEY("user_id") REFERENCES "Users"("id");
ALTER TABLE "Reports" ADD CONSTRAINT "fk_Reports_project_id_Projects_id" FOREIGN KEY("project_id") REFERENCES "Projects"("id");
ALTER TABLE "Projects" ADD CONSTRAINT "fk_Projects_client_id_Clients_id" FOREIGN KEY("client_id") REFERENCES "Clients"("id");
ALTER TABLE "Projects" ADD CONSTRAINT "fk_Projects_team_leader_id_Users_id" FOREIGN KEY("team_leader_id") REFERENCES "Users"("id");
ALTER TABLE "Teams" ADD CONSTRAINT "fk_Teams_project_id_Projects_id" FOREIGN KEY("project_id") REFERENCES "Projects"("id");
ALTER TABLE "TeamUsers" ADD CONSTRAINT "fk_TeamUsers_team_id_Teams_team_id" FOREIGN KEY("team_id") REFERENCES "Teams"("team_id");
ALTER TABLE "TeamUsers" ADD CONSTRAINT "fk_TeamUsers_user_id_Users_id" FOREIGN KEY("user_id") REFERENCES "Users"("id");
ALTER TABLE "UserRoles" ADD CONSTRAINT "fk_UserRoles_role_id_Roles_id" FOREIGN KEY("role_id") REFERENCES "Roles"("id");
ALTER TABLE "UserRoles" ADD CONSTRAINT "fk_UserRoles_user_id_Users_id" FOREIGN KEY("user_id") REFERENCES "Users"("id");
ALTER TABLE "Reports" ADD CONSTRAINT "fk_Reports_user_id_Users_id" FOREIGN KEY("user_id") REFERENCES "Users"("id");