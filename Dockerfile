# Build Stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# The Bulletproof Build: 
# 1. Run the build
# 2. If 'dist' was created, delete any existing 'build' folder (junk) and rename 'dist' to 'build'
RUN npm run build && if [ -d "dist" ]; then rm -rf build && mv dist build; fi

# Production Stage
FROM nginx:alpine
# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf
# Copy our verified config
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy the verified 'build' folder (which we guaranteed exists above)
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
