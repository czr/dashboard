FROM node:8-alpine

# git is needed for RickCarlino/later dependency
RUN apk update && apk upgrade && \
    apk add --no-cache git

# Install dependencies first to take advantage of caching
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production

# Copy rest of code
WORKDIR /usr/src/app
COPY . .

EXPOSE 3000
CMD [ "npm", "start" ]
