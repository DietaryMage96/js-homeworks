let textBlock = document.getElementById("textBlock")
let editBlock = document.getElementById("editBlock")

document.addEventListener("keydown", (e)=> {

    if ((e.ctrlKey || e.metaKey) && e.code === "KeyE") {
        e.preventDefault()

        editBlock.value = textBlock.textContent
        textBlock.style.display = "none"
        editBlock.style.display = "block"
        editBlock.focus()
    }

    if ((e.ctrlKey || e.metaKey) && e.code === "KeyS") {
        e.preventDefault()

        textBlock.textContent = editBlock.value
        editBlock.style.display = "none"
        textBlock.style.display = "block"
    }
})