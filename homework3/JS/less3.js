let color = document.getElementById("color");
let eraser = document.getElementById("eraser");
let randomColor = document.getElementById("randomColor");
let clearBtn = document.getElementById("clear");
let applyBtn = document.getElementById("apply");
let table = document.getElementById("paintspace");

let paintcolor = "";
let isMouseDown = false;

document.addEventListener("mousedown", () => {
    isMouseDown = true;
});

document.addEventListener("mouseup", () => {
    isMouseDown = false;
});

color.addEventListener("change", () => {
    eraser.checked = false;
    randomColor.checked = false;
    paintcolor = color.value;
});

eraser.addEventListener("change", (e) => {
    let target = e.target.checked;
    if (target) {
        randomColor.checked = false;
        paintcolor = "#ffffff";
    } else {
        paintcolor = color.value;
    }
});

randomColor.addEventListener("change", (e) => {
    if (e.target.checked) {
        eraser.checked = false;
    }
});

function getRandomColor() {
    let r = Math.floor(Math.random() * 256);
    let g = Math.floor(Math.random() * 256);
    let b = Math.floor(Math.random() * 256);
    return `rgb(${r}, ${g}, ${b})`;
}

function paint(e) {
    let target = e.target;
    if (eraser.checked) {
        target.style.backgroundColor = "#ffffff";
    } else if (randomColor.checked) {
        target.style.backgroundColor = getRandomColor();
    } else {
        target.style.backgroundColor = paintcolor;
    }
}

applyBtn.addEventListener("click", () => {
    let height = +document.getElementById("width").value;
    let width = +document.getElementById("height").value;

    table.innerHTML = "";

    for (let i = 0; i < width; i++) {
        let tr = document.createElement("tr");
        for (let j = 0; j < height; j++) {
            let td = document.createElement("td");

            td.addEventListener("mousedown", (e) => {
                e.preventDefault();
                paint(e);
            });
            td.addEventListener("mouseenter", (e) => {
                if (isMouseDown) {
                    paint(e);
                }
            });

            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
});

clearBtn.addEventListener("click", () => {
    let cells = document.querySelectorAll("#paintspace td");
    cells.forEach((td) => {
        td.style.backgroundColor = "#ffffff";
    });
});

window.addEventListener("DOMContentLoaded", () => {
    eraser.checked = false;
    randomColor.checked = false;
    paintcolor = color.value;
    applyBtn.click();
});
