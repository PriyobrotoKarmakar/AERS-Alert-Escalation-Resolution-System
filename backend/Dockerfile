# Stage 1: Build the Go app
FROM golang:alpine AS builder
WORKDIR /app


COPY . .
RUN go mod download


RUN go build -o api ./cmd/api/main.go


FROM alpine:latest
WORKDIR /app


COPY --from=builder /app/api .
COPY --from=builder /app/config ./config


EXPOSE 8080
CMD ["./api"]