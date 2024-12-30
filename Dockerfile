FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install 

COPY . .

# container's port
EXPOSE 80

# WORKDIR /app/src
# CMD ["node", "app.js"]
# CMD ["node", "./src/app.js"]
CMD ["npm", "start"]
