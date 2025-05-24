FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads/documents

# Expose the port the app runs on
EXPOSE 5042

# Command to run the application
CMD ["npm", "run", "dev"]
