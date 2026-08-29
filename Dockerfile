FROM node:18-alpine

WORKDIR /app

# Copy root and server package files
COPY package*.json ./
COPY server/ ./server/

# Install server dependencies only (production)
RUN cd server && npm install --production && cd ..

# Create uploads directory
RUN mkdir -p uploads/logos

# Expose port (Railway uses PORT env var, default 3000)
EXPOSE 3000

# Start Express server
CMD ["node", "server/src/app.js"]
