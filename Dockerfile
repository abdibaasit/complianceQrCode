FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
COPY server/package.json ./server/
COPY client/package.json ./client/

# Install dependencies
RUN cd server && npm install --production && cd ..
RUN cd client && npm install && npm run build && cd ..

# Copy source code
COPY server ./server
COPY client ./client

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "server/src/app.js"]
