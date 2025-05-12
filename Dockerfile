FROM node:20
WORKDIR /app
COPY . .
RUN npm ci && npm run build
RUN npm install -g serve
EXPOSE 4173
CMD ["serve", "-s", "dist"]
