FROM node:18-bullseye-slim

WORKDIR /app

# Install system dependencies that Cypress requires, including Xvfb for headless browsers.
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      libgtk2.0-0 \
      libgtk-3-0 \
      libnotify-dev \
      libgconf-2-4 \
      libnss3 \
      libxss1 \
      libxtst6 \
      libasound2 \
      fonts-liberation \
      xauth \
      xvfb \
    && rm -rf /var/lib/apt/lists/*

# Install project dependencies before copying the full repo to leverage layer caching.
COPY package*.json ./
RUN npm ci

COPY . .

# Ensure Cypress keeps its cache inside the container for reproducible runs.
ENV CYPRESS_CACHE_FOLDER=/root/.cache/Cypress

# Run the serve+test script that already exists in package.json.
CMD ["npm", "run", "cy:run"]
