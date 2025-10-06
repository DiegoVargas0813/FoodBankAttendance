FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .
COPY .env .env

EXPOSE 3000

CMD ["node", "server.js"]