import winston from "winston/lib/winston/config"
import logger from "./logger.js"

const logger = require("./logger")

const loggerMiddleware = function(req,res,next){
    req.logger = logger
    next()
}

export default loggerMiddleware
