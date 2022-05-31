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
# 31/05/2022 - Error: The Angular Compiler requires TypeScript >=4.4.2 and <4.7.0 but 4.7.2 was found instead.
# Por isso tive que fixar as versões do Angular e TypeScript.
RUN npm install typescript@~4.6.3
RUN npm install -g @angular/cli
#RUN ng update
RUN npm install @angular/compiler-cli@^13.3.3 --force
RUN npm install @angular-devkit/build-angular@^13.3.3 --force
RUN ng update @angular/cdk@~13.3.3 @angular/core@~13.3.3 @angular/material@~13.3.3
RUN ng build

FROM nginx:alpine AS spa-cfp
RUN mkdir -p /usr/share/nginx/html/cfp
COPY --from=spa-cfp-builder /spa-cfp/dist/spa-cfp/ /usr/share/nginx/html/cfp
COPY ./src/environments/abmelo.conf /etc/nginx/conf.d/default.conf
RUN mkdir -p /etc/nginx/snippets
COPY ./src/environments/ssl-params.conf /etc/nginx/snippets/ssl-params.conf