
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

	var tRow = { 
		parent_body: table_body, 
		data_row : data,
		elem : row, 
		id : idRow
	};

	tRow.elem.onclick = function () { 
			console.log("clicked on row " + tRow.data_row + " " + tRow.id ); 
			table.moveUp(tRow.id);
	};

	return tRow;
};
// initialize table object and sets the references with the
// actual HTML table

/*
tr:hover {
	-webkit-transform:translateY(-20px);
    transform:translateY(-20px);
}
*/

var preformTransition = function (e, movement, transition_end) {
    e.style["webkitTransition"] = "-webkit-transform";
    e.style["webkitTransitionDuration"] = "1.5s";
    e.style["webkitTransitionTimingFunction"] = "easeInSine";
    e.style["webkitTransform"]  = "translateY(-"+ movement +"px)";
    e.addEventListener( 
        'webkitTransitionEnd', 
        function( event ) { 
          console.log("transition ended");
          e.style["webkitTransition"] = "";
          e.style["webkitTransitionTimingFunction"] = "";
          e.style["webkitTransitionDuration"] = "";
          e.style["webkitTransform"]  = "";
          transition_end();
        }, false );
};

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
    var transition_end = function (tableObject, id) {
      return function() {
        var pivot = tableObject.rows[id];
        var row = pivot.elem, 
            pai = pivot.parent_body,
            sibling = row.previousElementSibling;
        pai.insertBefore(row, sibling);
        tableObject.rows[id] = tableObject.rows[id-1];
        tableObject.rows[id-1] = pivot; 
        tableObject.rows[id-1].id = id-1;
        tableObject.rows[id].id = id;
        console.log("moving up row " + id);
      }
    };

    preformTransition(this.rows[idRow].elem, 
        this.rows[idRow].elem.offsetHeight,
        transition_end (this, idRow));
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

