
// UTILS
var clear_child = function (node) {
    while (node.lastChild)    
        node.removeChild(node.lastChild);
};


var findById = function(id) {
    return document.getElementById(id);
};

// main objects
var table = {};

// creating new row object and linking to the table
// it also links the onclick event
var table_row = function (table_body, data, idRow) {
    var body = table_body;
    var t_row = data;
    var row = document.createElement("tr");
    for (var i=0; i<data.length; i++) {
        var td = document.createElement("td");
        var text_node = document.createTextNode(data[i]);
        td.appendChild(text_node);
        row.appendChild(td);
    }
    body.appendChild(row);
	var tRow =  function() { 
		var parent_body = table_body ; 
		var data_row = data;
		var elem = row; 
		var id = idRow;
		row.onclick = function () { 
			alert("clicked on row " + id); 
			table.moveUp(id);
		};
	};
	tRow();
	return tRow;
};
// initialize table object and sets the references with the
// actual HTML table

var initTable = function () {
    table.id = "scoreboard_table";
    table.elem = findById(table.id);
    table.header = table.elem.childNodes[1];
    table.body = table.elem.childNodes[3];
	table.rows = [];
    table.clear = function () {
        //alert(this.id);
		this.rows.length = 0;
        clear_child(table.body);
        console.log(this.id);
    };
    table.addRow = function(data) {
       //alert(data[0]);
       var tRow = table_row(table.body, data, this.rows.length);
       this.rows.push(tRow);
       console.log(data[0]);
    };
	table.moveUp = function(idRow) {
		if (idRow === 0) return;
		// swapear idRow con idRow - 1 
		// estaba pensando en reemplazar tambien los nodos originales de DOM
		// pero es mas facil solo reescribir el contenido 
		// y luego hacer un repaint
		// Para el efecto de ir arriba tener una copia de idRow con zIndex > que idRow - 1
		// al momento que se cruzan, 
		console.log("moving up row " + idRow);
	};
};


// EntryPoint
var initApplication = function () {
    var btn = document.getElementById("genButton");
    initTable();
    // mock to create random data when the button genButton is 
    // pressed
    btn.onclick = function () {
        var rows = parseInt(findById("rowNum").value, 10);  
        if (isNaN(rows)) return;
        if (rows <= 0) return;
        table.clear();
        for (var i = 0; i < rows; i++) 
            table.addRow(["Name " + (i + 1), "p1", "p2", "p3"]);
    };
};


document.onreadystatechange = function() {
    if (document.readyState != "complete") return;
    initApplication();
};

