# 1. Start with a lightweight version of Node.js
FROM node:22-alpine

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy package files and install dependencies
# We copy these first to take advantage of Docker's layer caching.
# If these files don't change, Docker won't re-run 'npm install' on every build.
COPY package*.json ./
RUN npm install

# 4. Copy the rest of the application code
COPY . .

# 5. Expose the port the app runs on
EXPOSE 3000

# 6. The command to run when the container starts
CMD ["npm", "start"]