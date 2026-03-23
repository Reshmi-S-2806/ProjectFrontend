# STAGE 1: Build the Angular application
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files and install dependencies
# We use --legacy-peer-deps to match your Jenkins setup
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy the rest of the source code
COPY . .

# Build the project for production
RUN npx ng build --configuration=production

# STAGE 2: Serve the application using Nginx
FROM nginx:stable-alpine

# Copy the build output from the 'build' stage to the Nginx html folder
# Note: Angular 17+ usually outputs to dist/shopeasy/browser
# Option A: Try removing the /browser part
COPY --from=build /app/dist/shopeasy /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
