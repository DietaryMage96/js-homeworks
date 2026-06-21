let usd = +prompt("Введіть кількість USD:");
if(usd < 0){
    alert("Введіть коректну кількість");
} else{
    let currency = prompt("Виберіть валюту (EUR, UAH, AZN):");
    let rate;

    switch (currency.toUpperCase()) {
        case 'EUR':
            rate = 0.87;
            break;
        case 'UAH':
            rate = 44.83;
            break;
        case 'AZN':
            rate = 1.70;
            break;
        default:
            rate = 0;
            alert("Невідома валюта");
    }

    if (rate > 0) {
        alert(usd * rate);
    }
}