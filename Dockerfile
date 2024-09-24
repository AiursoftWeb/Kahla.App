FROM hub.aiursoft.cn/node:latest as yarn-env
WORKDIR /app
COPY ./package.json ./yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .

RUN yarn run prod

FROM hub.aiursoft.cn/aiursoft/static
COPY --from=yarn-env /app/www/browser /data

COPY docker-entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

ENTRYPOINT [ "/app/entrypoint.sh" ]

