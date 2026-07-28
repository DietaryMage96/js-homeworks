let lis = document.getElementsByTagName("li")
for(let i=0; i<lis.length; i++){
    let listring = lis[i].textContent
    if(listring.startsWith('http')){
        lis[i].style.textDecoration = "underline dashed blueviolet"
    }
}