pragma foreign_keys = on;
begin transaction;
create table if not exists "teams" (
    "id" integer primary key autoincrement not null,
    "name" text not null,
    "description" text not null,
    "created_at" timestamp default current_date not null,
    "updated_at" timestamp default current_date not null
);
create table if not exists "teammembers" (
    "id" integer primary key autoincrement not null,
    "team_id" integer not null,
    "name" text not null,
    "role" text not null,
    "email" text not null,
    "created_at" timestamp default current_date not null,
    "updated_at" timestamp default current_date not null,
    foreign key("team_id") references "teams"("id")
);
create table if not exists "tasks" (
    "id" integer primary key autoincrement not null,
    "title" text not null,
    "description" text not null,
    "priority" text not null,
    "estimated_hours" real not null,
    "status" text not null,
    "created_at" timestamp default current_date not null,
    "updated_at" timestamp default current_date not null,
    "teammember_id" integer not null,
    foreign key("teammember_id") references "teammembers"("id")
);
commit;