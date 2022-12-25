function login() {
    bnt1.classList.add("wait")
    $.ajax({
        url : "/login",
        method : 'POST',
        type : 'POST',
        data : {
            username : username.value,
            password : password.value,
        },
        success : async (data)=>{
            if(data == "ok"){
                document.location.pathname = "/dashboard"
            }else{
                bnt1.classList.remove("wait")
            }
        }
    })
}

document.querySelector("form").addEventListener("submit",(e)=>{
    e.preventDefault()
})
