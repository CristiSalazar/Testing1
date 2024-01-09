const socket = io()

document.getElementById('resetForm').addEventListener('submit', async (e) => {
    e.preventDefault()
    const password1 = document.querySelector("#pwd").value
    const password2 = document.querySelector("#pwd2").value
    const email = document.getElementById("emailPlaceholder").textContent;
    if(password1 != password2)
    {
        socket.emit("notMatchPass");
    }
    else
    {
        socket.emit("validActualPass", {password1, password2, email});
    }
    
})
