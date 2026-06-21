let str = prompt("Введіть тризначне число:");

if (str && str.length === 3) {
    if (str[0] === str[1] || str[0] === str[2] || str[1] === str[2] ) {
        alert("У числі є однакові цифри");
    } else {
        alert("Усі цифри різні");
    }
} else {
    alert("Помилка: число не тризначне");
}