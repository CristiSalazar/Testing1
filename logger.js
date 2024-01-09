import winston from "winston/lib/winston/transports"

const devLogger = winston.createLogger({
    level: "debug",
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
    ),
    transports:[ new winston.transports.Console()],
})

const prodLogger = winston.createLogger({
    level: "info",
    format: winston.format.json(),
    transports:[ 
        new winston.transports.File({filename: "INFO.log"}),
        new winston.transports.File({filename: "ERRORS.log", level: "error"})

    ],
})

const logger = (process.env.ENV === "production" ? prodLogger : devLogger)
export default logger
