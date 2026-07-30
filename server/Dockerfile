FROM node:20-alpine

RUN apk add --no-cache mysql-client

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

ENV PORT=3001
EXPOSE 3001

CMD ["node", "index.js"]
