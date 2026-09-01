
DIR=victoriametrics-victorialogsexplorer-panel
BASE ?= baseline
plugin-name=victoriametrics-victorialogs-explorer

generate:
	npx @grafana/create-plugin@latest \
		--pluginName=VictoriaLogsExplorer \
		--orgName=VictoriaMetrics \
		--pluginDescription="A grafana panel for explorer logs on VictoriaLogs." \
		--pluginType=panel \
		--nonInteractive && \
	cd $(DIR) && \
	git init && \
	git add . && \
	git commit -m "baseline" && \
	git tag baseline && \
	git update-ref -d HEAD

diff:
	@set -euo pipefail; \
	mkdir -p "patches/$(DIR)" && \
	cd "$(DIR)" && \
	git add -A && \
	git diff --cached --name-only "$(BASE)" | while read -r file; do \
		out="../patches/$(DIR)/$$file.patch" &&  \
		mkdir -p "$$(dirname "$$out")" &&  \
		git diff --binary --cached "$(BASE)" -- "$$file" > "$$out";  \
	done; \
	git reset -q

patch:
	cd $(DIR) && \
	git reset --hard baseline && \
	find ../patches/$(DIR) -name '*.patch' | while read patch; do \
		git apply "$$patch"; \
	done

clean:
	rm -rf $(DIR)

generate-by-docker:
	docker run --rm -v ${PWD}:/work -w /work node:lts-alpine3.23 \
	npx @grafana/create-plugin@latest \
		--pluginName=VictoriaLogsExplorer \
		--orgName=VictoriaMetrics \
		--pluginDescription="A grafana panel for explorer logs on VictoriaLogs." \
		--pluginType=panel \
		--nonInteractive && \
	cd $(DIR) && \
	git init && \
	git add . && \
	git commit -m "baseline" && \
	git tag baseline && \
	git update-ref -d HEAD

build:
	cd $(DIR) && \
	npm install && \
	npm run build

build-by-docker:
	docker run --rm -v ./$(DIR):/work -w /work node:lts-alpine3.23 \
	sh -c "npm install && npm run build"

docker-run-test:
	mkdir -p ./test/data/ && \
	mkdir -p ./test/config/ && \
	mkdir -p ./test/datasources/ && \
	docker run -it --rm \
		--name grafana_with_panel \
		-p 3001:3000 \
		-e GF_PUBLIC_DASHBOARDS_ENABLED=false \
		-e GF_PLUGINS_PREINSTALL=victoriametrics-logs-datasource \
		-v ./test/data/:/var/lib/grafana \
		-v ./test/config/:/etc/grafana \
		-v ./$(DIR)/dist/:/var/lib/grafana/plugins/$(plugin-name)/ \
		-v ./test/datasources/:/etc/grafana/provisioning/datasources/ \
		grafana/grafana:12.1

PKG_TAG=v0.2.0

docker-run-test-with-download:
	mkdir -p ./test/data/ && \
	mkdir -p ./test/config/ && \
	mkdir -p ./test/datasources/ && \
	mkdir -p ./test/plugins/ && \
	rm -rf ./test/plugins/* && \
	cd ./test/plugins/ && \
	wget "https://github.com/ahfuzhang/VictoriaLogsExplorer/releases/download/$(PKG_TAG)/victoriametrics-victorialogs-explorer-$(PKG_TAG).tar.gz" && \
	mkdir -p victoriametrics-victorialogs-explorer/ && \
	tar -xzf victoriametrics-victorialogs-explorer-$(PKG_TAG).tar.gz -C ./victoriametrics-victorialogs-explorer/
	docker run -it --rm \
		--name grafana_with_download \
		-p 3002:3000 \
		-e GF_PUBLIC_DASHBOARDS_ENABLED=false \
		-e GF_PLUGINS_PREINSTALL=victoriametrics-logs-datasource \
		-v ./test/data/:/var/lib/grafana \
		-v ./test/config/:/etc/grafana \
		-v ./test/plugins/victoriametrics-victorialogs-explorer/:/var/lib/grafana/plugins/victoriametrics-victorialogs-explorer/ \
		-v ./test/datasources/:/etc/grafana/provisioning/datasources/ \
		grafana/grafana:12.1

# make dist PKG_TAG=v0.2.0
dist:
	mkdir -p ./dist/$(DIR) && \
	cd $(DIR)/dist/ && \
	tar -czf ../../dist/$(DIR)/$(plugin-name)-$(PKG_TAG).tar.gz ./* && \
	cd ../../ && \
	sha1sum dist/$(DIR)/$(plugin-name)-$(PKG_TAG).tar.gz > \
	  dist/$(DIR)/$(plugin-name)-$(PKG_TAG)_checksums_tar.gz.txt

# make gh-upload-release PKG_TAG=v0.2.0
gh-upload-release:
	gh release create $(PKG_TAG) \
		dist/$(DIR)/$(plugin-name)-$(PKG_TAG).tar.gz \
		dist/$(DIR)/$(plugin-name)-$(PKG_TAG)_checksums_tar.gz.txt \
		--title "$(PKG_TAG)" \
		--notes "$(plugin-name), version $(PKG_TAG) release."

.PHONY: generate diff patch build dist gh-upload-release


start_test_vlogs_server:
	docker run -d --rm --name victorialogs \
		-p 9428:9428 \
		--cpuset-cpus="4,5" \
		-m 512m \
		-v /Users/ahfu/Downloads/temp/VictoriaLogsData/:/data/ \
		-e GOMAXPROCS=2 \
		victoriametrics/victoria-logs:v1.50.0 \
		-storageDataPath=/data/ \
		-inmemoryDataFlushInterval=30s \
		-memory.allowedPercent=80 \
		-retentionPeriod=3d
