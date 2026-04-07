# Use Node.js v16 as the base image
FROM node:20-alpine

# Set working directory
WORKDIR /var/src/

# Copy package.json and package-lock.json to leverage Docker caching for dependencies
COPY ./src/package.json ./src/package-lock.json ./

# Install node packages and global nodemon, using cache for npm packages
RUN --mount=type=cache,target=/root/.npm \
    npm install && npm install -g nodemon@2.0.16

# Copy the rest of the source files into the image
COPY ./src .

# Expose the application port
EXPOSE 3009

# Start the application
CMD [ "node", "app.js" ]
