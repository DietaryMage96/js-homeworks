let box = document.getElementById("box")
let corner = document.getElementById("corner")

corner.onmousedown = (e) => {
    e.preventDefault()

    document.onmousemove = (e) => {
        box.style.width = e.clientX - box.offsetLeft + "px"
        box.style.height = e.clientY - box.offsetTop + "px"
    }

    document.onmouseup = () => {
        document.onmousemove = null
    }
}