
# Build stage
FROM node:22 AS builder

# Set the working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build TypeScript files
RUN npm run build

# Production stage
FROM node:22

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm install --production

# Copy built backend files from builder
COPY --from=builder /app/dist ./dist

# Copy static client files
COPY --from=builder /app/client ./client

# Expose the port the app runs on
EXPOSE 3000

# Start the server
CMD ["node", "dist/app.js"]
