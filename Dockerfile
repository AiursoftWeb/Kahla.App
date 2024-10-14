FROM hub.aiursoft.cn/node:latest as yarn-env
WORKDIR /app
COPY ./package.json ./yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .

RUN yarn run prod

FROM hub.aiursoft.cn/aiursoft/static
COPY --from=yarn-env /app/dist/browser /data


ENTRYPOINT [ "/app/static", "--port", "5000", "--path", "/data", "--not-found-page", "/index.html" ]
