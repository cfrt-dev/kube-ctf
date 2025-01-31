package main

import (
	"context"
	"log"
	"net/http"

	"challenge-manager/pkg/forms"

	"github.com/gin-gonic/gin"
	helmclient "github.com/mittwald/go-helm-client"
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

		chartSpec := helmclient.ChartSpec{
			ReleaseName: queryParams.Name,
			ChartName:   "/app/charts/challenge.tgz",
			Namespace:   queryParams.Namespace,
			Wait:        false,
		}

		helmClient, err := helmclient.New(&helmclient.Options{
			Namespace:        queryParams.Namespace,
			RepositoryCache:  "/tmp/.helmcache",
			RepositoryConfig: "/tmp/.helmrepo",
			Debug:            true,
		})

		if err != nil {
			log.Printf("Failed to create helm client - %s\n", err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
			return
		}

		if _, err := helmClient.InstallOrUpgradeChart(context.Background(), &chartSpec, nil); err != nil {
			log.Printf("Failed to install chart - %s\n", err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
			return
		}

		c.AbortWithStatus(http.StatusOK)
	})

	api.DELETE("/challenge", func(c *gin.Context) {
		queryParams := forms.QueryParams{
			Namespace: "default",
		}

		if err := c.ShouldBindQuery(&queryParams); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": "Wrong query params format - " + err.Error()})
			return
		}

		helmClient, err := helmclient.New(&helmclient.Options{
			Namespace:        queryParams.Namespace,
			RepositoryCache:  "/tmp/.helmcache",
			RepositoryConfig: "/tmp/.helmrepo",
			Debug:            true,
		})

		if err != nil {
			log.Printf("Failed to create helm client - %s\n", err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
			return
		}

		if err := helmClient.UninstallReleaseByName(queryParams.Name); err != nil {
			log.Printf("Failed to remove chart - %s\n", err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
			return
		}

	})

	r.Run(":8080")
}
