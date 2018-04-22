FROM node:9.11.1-alpine

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    CHROMIUM_EXECUTABLE=/usr/bin/chromium-browser

RUN apk add --no-cache \
    udev \
    ttf-freefont \
    chromium

WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm install

COPY . .

ENTRYPOINT [ "node", "--experimental-modules", "lib/index.mjs" ]
