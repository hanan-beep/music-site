FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY src ./src
COPY public ./public
RUN mkdir -p /cache && chown node:node /cache
ENV NODE_ENV=production
USER node
EXPOSE 3000
CMD ["node", "src/server.js"]
