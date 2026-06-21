let num = +prompt("Введіть число від 0 до 9:");

switch (num) {
    case 1: {
        alert("!");
        break;
    }
    case 2: {
        alert("@");
        break;
    }
    case 3:
        alert("#");
        break;
    case 4:
        alert("$");
        break;
    case 5:
        alert("%");
        break;
    case 6:
        alert("^");
        break;
    case 7:
        alert("&");
        break;
    case 8:
        alert("*");
        break;
    case 9:
        alert("(");
        break;
    case 0:
        alert(")");
        break;
    default:
        alert("Невірна цифра");
}