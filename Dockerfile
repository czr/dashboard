FROM node:8

# Install dependencies first to take advantage of caching

# Base package
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production

# Client package
WORKDIR /usr/src/app/client
COPY client/package*.json ./
RUN npm ci --only=production

# Server package
WORKDIR /usr/src/app/server
COPY server/package*.json ./
RUN npm ci --only=production


# Copy rest of app code

WORKDIR /usr/src/app
COPY . .

EXPOSE 3000

CMD [ "npm", "run", "dev" ]
