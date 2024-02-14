const socket = io()

document.getElementById('prod-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const idInput = document.getElementById('productId');
    const id = idInput.value;
    idInput.value = '';

    const emailInput = document.getElementById('correoLogin');
    const email = emailInput.value;

    const descInput = document.getElementById('desc');
    const description = descInput.value;
    descInput.value = '';

    const priceInput = document.getElementById('price');
    const price = priceInput.value;
    priceInput.value = '';

    const stockInput = document.getElementById('stock');
    const stock = stockInput.value;
    stockInput.value = '';

    const quantityInput = document.getElementById('available');
    const quantity = quantityInput.value;

    const ownerInput = document.getElementById('owner');
    const owner = ownerInput.value;
    ownerInput.value = '';


    const eliminarProductoCheckbox = document.getElementById('eliminarProducto');
    const eliminarProducto = eliminarProductoCheckbox.checked;

    if (eliminarProducto) {
        socket.emit("delProdPremium", { id: id, owner: owner, email: email });
    }else{
        const newProduct = {
            description: description,
            price: price,
            stock: stock,
            quantity: quantity,
            owner: owner,
        }
    
        if (id === '') {
            socket.emit("newProd", newProduct);
        } else {
            socket.emit("updProd", { id: id, newProduct });
        }
    }
});
