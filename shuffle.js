module.exports = function(array) {
	var temp, j
	for (var i = array.length - 1; i > 0; i--) {
    	j = Math.floor(Math.random() * (i + 1))
    	temp = array[i]
    	array[i] = array[j]
    	array[j] = temp
    }
}
