
FROM golang:alpine AS builder
WORKDIR /app


COPY go.mod go.sum ./
RUN go mod download


COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o api ./cmd/api/main.go


FROM alpine:latest
WORKDIR /app

RUN apk --no-cache add ca-certificates


COPY --from=builder /app/api .
COPY --from=builder /app/config ./config


RUN addgroup -g 1001 -S appuser && \
    adduser -u 1001 -S appuser -G appuser && \
    chown -R appuser:appuser /app

USER appuser


ENV PORT=8080
EXPOSE 8080


CMD ["./api"]