FROM node:16 as spa-cfp-builder
ENV NODE_ENV production
WORKDIR /spa-cfp
COPY angular.json .
COPY karma.conf.js .
COPY package.json .
COPY tsconfig*.json .
COPY src/ src/
#RUN npm install -g npm-check
RUN npm install
RUN npm uninstall @angular-devkit/build-angular
RUN npm uninstall @angular/compiler-cli
RUN npm uninstall typescript
RUN npm install typescript
RUN npm install -g @angular/cli
#RUN ng update
RUN npm install @angular/compiler-cli --force
RUN npm install @angular-devkit/build-angular --force
RUN ng update @angular/cdk @angular/core @angular/material
RUN ng build --prod

FROM nginx:alpine AS spa-cfp
COPY --from=spa-cfp-builder /spa-cfp/dist/spa-cfp/ /usr/share/nginx/html
COPY ./src/environments/abmelo.conf /etc/nginx/conf.d/default.conf
RUN mkdir -p /etc/nginx/snippets
COPY ./src/environments/ssl-params.conf /etc/nginx/snippets/ssl-params.conf