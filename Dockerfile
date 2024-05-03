FROM node:18

#RUN npm -g install ts-node nodemon

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3002

CMD ["node","dist/index.js"]
