**Card lookup**

**Overview**

This project uses Docker to containerize a multi-service application, consisting of a webapp, and database. The setup is managed through Docker Compose, and individual Dockerfiles are provided for each service.

The client opens a web page that allows the user to either insert a card number and get some details about it or obtain some statistics with an offset and limit. For the card details, first the card number is verified if it exists in a database and in that case it returns the details that are registered already and if not it queries (<https://binlist.net/>) for details which has a 5 calls limit per hour and then insert the obtained information to the database.

**Files**

- docker-compose.yml: Defines the services, networks, and volumes for the multi-container Docker application.
- Dockerfile_webapp: Dockerfile for building the webapp service.
- Dockerfile_db_init: Dockerfile for initializing the database service.

**Prerequisites**

- Docker installed on your machine.

**Setup and Usage**

**Step 1: Run and build docker images using Docker Compose**

docker-compose up --build

to run in detached mode add -d the docker-compose command

This command will start the client, server, and database services defined in the docker-compose.yml file.

Go to localhost:3001 and have fun!

The server can also be reached without the client using the following routes:

- curl http://localhost:3001/api/card-scheme/stats/<start>/<limit>
- curl http://localhost:3001/api/card-scheme/verify/<cardNumber>

**Step 2: Stopping the Services**

To stop the services, use:

docker-compose down

This will stop and remove the containers defined in the docker-compose.yml file.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
