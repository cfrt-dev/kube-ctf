package helm

import (
	"challenge-manager/pkg/forms"
	"log"
	"os"

	"helm.sh/helm/v3/pkg/action"
	"helm.sh/helm/v3/pkg/chart/loader"
	"helm.sh/helm/v3/pkg/cli"
)

func DeployChart(chartPath string, req forms.ChallengeRequest, metadata forms.QueryParams) error {
	actionConfig := new(action.Configuration)
	settings := cli.New()
	if err := actionConfig.Init(settings.RESTClientGetter(), metadata.Namespace, os.Getenv("HELM_DRIVER"), log.Printf); err != nil {
		return err
	}

	install := action.NewInstall(actionConfig)
	install.ReleaseName = metadata.Name
	install.Namespace = metadata.Namespace
	install.CreateNamespace = false

	chart, err := loader.LoadFile(chartPath)
	if err != nil {
		return err
	}

	_, err = install.Run(chart, forms.StructToMap(req))
	return err
}

func DeleteChart(releaseName, namespace string) error {
	actionConfig := new(action.Configuration)
	settings := cli.New()
	if err := actionConfig.Init(settings.RESTClientGetter(), namespace, os.Getenv("HELM_DRIVER"), log.Printf); err != nil {
		return err
	}

	uninstall := action.NewUninstall(actionConfig)
	_, err := uninstall.Run(releaseName)
	return err
}
