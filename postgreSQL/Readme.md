# Proyecto - Base de Datos

#Diagrama
![alt-text](./Diagram.png "Hover text")

#Despliegue Rápido

Para desplegar la base de datos en un entorno local o de desarrollo:

1.  Asegúrate de tener PostgreSQL instalado y en ejecución.
2.  Crear la base de datos (si aún no existe) usando `psql` o tu herramienta de DB preferida:
    En este caso en postgrest
    CREATE DATABASE mi_proyecto_db;
    ```
3.  Conéctate a tu nueva base de datos:
    ```bash
    psql -d mi_proyecto_db
    ```
4.  Ejecutar el script `schema.sql` para crear todas las tablas y relaciones. Si has clonado el repositorio, puedes ejecutar:
    ```bash
    psql -d mi_proyecto_db -U tu_usuario -f schema.sql
    ```
    (Reemplaza `mi_proyecto_db` y `tu_usuario` con tus credenciales).

Las tablas `Users`, `Projects`, `Notifications`, y `Reports` están creadas.

# Una vez dentro, ejecuta el comando \dt para listar las tablas:
    \dt
    ```
    
    Deberías ver una salida similar a esta:
    
    ```
               List of relations
     Schema |     Name      | Type  |  Owner
    --------+---------------+-------+----------
     public | notifications | table | tu_usuario
     public | projects      | table | tu_usuario
     public | reports       | table | tu_usuario
     public | users         | table | tu_usuario
    (4 rows)
    ```



