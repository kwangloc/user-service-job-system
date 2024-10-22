FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install 

COPY . .

# ENV JWT_PRIVATE_KEY=lucas_1409

# container's port
EXPOSE 3000

WORKDIR /app/src
CMD ["node", "app.js"]
# CMD ["node", "./src/app.js"]
