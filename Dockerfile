# STAGE 1: Build the Angular application
FROM node:20-alpine AS build
WORKDIR /app

# 1. Copy package files and install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# 2. Copy the rest of the source code
COPY . .

# 3. Build the project
# We use --optimization=false to prevent the 'Inlining of fonts failed' error.
RUN npx ng build --configuration=production --optimization=false

# STAGE 2: Serve the application using Nginx
FROM nginx:stable-alpine

# 4. Copy the build output
# Based on your logs, your files are in /app/dist/shopeasy (no /browser subfolder)
COPY --from=build /app/dist/shopeasy /usr/share/nginx/html

# 5. Expose port 80 for Nginx
EXPOSE 80

# 6. Start Nginx
CMD ["nginx", "-g", "daemon off;"]
