package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	r.GET("/ping", func(ctx *gin.Context) {
		ctx.Data(http.StatusOK, "text/plain", []byte("pong\n"))
	})

	r.Run(":8080")
}
