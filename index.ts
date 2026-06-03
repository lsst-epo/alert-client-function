import * as ff from '@google-cloud/functions-framework';
import { RedisClientRequest, AlertCountRequest, RedisClientResponse } from './src/types/types';

ff.http('alert-count', async (req: ff.Request, res: ff.Response) => {
    const authHeader = req.headers.authorization;
    const BEARER_TOKEN = process.env.BEARER_TOKEN;
    const ALERT_COUNT_URI = String(process.env.ALERT_COUNT_URI);
    const CACHE_URI = String(process.env.CACHE_URI);
    const CACHE_TOKEN = process.env.CACHE_TOKEN;

    if (!authHeader || authHeader !== `Bearer ${BEARER_TOKEN}`) {
        console.error('Unauthorized attempt');
        return res.status(401).json({
            status: "ERROR",
            message: "Unauthorized: Missing or invalid token."
        });
    }
    res.set('Access-Control-Allow-Origin', "*")
    res.set('Access-Control-Allow-Methods', 'GET, POST, DELETE');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === "OPTIONS") {
        res.set('Access-Control-Allow-Methods', 'GET');
        res.set('Access-Control-Allow-Headers', 'Content-Type');
        res.set('Access-Control-Max-Age', '3600');
        res.status(204).send('');
        return;
    }

    if (req.path == "/") {
        return res.status(200).send("Health check succeeded"); 
    }

    // Determine how much time before to query 
    let currentUtcHour = new Date().getUTCHours();
    let queryFrom = "now/d-12h";
    if(currentUtcHour >= 22) {
        queryFrom = "now/d+12h";
    }
    if (req.path == "/alert-count") {
        let payload: AlertCountRequest = {
            "timeRange": {
                "from": queryFrom,
                "to": "now",
                "timezone": "utc"
            }
        };
        let response = await fetch(ALERT_COUNT_URI, {
            headers: {
                "Cache-Control": "no-cache",
                "content-type": "application/json"
            },
            method: "post",
            body: JSON.stringify(payload)
        });

        if(response.ok) {
            let results = await response.json();
            let alertData = results.results["Alert Total"].frames[0].data.values[1];
            let alertCount = alertData[alertData.length - 1];

            let cachePayload: RedisClientRequest = {
                "alertCount": {
                    "count": alertCount
                }
            };

            let cacheResponse = await fetch(CACHE_URI, {
                method: "post",
                headers: {
                    "Authorization": `Bearer ${CACHE_TOKEN}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(cachePayload)
            });

            if(cacheResponse.ok) {
                let cacheResults:RedisClientResponse | null = null;
                try {
                    cacheResults = await cacheResponse.json();
                } catch (e) {
                    console.info("an error occurred while unravelling the JSON");
                    console.info(e);
                }
                
                return res.json({ count: alertCount, cacheResponse: cacheResults});
            } else {
                let cacheResults = cacheResponse.json();
                return res.json(JSON.stringify({ status: "error", data: cacheResults}));
            }

        }
        let results = await response.json();
        return res.json(JSON.stringify({ status: "error", data: results}));
        
    }

});
