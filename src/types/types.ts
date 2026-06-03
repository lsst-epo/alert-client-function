export type RedisClientRequest = {
    alertCount: {
        count: number
    }
}

export type RedisClientResponse = {
    status: string
    message: string
}

export type AlertCountRequest = {
    timeRange: {
        from: string
        to: string
        timezone: string
    }
}