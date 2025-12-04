# Despliegue

Esta guía explica cómo levantar una instancia de PostgreSQL usando Docker y ejecutar la inicialización básica del esquema.

## Diagrama de la base de datos

![Diagrama](./Diagram.png)

## Diccionario de datos

1. Tabla: `users`

Almacena la información de todos los usuarios del sistema (líderes de equipo, clientes, administradores, etc.).


| **Columna**     | **Tipo de Dato** | **Restricciones**     | **Descripción**                                  |
| ----------------- | ------------------ | ----------------------- | --------------------------------------------------- |
| `id`            | SERIAL           | PRIMARY KEY, NOT NULL | Identificador único autoincremental del usuario. |
| `name`          | VARCHAR(100)     | NOT NULL              | Nombre completo del usuario.                      |
| `email`         | VARCHAR(255)     | NOT NULL              | Correo electrónico.                              |
| `password_hash` | TEXT             | NOT NULL              | Hash de la contraseña para autenticación.       |
| `phone`         | VARCHAR(20)      |                       | Número de teléfono de contacto.                 |
| `active`        | BOOLEAN          | NOT NULL              | Indica si el usuario está activo en el sistema.  |
| `created_at`    | TIMESTAMP        | NOT NULL              | Fecha de creación del registro.                  |
| `user_key`      | VARCHAR(32)      | NOT NULL              | Clave única o token asociado al usuario.         |
| `role`          | VARCHAR(20)      | NOT NULL              | Rol del usuario en el sistema.                    |

#### 2. Tabla: `projects`

Contiene el registro maestro de los proyectos. Cada proyecto aquí referencia a su propia base de datos SQLite.


| **Columna**      | **Tipo de Dato** | **Restricciones**     | **Descripción**                                                      |
| ------------------ | ------------------ | ----------------------- | ----------------------------------------------------------------------- |
| `id`             | VARCHAR(8)       | PRIMARY KEY, NOT NULL | Identificador único del proyecto (código alfanumérico).            |
| `name`           | VARCHAR(100)     | NOT NULL              | Nombre del proyecto.                                                  |
| `description`    | TEXT             |                       | Descripción detallada del proyecto.                                  |
| `client_id`      | INTEGER          | NOT NULL              | ID del cliente asociado.                                              |
| `team_leader_id` | INTEGER          | NOT NULL, FOREIGN KEY | Referencia a user id. Líder asignado al proyecto.                    |
| `start`          | TIMESTAMP        |                       | Fecha de inicio del proyecto.                                         |
| `end`            | TIMESTAMP        |                       | Fecha de finalización del proyecto.                                  |
| `database_path`  | VARCHAR(255)     | NOT NULL              | Ruta al archivo de base de datos SQLite específica de este proyecto. |

#### 3. Tabla: `project_members`

Tabla intermedia que define qué usuarios son miembros de qué proyectos.


| **Columna**  | **Tipo de Dato** | **Restricciones**                              | **Descripción**            |
| -------------- | ------------------ | ------------------------------------------------ | ----------------------------- |
| `project_id` | VARCHAR          | PRIMARY KEY (Compuesta), NOT NULL, FOREIGN KEY | Referencia a`projects(id)`. |
| `user_id`    | SERIAL           | PRIMARY KEY (Compuesta), FOREIGN KEY           | Referencia a`users(id)`.    |

#### 4. Tabla: `reports`

Almacena metadatos sobre reportes generados para los proyectos.


| **Columna**  | **Tipo de Dato** | **Restricciones**     | **Descripción**                                                |
| -------------- | ------------------ | ----------------------- | ----------------------------------------------------------------- |
| `id`         | SERIAL           | PRIMARY KEY, NOT NULL | Identificador único del reporte.                               |
| `project_id` | INTEGER          | NOT NULL, FOREIGN KEY | Referencia al proyecto asociado.                                |
| `type`       | VARCHAR(50)      | NOT NULL              | Tipo de reporte (ej. "avance", "financiero").                   |
| `parameters` | JSONB            |                       | Parámetros utilizados para generar el reporte en formato JSON. |
| `format`     | VARCHAR(20)      | NOT NULL              | Formato del archivo (ej. "pdf", "csv").                         |
| `path`       | VARCHAR(255)     | NOT NULL              | Ruta de almacenamiento del archivo del reporte.                 |
| `created_at` | TIMESTAMP        | NOT NULL              | Fecha de generación del reporte.                               |

#### 5. Tabla: `notifications`

Sistema de notificaciones para los usuarios.


| **Columna**  | **Tipo de Dato** | **Restricciones**     | **Descripción**                                                       |
| -------------- | ------------------ | ----------------------- | ------------------------------------------------------------------------ |
| `id`         | SERIAL           | PRIMARY KEY, NOT NULL | Identificador único de la notificación.                              |
| `user_id`    | INTEGER          | NOT NULL              | ID del usuario destinatario.                                           |
| `project_id` | VARCHAR          | NOT NULL, FOREIGN KEY | Referencia a`projects(id)`. Proyecto relacionado con la notificación. |
| `message`    | TEXT             | NOT NULL              | Contenido del mensaje.                                                 |
| `read`       | BOOLEAN          |                       | Estado de lectura (Leído/No leído).                                  |
| `date`       | TIMESTAMP        | NOT NULL              | Fecha y hora de la notificación.                                      |

## Requisitos

Necesitas tener instalado:

* Docker
* Docker Compose

## Estructura del Proyecto

```

postgreSQL/
├── .env
├── docker-compose.yml
├── Diagram.png
├── db-data/        (volumen que se genera automáticamente)
└── init/
└── init.sh

````

## Configuración y despligué

En `postgreSQL/.env` define las credenciales de la instancia de postgressm el rol que tiene acceso a las tablas y el correo y contraseña de la instancia de pgadmin, cambia los valores por algo seguro:

```ini
POSTGRES_USER=replaceme
POSTGRES_PASSWORD=replaceme
POSTGRES_DB=PMaster

DATABASE_ROLE=replaceme
DATABASE_ROLE_PASSWORD=password

PGADMIN_DEFAULT_EMAIL=admin@example.com
PGADMIN_DEFAULT_PASSWORD=password
````

Docker Compose usa estas variables al iniciar los contenedores.

El script de inicialización `init/init.sh` inyectará automáticamente las variables `DATABASE_ROLE` y `DATABASE_ROLE_PASSWORD` para crear el rol de la aplicación y asignar los permisos correspondientes.

Inicio del Servicio

En el directorio `postgreSQL`, ejecuta:

```bash
docker-compose up -d
```

Esto levanta una instancia de postgress y pgadmin:
El directorio `init/` se monta en el contenedor y ejecuta automáticamente el script `init.sh` en el primer arranque el cuál creara la base de datos

## Conexión a la Base de Datos

Puedes conectarte con los siguiente valores:

* Host: `127.0.0.1`
* Puerto: `5432`
* Base: valor de `POSTGRES_DB`
* Usuario admin: `POSTGRES_USER`
* Contraseña admin: `POSTGRES_PASSWORD`
* Usuario de aplicación: valor de `DATABASE_ROLE` / `DATABASE_ROLE_PASSWORD`

## Acceso a PgAdmin

* Después de iniciar los contenedores
* Abre `http://localhost:5050`
* Ingresa con `PGADMIN_DEFAULT_EMAIL` y `PGADMIN_DEFAULT_PASSWORD`

### Datos para registrar el servidor en PgAdmin

En PgAdmin:

* General → Nombre: como quieras
* Conexión:

  * Host: `db`
  * Port: `5432`
  * Maintenance DB: `PMaster` (o el valor de `POSTGRES_DB`)
  * Username: valor de `DATABASE_ROLE` (ej. `replaceme`)
  * Password: valor de `DATABASE_ROLE_PASSWORD` (ej. `password`)

> El host es `db` porque PgAdmin y PostgreSQL corren en la misma red interna de Docker.

## Persistencia

La información se guarda bajo `./db-data`, que está mapeado al volumen de PostgreSQL.
Los datos persisten aunque reinicies o detengas los contenedores.

## Apagar Servicios

```bash
docker-compose down
```

## Destruir la base de datos

1. Detén contenedores:

   ```bash
   docker-compose down -v
   ```
   Es muy importante la bandera -v para que destruya sus volumenes de configuración de PGadmin
2. Elimina `./db-data` (carpeta local).
3. Levanta nuevamente:

   ```bash
   docker-compose up -d
   ```
