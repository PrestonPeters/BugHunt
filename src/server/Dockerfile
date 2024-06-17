FROM node:latest

EXPOSE 8080

WORKDIR /usr/src/app/server

COPY .. .

RUN npm add body-parser
RUN npm add express
RUN npm add mysql2
RUN npm add cors
RUN npm add multer

CMD [ "node", "server.js" ]