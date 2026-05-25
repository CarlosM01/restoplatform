# --- Stage 1: Build Astro static assets ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency definitions and install packages
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Set environment variable so Astro bakes '/api' as the API URL at build time
ENV PUBLIC_API_URL=/api

# Build the application (generates the 'dist/' directory)
RUN npm run build

# --- Stage 2: Serve static files with Nginx ---
FROM nginx:1.25-alpine

# Remove the default nginx index page
RUN rm -rf /usr/share/nginx/html/*

# Copy built static files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy the custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
