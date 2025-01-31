FROM golang:1.23.5-alpine3.20 AS builder
WORKDIR /app

RUN apk add --no-cache upx

COPY go.mod go.sum ./
RUN go mod download && go mod verify
COPY pkg main.go ./

RUN go build -ldflags="-extldflags=-static -w -s" -o challenge-manager .
RUN upx --lzma challenge-manager

FROM alpine:3.20 AS helm-builder
WORKDIR /app
RUN apk add --no-cache helm bash

COPY charts .

RUN bash /app/package.sh

FROM scratch AS final
WORKDIR /app

COPY --from=builder /app/challenge-manager .
COPY --from=helm-builder /app/packaged-charts ./charts

ENTRYPOINT ["/app/challenge-manager"]
