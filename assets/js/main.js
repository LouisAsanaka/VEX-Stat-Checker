$(document).ready(function() {
	$('#team').keyup(function(e) {
		console.log("Hello");
		clearTimeout($.data(this, 'timer'));
		if(e.keyCode == 13){
			search(true);
		}else{
			$(this).data('timer', setTimeout(search, 200));
		}
	});
});

var convArrToObj = function(array){
    var thisEleObj = new Object();
    if(typeof array == "object"){
        for(var i in array){
            var thisEle = convArrToObj(array[i]);
            thisEleObj[i] = thisEle;
        }
    }else {
        thisEleObj = array;
    }
    return thisEleObj;
};
var oldJSONStringify = JSON.stringify;
JSON.stringify = function(input){
    if(oldJSONStringify(input) == '[]')
        return oldJSONStringify(convArrToObj(input));
    else
        return oldJSONStringify(input);
};

function renameProperty(obj, oldName, newName) {
	// Do nothing if the names are the same
	if (oldName == newName) {
		return obj;
	}
	// Check for the old property name to avoid a ReferenceError in strict mode.
	if (obj.hasOwnProperty(oldName)) {
		obj[newName] = obj[oldName];
		delete obj[oldName];
	}
	return obj;
}

function search(force) {
    var teamId = $("#team").val();
    if (!force && teamId.length < 2) return; //wasn't enter, not > 1 char
    $.getJSON('https://api.vexdb.io/v1/get_skills', { season: "Starstruck", type: "2", team: teamId }, function(data) {		
		generateData(data);
    });
}

function generateData(data){
	var parsedJson = JSON.parse(JSON.stringify(data));
	var stats = [];

	for(var key in parsedJson){
		if(key === "result"){
			var resultLength = parsedJson[key].length;
			for(var i = 0; i < resultLength; i++) {
				var resultObject = parsedJson[key][i];
				
				var tempArray = [];
				$.each(resultObject, function(index, value){
					tempArray[index] = value;
				});
				parsedJson[key][i] = tempArray;
			}
		}
		stats[key] = parsedJson[key];
	}
	if(stats['status'] !== 1){
		$('#status').html("<p>Unable to fetch JSON data</p>");
		
		if(document.getElementById("result") !== null){
			document.getElementById("content").removeChild(document.getElementById("result"));
		}
		
		return;
	}else if(stats['size'] === 0){
		$('#status').html("<p>Team ID is incorrect or doesn't exist</p>");
		
		if(document.getElementById("result") !== null){
			document.getElementById("content").removeChild(document.getElementById("result"));
		}
		
		return;
	}
	$('#status').html("<p>Successfully received data</p>");
	
	var listOfKeys = ["sku", "type", "rank", "team", "program", "attempts", "score"];
	
	var elementArray = [];
	
	var length = stats['result'].length;
	for(var i = 0; i < length; i++){
		elementArray[i] = JSON.parse(JSON.stringify(stats['result'][i]));
	}

	var finalHTML = ConvertJsonToTable(elementArray, 'result', 'pure-table pure-table-bordered center', null);
	
	if(document.getElementById("result") !== null){
		document.getElementById("result").outerHTML = finalHTML;
	}else{
		var tableElement = document.createElement('table');
		document.getElementById("content").appendChild(tableElement);
		tableElement.outerHTML = finalHTML;
	}
	$('#result').css('text-align', 'center');
	$('#result').css('margin-left', 'auto');
	$('#result').css('margin-right', 'auto');
}