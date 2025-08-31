# --- Stage 1: The Build Stage (Our "Prep Kitchen") ---
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# This command creates the final, optimized build files in a /dist folder
RUN npm run build

# --- Stage 2: The Production Stage (Our "Display Case") ---
FROM nginx:alpine

# Copy the finished "cake" (the /dist folder) from the build stage
# into the web server's hosting directory.
COPY --from=build /app/dist /usr/share/nginx/html

# The Nginx web server listens on port 80 by default
EXPOSE 80

# The default command to start the Nginx server
CMD ["nginx", "-g", "daemon off;"]