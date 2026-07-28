let tbody = document.getElementsByTagName("tbody")[0]

let headers = document.getElementsByTagName("th")

for (let i = 0; i < headers.length; i++) {
    headers[i].addEventListener("click", () => {
        let rows = []
        for (let j = 0; j < tbody.rows.length; j++) {
            rows.push(tbody.rows[j])
        }

        rows.sort((a, b) => {
            let textA = a.cells[i].textContent
            let textB = b.cells[i].textContent

            let numA = +textA
            let numB = +textB

            if (!isNaN(numA) && !isNaN(numB)) {
                return numA - numB;
            }

            if (textA > textB) {
                return 1;
            }
            if (textA < textB) {
                return -1;
            }

            return 0;
        })

        for (let j = 0; j < rows.length; j++) {
            tbody.appendChild(rows[j])
        }
    })
}