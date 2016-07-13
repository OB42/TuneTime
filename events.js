var search = require("./search")
document.querySelector("form").addEventListener("submit", function(e){
	var torrents = document.querySelectorAll(".results > span")
	for(var t = 0; t < torrents.length; t++){
		results.removeChild(torrents[t])
	}
	lastData = []
	lastSearch = {page: 2, query: searchBar.value}
	search(1, searchBar.value)
	e.preventDefault()
})
player.addEventListener("ended", next)
function next(){
	fileId = file.nextId(fileId)
	goBack = false
	goFurther = false
	song.playNext()
}
document.querySelector(".btn > input").addEventListener("input", function(){
	player.volume = 1 * volume.value
	if(1 * volume.value === 0){
		buttons[1].innerHTML = "🔇"
	}
	else{
		buttons[1].innerHTML = "🔉"
	}
})
document.querySelector(".more").addEventListener("click", function(){
	search(lastSearch.page++, lastSearch.query)
})
function changePlay(){
	if(this.innerHTML === "⏸"){
		buttons[0].innerHTML = "►"
		player.pause()
	}
	else{
		buttons[0].innerHTML = "⏸"
		player.play()
	}
	this.onclick = changePlay
}
player.onplay = function(){
	buttons[0].innerHTML = "⏸"
}
player.onpause = function(){
	buttons[0].innerHTML = "►"
}
buttons[0].onclick = changePlay
buttons[2].addEventListener("click", function(e){
	goBack = true
	next()
})
buttons[3].addEventListener("click", function(e){
	goFurther = true
	next()
})
buttons[4].addEventListener("click", function(e){
	if(loop){
		loop = false
		this.className = ""
	}
	else{
		loop = true
		this.className = "active"
	}
})
buttons[5].addEventListener("click", function(e){
	if(random){
		random = false
		this.className = ""
	}
	else{
		random = true
		this.className = "active"
	}
	e.preventDefault()
})
