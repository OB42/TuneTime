module.exports = function(current){
	if(lastData[current.id].url.slice(0,4) === "http"){
		fetch(lastData[current.id].url)
		.then(function(response) {
			return response.blob();
		})
		.then(function(b){
			toBuffer(b, function (err, buffer) {
				if (err) throw err
				var torrent = parseTorrent(buffer)
				lastData[current.id].torrent = torrentStream(buffer, {tmp: __dirname, path: __dirname + "/torrent-stream/" + torrent.infoHash})
				keepAudioOnly(current.id)
				file.show(current)
			})
		})
	}
	else{
		var filename = lastData[current.id].url.split("magnet:?xt=urn:btih:")[1].split("&dn=")[0]
		fs.readFile(__dirname + "/torrent-stream/" + filename + ".torrent"+ filename, function(err, torrent){
			if(err){
				lastData[current.id].torrent = torrentStream(lastData[current.id].url, {tmp: __dirname, path: __dirname + "/torrent-stream/" + filename})
			}
			else{
				lastData[current.id].torrent = torrentStream(torrent, {tmp: __dirname, path: __dirname + "/torrent-stream/" + filename})
			}
			lastData[current.id].torrent.on("ready", function(){
				keepAudioOnly(current.id)
				file.show(current)
			})
		})
	}
}
function keepAudioOnly(id){
	for(var f = lastData[id].torrent.files.length - 1; f > -1;f--){
		if(!file.supported(lastData[id].torrent.files[f].name)){
			lastData[id].torrent.files.splice(f, 1)
		}
	}
}
