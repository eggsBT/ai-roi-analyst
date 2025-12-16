# Stage 1: Build the React Application
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
# Remove the default Nginx config
RUN rm /etc/nginx/conf.d/default.conf
# Copy our custom config from Step 2
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy the React build output
COPY --from=build /app/dist /usr/share/nginx/html

# Cloud Run requires port 8080
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
