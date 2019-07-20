$(document).ready(function() {
	$('#team-id').keyup(function(e) {
		clearTimeout($.data(this, 'timer'));
		if (e.keyCode == 13) {
			search(true);
		} else {
			$(this).data('timer', setTimeout(search, 200));
		}
    });
    $("#season").change(function() {
        search(false);   
    });
});

const convertToObj = function(array) {
    let thisEleObj = new Object();
    if (typeof array == "object") {
        for (let i in array) {
            let thisEle = convertToObj(array[i]);
            thisEleObj[i] = thisEle;
        }
    } else {
        thisEleObj = array;
    }
    return thisEleObj;
};
let oldJSONStringify = JSON.stringify;
JSON.stringify = function(input) {
    if (oldJSONStringify(input) == '[]') {
        return oldJSONStringify(convertToObj(input));
    } else {
        return oldJSONStringify(input);
    }
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
    let teamId = $("#team-id").val();
    if (!force && teamId.length < 2) return; // wasn't enter, not > 1 char
    $.ajax({
        url: 'https://api.vexdb.io/v1/get_skills',
        dataType: 'json',
        data: {
            team: teamId,
            type: 2,
            season: $("#season :selected").text()
        },
        jsonp: false,
        success: function(data) {
            console.log(data);
            generateData(data);
        }
    });
}

function generateData(data) {
	let parsedJson = JSON.parse(JSON.stringify(data));
	let stats = [];

	for (let key in parsedJson) {
		if (key === "result") {
			let resultLength = parsedJson[key].length;
			for (let i = 0; i < resultLength; i++) {
				let resultObject = parsedJson[key][i];
				
				let tempArray = [];
				$.each(resultObject, function(index, value){
					tempArray[index] = value;
				});
				parsedJson[key][i] = tempArray;
			}
		}
		stats[key] = parsedJson[key];
    }
	if (stats['status'] !== 1) {
		$('#status').html("<p>Unable to fetch JSON data</p>");
		
		if (document.getElementById("result") !== null) {
			document.getElementById("content").removeChild(document.getElementById("result"));
		}
		return;
	} else if(stats['size'] === 0) {
		$('#status').html("<p>No data</p>");
		
		if (document.getElementById("result") !== null) {
			document.getElementById("content").removeChild(document.getElementById("result"));
		}
		
		return;
	}
	$('#status').html("<p>Successfully received data</p>");
	
	const listOfKeys = ["sku", "type", "rank", "team", "program", "attempts", "score"];
	
	let elementArray = [];
	
	let length = stats['result'].length;
	for (let i = 0; i < length; i++) {
		elementArray[i] = JSON.parse(JSON.stringify(stats['result'][i]));
	}

	let finalHTML = ConvertJsonToTable(elementArray, 'result', 'pure-table pure-table-bordered center', null);
	
	if (document.getElementById("result") !== null) {
		document.getElementById("result").outerHTML = finalHTML;
	} else {
		let tableElement = document.createElement('table');
		document.getElementById("content").appendChild(tableElement);
		tableElement.outerHTML = finalHTML;
	}
	$('#result').css('text-align', 'center');
	$('#result').css('margin-left', 'auto');
	$('#result').css('margin-right', 'auto');
}