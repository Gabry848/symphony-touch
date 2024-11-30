window.addEventListener("DOMContentLoaded", ()=>{
    const replace = (id, text)=>{
        const element = document.getElementById(id)
        if(element) element.innerText = text
    }

    for (const type of ["node", "cromium", "electron"]){
        replace(type+"-version", "ciao da preload")
    }
})