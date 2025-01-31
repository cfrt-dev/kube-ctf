#!/bin/bash

mkdir -p packaged-charts

find . -name Chart.yaml | while read chart_yaml; do
    chart_dir=$(dirname "$chart_yaml")
    chart_name=$(grep '^name:' "$chart_yaml" | awk '{print $2}')

    (
        helm package "$chart_dir" -d packaged-charts >/dev/null
        latest_package=$(ls -t packaged-charts/*.tgz | head -n1)
        mv "$latest_package" "packaged-charts/${chart_name}.tgz"
        echo "Packaged: ${chart_name}.tgz"
    )
done

echo "All charts packaged to packaged-charts/ directory"
