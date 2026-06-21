let year = +prompt("Введіть рік:");

let a;

if ((year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)) {
    a = true;
} else {
    a = false;
}

let b = a ? "Високосний рік" : "Не високосний рік";

alert(b);