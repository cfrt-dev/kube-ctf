FROM golang:1.23.5-alpine3.20 AS builder
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download && go mod verify
COPY pkg pkg
COPY main.go .

RUN go build -ldflags="-extldflags=-static -w -s" -o challenge-manager .

FROM alpine:3.20 AS helm-builder
WORKDIR /app
RUN apk add --no-cache helm bash

COPY charts .

RUN bash /app/package.sh

FROM alpine:3.20 AS user

RUN echo "nobody:x:65534:65534::/:" >> /passwd && \
    echo "nobody:x:65534:" >> /group

FROM scratch AS final
WORKDIR /app

COPY --from=user /passwd /etc/passwd
COPY --from=user /group /etc/group

COPY --from=builder /app/challenge-manager .
COPY --from=helm-builder /app/packaged-charts ./charts

USER 65534

ENTRYPOINT ["/app/challenge-manager"]
