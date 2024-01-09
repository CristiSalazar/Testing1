import { Router } from "express";
import TicketDTO from "../dao/DTOs/ticket.dto.js";
import { ticketService } from "../repositories/index.js";
import Tickets from "../dao/mongo/tickets.mongo.js"

const router = Router()

const ticketMongo = new Tickets()

router.get("/", async (req, res) => {
    req.logger.info('Tickets cargados');
    let result = await ticketMongo.get()
    res.send({ status: "success", payload: result })
})

router.post("/", async (req, res) => {
    let { amount, purchaser } = req.body
    let ticket = new TicketDTO({ amount, purchaser })
    let result = await ticketService.createTicket(ticket)
    if(result){
        req.logger.info('Ticket creado de forma correcta');
    }else{
        req.logger.error("No se puede crear ticket");
    }
})

export default router