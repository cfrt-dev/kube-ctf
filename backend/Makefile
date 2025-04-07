CONTAINER_TOOL ?= docker
IMG ?= docker.io/cyberfather/challenge-manager

.PHONY: build
build:
	$(CONTAINER_TOOL) build -t ${IMG} .

.PHONY: push
push: build
	$(CONTAINER_TOOL) push ${IMG}
