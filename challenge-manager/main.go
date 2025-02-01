package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"challenge-manager/pkg/forms"
	"challenge-manager/pkg/helm"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	api := r.Group("/api")

	api.POST("/challenge", func(c *gin.Context) {
		queryParams := forms.QueryParams{
			Namespace: "default",
		}

		if err := c.ShouldBindQuery(&queryParams); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": "Wrong query params format - " + err.Error()})
			return
		}

		var challengeRequest forms.ChallengeRequest
		if err := c.ShouldBindJSON(&challengeRequest); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": "Wrong body format - " + err.Error()})
			return
		}

		err := helm.DeployChart("/app/charts/challenge.tgz", challengeRequest, queryParams)
		if err != nil {
			log.Printf("Failed to deploy chart - %s\n", err)
			c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
			return
		}

		c.Status(http.StatusCreated)
	})

	api.DELETE("/challenge", func(c *gin.Context) {
		queryParams := forms.QueryParams{
			Namespace: "default",
		}

		if err := c.ShouldBindQuery(&queryParams); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": "Wrong query params format - " + err.Error()})
			return
		}

		err := helm.DeleteChart(queryParams.Name, queryParams.Namespace)
		if err != nil {
			log.Printf("Failed to delete chart - %s\n", err)
			c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
			return
		}

		c.Status(http.StatusNoContent)
	})

	r.Run(fmt.Sprintf(":%s", os.Getenv("PORT")))
}
