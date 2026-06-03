# Alert Client Function

This cloud function queries the USDF's Alert Dashboard Grafana web API for alert count data from the specified time range, parses the response, and sends the response to the Redis Client Function for storage.

Using the Grafana web API is not an ideal long-term solution - ideally we query a fully fleshed out REST API at some point, but we have to make do with Grafana for now.


## API Description

Health checkpoint: `/`

Currently only one operational endpoint is exposed: `/alert-count`

This endpoint is called by Cloud Scheduler at a regular daily cadence. 

## Deployment

To deploy manually from the command line, just run:

```
sh deploy.sh
```

Merging a PR into the `main` brnach should deploy via Github Actions to the appropriate environment.