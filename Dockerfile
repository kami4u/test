FROM node:12

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install && \
    npm i -g typescript ts-node

COPY . .

EXPOSE 3100

CMD [ "ts-node", "src" ]