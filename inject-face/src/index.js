const likeBox = document.getElementById('like-box')

const createFace = function () {
    const face = Math.floor(Math.random() * 6) + 1;
    const trajectory = Math.floor(Math.random() * 11) + 1; // bl1~bl11

    const div = document.createElement('div')

    div.className = `face${face} trajectory${trajectory}`;
    div.addEventListener("animationend", () => {
        if(likeBox.contains(div)){
            likeBox.removeChild(div)
        }
    });
    return div
}

setInterval(()=>{
    const face = createFace()
    likeBox.appendChild(face)
}, 120)
likeBox.addEventListener('click', function () {
    const face = createFace()
    likeBox.appendChild(face)
})