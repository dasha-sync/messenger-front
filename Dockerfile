FROM node:20 AS build

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM node:20 AS production

WORKDIR /app
RUN npm install -g serve

COPY --from=build /app/dist ./dist

# Railway задаёт свой порт через переменную окружения $PORT
ENV PORT=3000
EXPOSE 3000
CMD ["sh", "-c", "serve -s dist -l $PORT"]
