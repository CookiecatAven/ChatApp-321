# A simple chat app with websocket

## Prerequisites

- Docker
- Node >= 20.x (for development only)

## Run the complete Application as Docker Containers locally

`docker compose --profile manual up -d`

## Get Started for Development

- `npm install`
- `docker compose up -d` for the mariaDB
- `npm run dev` for running the dev environment

Then access the frontend at http://localhost:3000

## Get Started MariaDB

https://mariadb.com/kb/en/getting-started-with-the-nodejs-connector/

- `docker exec -it mariadb bash`
- `mysql -u root -p`

OR access PHPMyAdmin under http://localhost:9200
