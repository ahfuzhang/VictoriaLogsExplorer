# VictoriaLogsExplorer

An all-in-one Grafana panel for exploring logs stored in [VictoriaLogs](https://github.com/VictoriaMetrics/VictoriaLogs).

![All-in-one log explorer](https://raw.githubusercontent.com/ahfuzhang/VictoriaLogsExplorer/main/doc/images/all-in-one-log-explorer.png)

## Overview

VictoriaLogsExplorer puts log searching, filtering and viewing into a single panel. Pick stream fields and values, add field filters or write [LogsQL](https://docs.victoriametrics.com/victorialogs/logsql/) directly, and see the matching logs together with a hits chart over time, without switching between several panels and queries.

## Requirements

- Grafana 11.6 or newer.
- A VictoriaLogs instance.
- The [VictoriaLogs data source plugin](https://github.com/VictoriaMetrics/victorialogs-datasource) (`victoriametrics-logs-datasource`), configured to connect to that instance.

## Getting Started

1. Install this plugin and restart Grafana.
2. Create a dashboard and add a visualization. Choose the **VictoriaLogs data source** and select the **VictoriaLogsExplorer** visualization.
3. Use the filters in the panel to select stream fields and values, or edit the generated LogsQL.
4. Adjust the panel options to fit your logs. The available options are:
   - **Show logsql textarea**: show or hide the LogsQL textarea and its actions.
   - **Stream field list**: comma-separated stream fields to display. By default all stream fields are shown.
   - **LogsQL Varaible** (default `$logsql`): the generated LogsQL is written to this dashboard variable so other panels can reference it.
   - **Hits Group Field List** (default `level`): comma-separated fields to group by when calculating hit counts.
   - **JSON config**: JSON for more complex setups, such as extra stream filter rules and fixed field filter rules.

Ready-made example dashboards are available in the [dashboard](https://github.com/ahfuzhang/VictoriaLogsExplorer/tree/main/dashboard) directory of the repository.

## Documentation

- Source code and issues: https://github.com/ahfuzhang/VictoriaLogsExplorer
- VictoriaLogs: https://docs.victoriametrics.com/victorialogs/
- LogsQL: https://docs.victoriametrics.com/victorialogs/logsql/

## Contributing

Bug reports and pull requests are welcome at https://github.com/ahfuzhang/VictoriaLogsExplorer/issues.

## License

Apache License 2.0.
