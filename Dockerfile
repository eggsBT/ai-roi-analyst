# Build Stage - Upgraded to Node 20
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Force Vite to build (creates /app/build)
RUN npm run build

# Production Stage
FROM nginx:alpine
# Clean default config
RUN rm /etc/nginx/conf.d/default.conf
# Copy our custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy the build artifacts
COPY --from=build /app/build /usr/share/nginx/html
# Set permissions to ensure Nginx can read the files
RUN chmod -R 755 /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
