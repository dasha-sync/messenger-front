FROM node:20
WORKDIR /app
COPY . .
RUN npm ci && npm run build
RUN npm install -g serve
RUN npm install react-bootstrap-icons --save
npm install react-bootstrap bootstrap
EXPOSE 4173
CMD ["serve", "-s", "dist"]
