# Build stage
FROM node:18 as build
WORKDIR /app
COPY anno-client/package*.json ./
RUN npm install
COPY anno-client ./
RUN npm run build

# Serve with nginx (simple) 
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
# (Optional) if you need SPA fallback
RUN sed -i 's/try_files \$uri \$uri\/ =404;/try_files \$uri \/index.html;/' /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
