FROM node:16 as api-cfp
ENV NODE_ENV production
WORKDIR /api-cfp
COPY jest.config.json .
COPY package*.json .
COPY src/ src/
RUN npm install
RUN npm ci --only=production
CMD [ "npm", "start"]