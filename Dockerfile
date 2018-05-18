FROM node:9.11.1-alpine


RUN echo @edge http://nl.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories && \
    apk add --no-cache \
      chromium@edge \
      nss@edge \
      udev \
      ttf-freefont

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    CHROMIUM_EXECUTABLE=/usr/bin/chromium-browser \
    CHROMIUM_HEADLESS=true

WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm install

COPY . .

CMD ["node", "--experimental-vm-modules", "--experimental-modules", "lib/index.mjs"]
