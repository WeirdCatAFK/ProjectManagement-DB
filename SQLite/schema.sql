pragma foreign_keys = on;

begin transaction;

create table if not exists "teams" (
    "id" integer primary key autoincrement not null,
    "name" text not null,
    "description" text,
    "created_at" timestamp default current_date,
    "updated_at" timestamp default current_date
);

create table if not exists "teammembers" (
    "id" integer primary key autoincrement not null,
    "team_id" integer,
    "name" text not null,
    "role" text,
    "email" text,
    "created_at" timestamp default current_date,
    "updated_at" timestamp default current_date,
    foreign key("team_id") references "teams"("id")
);

create table if not exists "tasks" (
    "id" integer primary key autoincrement not null,
    "title" text not null,
    "description" text,
    "priority" text,
    "estimated_hours" real,
    "status" text,
    "created_at" timestamp default current_date,
    "updated_at" timestamp default current_date,
    "team_id" integer,
    foreign key("team_id") references "teams"("id")
);

commit;
