FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

EXPOSE 4000

# Chaining migrations and seed before starting
CMD npx prisma migrate deploy && npx prisma db seed && npm run start:prod
