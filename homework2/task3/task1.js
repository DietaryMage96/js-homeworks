let lis = document.getElementsByTagName("li")
let indexle = -1

for (let i = 0; i < lis.length; i++) {
    lis[i].addEventListener("click", (e) => {

        if (e.ctrlKey) {
            if (lis[i].style.backgroundColor === "coral") {
                lis[i].style.backgroundColor = ""
            } else {
                lis[i].style.backgroundColor = "coral"
            }
        }

        else if (e.shiftKey && indexle != -1) {
            let start = Math.min(i, indexle)
            let end = Math.max(i, indexle)

            for (let j = start; j <= end; j++) {
                lis[j].style.backgroundColor = "coral"
            }
        }

        else {
            for (let j = 0; j < lis.length; j++) {
                lis[j].style.backgroundColor = ""
            }
            lis[i].style.backgroundColor = "coral"
        }

        indexle = i;
    });
}