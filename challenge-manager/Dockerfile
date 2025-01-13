FROM golang:1.23.5-alpine3.20 AS builder
WORKDIR /app

RUN apk add --no-cache upx

COPY go.mod go.sum ./
RUN go mod download && go mod verify

COPY . .

RUN go build -ldflags="-extldflags=-static -w -s" -o challenge-manager .
RUN upx --lzma challenge-manager

FROM scratch AS final
WORKDIR /app

COPY --from=builder /app/challenge-manager .
COPY --from=builder /app/charts ./

ENTRYPOINT ["/app/challenge-manager"]
