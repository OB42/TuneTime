exports.nextId = function(fileId, dl){
	if(!loop){
		if(goBack){
			if(fileId){
				fileId--
			}
			else{
				fileId = currentTorrent.torrent.files.length - 1
			}
		}
		else if(random){
			if(dl){
			    if(randomDlId === currentTorrent.torrent.files.length - 1){
			        shuffle(randomIds)
					randomDlId = 0
				}
			    fileId = randomIds[randomDlId++]
			}
			else{
			    if(randomId === currentTorrent.torrent.files.length - 1){
			        shuffle(randomIds)
					randomId = 0
			    }
				fileId = randomIds[randomId++]
			}
		}
		else if(fileId < currentTorrent.torrent.files.length - 1){
			fileId++
		}
		else{
			fileId = 0
		}
	}
    return fileId
}
exports.supported = function(name){
	var support = false
	for(var s = 0; s < supported.length; s++){
		if(name.slice(name.length - supported[s].length) === supported[s]){
			support = true
			break
		}
	}
	return support
}
exports.get = function(e){
	var current = this
	var less = current.parentNode.parentNode.querySelector(".less")
	if(less && less.parentNode.getAttribute("style") === "display: none;"){
			less.parentNode.setAttribute("style", "")
	}
	getTorrent(current)
	e.preventDefault()
}
exports.show = function(current){
	var parent = current.parentNode.parentNode
	var less = parent.querySelector(".less")
	if(!less){
		parent.innerHTML += `<p class="files"><span class="less"><a href="#">―</a></span></p>`
		less = parent.querySelector(".less")
		less.addEventListener("click", function(e){
			this.parentNode.setAttribute("style", "display: none;")
			e.preventDefault()
		})
		var files = less.parentNode
		lastData[current.id].torrent.files.sort(function(a, b){
			if(a.name < b.name){
				return -1
			}
			else if(a.name > b.name){
				return 1
			}
			return 0
		})
		var tempId = 0
		lastData[current.id].torrent.files.filter(function(f){
			var span = document.createElement("span")
			var a = document.createElement("a")
			a.href = "#"
			a.innerText = f.name
			a.id = tempId++
			span.appendChild(a)
			files.appendChild(span)
			a.addEventListener("click", song.get)
		})
	}
	parent.querySelector("a").addEventListener("click", file.get)
}
