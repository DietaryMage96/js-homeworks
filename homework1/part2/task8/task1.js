let dovz = +prompt("Введіть довжину кола:");
let per = +prompt("Введіть периметр квадрата:");

let dia = dovz / Math.PI;
let stor = per / 4;

let vlize = (dia <= stor)
    ? "Коло поміститься у квадрат"
    : "Коло НЕ поміститься у квадрат";

alert(vlize);