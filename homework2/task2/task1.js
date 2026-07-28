let spans = document.getElementsByTagName("span")

function neshow(){
    let br = this.nextElementSibling
    if (br.style.display == "none") {
        br.style.display = "block"
    } else {
        br.style.display = "none"
    }
}

for (let i = 0; i < spans.length; i++) {
    spans[i].addEventListener("click", neshow)
}