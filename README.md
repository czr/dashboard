# Dashboard

A personal interactive dashboard.

## Features

* Life progress based on ONS life-expectancy data
* Daily Most Important Task pulled from Trello with completion marked in Trello and Beeminder
* Time tracking pulled from Google Calendar
* Health log

## Usage

In addition to running directly under Node.js, the dashboard can also be run under Docker in production or development modes.

### Deploy

Build:

```bash
npm run build && \
    docker-compose -p dashboard_prod -f deploy/prod.yml build
```

Run:

```bash
docker-compose -p dashboard_prod -f deploy/prod.yml up
```

The server will be visible on http://localhost:3000

Note that it should then run automatically on restarting Docker unless it is explicitly stopped.

### Develop

```bash
docker-compose -p dashboard_dev -f deploy/dev.yml build && \
    docker-compose -p dashboard_dev -f deploy/dev.yml up
```

The dev server will be visible on http://localhost:3001

### Backup/restore

The data used by the health-log (and other dashboard components if they use Mongo) can be backed up to and restored from the host filesystem:

Backup:

```bash
docker run --rm -it \
    --network dashboard_prod_default \
    -v ~/dashboard-mongo-backup:/backup \
    mongo:3.4 mongodump \
    --host dashboard_prod_mongo_1 --out /backup/
```

Restore:

```bash
docker run --rm -it \
    --network dashboard_prod_default \
    -v ~/dashboard-mongo-backup:/backup \
    mongo:3.4 mongorestore \
    --host dashboard_prod_mongo_1 /backup/
```

## License

This project is licensed under the terms of the MIT license.
