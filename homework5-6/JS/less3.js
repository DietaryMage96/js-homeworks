let color = document.getElementById("color");
let paintcolor = "";


color.addEventListener("change", () => {
    paintcolor = color.value;
})

document.getElementById("eraser").addEventListener("change", (e) => {
    let target = e.target.checked;
    if(target){
        paintcolor = "#ffffff";
    }else{
        paintcolor = color.value;
    }
})

function paint(e){
    let target = e.target;
    target.style.backgroundColor = paintcolor;
}

document.getElementById("apply").addEventListener("click", () => {
    let width = +document.getElementById("width").value;
    let height = +document.getElementById("height").value;

    let table = document.getElementById("paintspace");
    for(let i=0; i<width; i++){
        let tr = document.createElement("tr");
        for(let j=0; j<height; j++){
            let td = document.createElement("td");
            td.addEventListener("click", paint)
            tr.appendChild(td);

        }
        table.appendChild(tr);
    }

})

window.addEventListener("DOMContentLoaded", () => {
    document.getElementById("eraser").checked = false;
    paintcolor = color.value;
})