const socket = io();

//Recieves file object
function appendImage(url, condition) {
    const imageContainer = document.querySelector('#display');
    let image = document.createElement('img')
    image.src = url.file; //Key-pair of file
    image.style = "width: 100%;"
    imageContainer.appendChild(image);
    if (condition)
        socket.emit('dbUpdate', url.file)
}

function appendImagebyDB(url) {
    const imageContainer = document.querySelector('#display');
    let image = document.createElement('img')
    image.src = url; //Key-pair of file
    image.style = "width: 100%;"
    imageContainer.appendChild(image);
}

socket.on('url', (url) => {
    appendImage(url, false);
})

socket.on('requestedDB', (dbArrayOb) => {
    dbArray = dbArrayOb.array;
    dbArray.forEach(elem => {
        appendImagebyDB(elem.value)
    });
})

//EventListener for input field
const inpFile = document.querySelector('#fileUpload');
inpFile.addEventListener("change", () => {

    const Filelist = event.target.files;
    const file = Filelist[0];

    reader = new FileReader();
    reader.onload = (e) => {
        let msg = {};
        msg.file = e.target.result;
        socket.emit('img', msg)
        console.log("Appending From Client JS")
        appendImage(msg, true)
    };
    reader.readAsDataURL(file);
})

//EventListener for button
const bmtn = document.querySelector('#fetch');
bmtn.addEventListener('click', () => {
    socket.emit('requestDB')
})

const clearBtn = document.querySelector('#Clear');
clearBtn.addEventListener('click', () => {
    socket.emit('clearDB')
})