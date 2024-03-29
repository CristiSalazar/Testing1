const socket = io()

document.getElementById('user-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const idInput = document.getElementById('userId');
    const id = idInput.value;
    idInput.value = '';

    const nameInput = document.getElementById('name');
    const name = nameInput.value;
    nameInput.value = '';

    const emailInput = document.getElementById('email');
    const email = emailInput.value;
    emailInput.value = '';

    const rolInput = document.getElementById('rol');
    const rol = rolInput.value;
    rolInput.value = '';

    const eliminarUserCheckbox = document.getElementById('eliminarUser');
    const eliminarUser = eliminarUserCheckbox.checked;

    if (eliminarUser) {
        socket.emit("delUser", { id: id });
    }else{
        socket.emit("updRolUser", { id: id, newRol: rol });
    }
});