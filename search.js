module.exports = function(page, keywords, callback){
	var results = {}
	var r = 0
	var biggest = 0
	var urlBiggest = ""
	var urls = Object.getOwnPropertyNames(sites)
	urls.filter(function(url){
		scrapeasy(replace(url, page, keywords), sites[url].pattern, function(err, data){
			r++
			if(err){
				console.log(err)
			}
			else{
			   results[url] = data.music
			   if(biggest <  results[url].length){
				   biggest = results[url].length
				   urlBiggest = url
			   }
			}
			if(r === urls.length){
				results = results[urlBiggest].reduce(function(arr, v, i) {
					var temp = []
					urls.filter(function(u){
						if(typeof results[u][i] !== "undefined"){
							temp.push(Object.assign({site: u}, results[u][i]))
						}
					})
					return arr.concat(temp);
				}, [])
				show(results)
			}
		})
	})
}
function replace(url, page, keywords){
	if(sites[url].fromZero){
		page--
	}
	var separator = url.match(/album(.+)album/)[1]
	var query = keywords.replace(/\s+/g, separator)
	return url.replace("album" + separator + "album", query).replace("PAGE_TO_USE", page)
}
function show(music){
	var offset = lastData.length
	lastData = lastData.concat(music)
	for(var m = 0; m < music.length; m++){
		var span = document.createElement("span")
		var a = document.createElement("a")
		a.href = "#"
		a.id = m + offset
		a.innerText = music[m].title
		a.addEventListener("click", file.get)
		span.appendChild(a)
		var cont = document.createElement("span")
		cont.id = a.id
		cont.appendChild(span)
		results.insertBefore(cont, loadMoreCenter)
	}
}
