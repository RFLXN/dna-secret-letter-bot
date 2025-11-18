FROM node:22-alpine

WORKDIR /app

# Enable Corepack for Yarn Berry
RUN corepack enable

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --immutable

# Copy source code
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript
RUN yarn build

CMD ["node", "dist/main.js"]
