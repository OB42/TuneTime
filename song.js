exports.get = function(e){
	var id = this.parentNode.parentNode.parentNode.id
	var name = this.innerText
	fileId = this.id
	dlId = fileId
	//if the song is from the same torent, we don't fetch it again
	if(currentTorrent.id === id && currentTorrent.name === lastData[id].title){
		song.playNext()
	}
	else{
		fetched = false
		randomId = 0
		randomDlId = 0
		currentTorrent.id = id
		currentTorrent.name = lastData[id].title
		function callback(){
			currentTorrent.torrent = lastData[id].torrent
			startFetching(name, id)
			currentTorrent.torrent.on('idle', onIdle)
		}
		if(typeof currentTorrent.torrent.destroy === "function"){
			currentTorrent.torrent.destroy(callback)
		}
		else{
			callback()
		}
	}
	e.preventDefault()
}
function startFetching(name, id){
	var k = 0
	randomIds = []
	for(var f = 0; f < currentTorrent.torrent.files.length;f++){
		randomIds.push(k++)
	}
	shuffle(randomIds)
	currentTorrent.torrent.files.sort(function(a, b){
		if(a.name < b.name){
			return -1
		}
		else if(a.name > b.name){
			return 1
		}
		return 0
	})
	song.playNext()
}
exports.playNext = function(){
	if(fileId !== -1){
		//unhighlighting the previous song
		(document.querySelector(".current") || {}).className = ""
		results.querySelectorAll("span:nth-child(" + (parseInt(currentTorrent.id) + 1)  + ") > .files > span:not(:first-child)")[fileId].className = "current"
		ext =  currentTorrent.torrent.files[fileId].name.split(".")
		ext = ext[ext.length - 1]
		player.src = "http://localhost:" + port
		if(currentTorrent.torrent.files[fileId].length > fs.statSync(__dirname + "/torrent-stream/" + currentTorrent.torrent.infoHash + "/" + currentTorrent.torrent.files[fileId].path).size){
			currentTorrent.torrent.files.filter(function(f){
				f.deselect()
			})
		}
	}
}
function onIdle(){
	var f = 0
	while(f++ < currentTorrent.torrent.files.length && currentTorrent.torrent.files[dlId].length === fs.statSync(__dirname + "/torrent-stream/" + currentTorrent.torrent.infoHash + "/" + currentTorrent.torrent.files[dlId].path).size){
		currentTorrent.torrent.files[dlId].fetched = true
		dlId = file.nextId(dlId, true)
	}
	if(!currentTorrent.torrent.files[dlId].fetched){
		currentTorrent.torrent.files[dlId].select()
	}
}
