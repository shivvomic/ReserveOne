# ---- Stage 1: build the React app into static files ----
FROM node:24-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite bakes VITE_API_URL into the JavaScript at build time.
# "/api" is a relative path: the browser calls the same server that
# served the page, and nginx (Step 2) forwards it to the backend.
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ---- Stage 2: serve those files with nginx ----
# Only the built files are copied across. Node, node_modules and the
# source code stay behind in stage 1, so this image is small.
FROM nginx:stable-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80