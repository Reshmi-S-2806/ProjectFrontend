# STAGE 1: Build the Angular application
FROM node:20-alpine AS build
WORKDIR /app

# 1. Copy package files and install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# 2. Copy the rest of the source code
COPY . .

# 3. Build the project
# We use --no-progress to keep the Jenkins log clean 
# and --optimization=false to bypass the font download issue.
RUN npx ng build --configuration=production --optimization=false

# STAGE 2: Serve the application using Nginx
FROM nginx:stable-alpine

# 4. Copy the build output
# IMPORTANT: Angular 17+ creates a 'browser' subfolder. 
# If your build still fails to show the site, check if it should be /app/dist/shopeasy/browser
COPY --from=build /app/dist/shopeasy/browser /usr/share/nginx/html

# 5. Add a custom Nginx config (Optional but recommended for Angular Routing)
# If you have a custom nginx.conf, uncomment the line below:
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
