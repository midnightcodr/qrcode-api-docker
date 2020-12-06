FROM node:alpine

COPY ./src/package.json ./
RUN npm config set package-lock false
RUN npm install
COPY ./src/index.js ./

CMD [ "npm", "start" ]