FROM node:22-alpine

WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
# The repository's build script runs its separately configured lint gate first;
# produce the deployment artifact here and leave linting to CI.
RUN npx next build

ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "run", "start"]
