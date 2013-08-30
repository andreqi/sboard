
var findById = function(id) {
    return document.getElementById(id);
};

var table = {};

var table_row = function (table_body, data) {
    var body = table_body;
    var t_row = data;
    var row = document.createElement("tr");
    for (var i=0; i<data.length; i++) {
        var td = document.createElement("td");
        var text_node = document.createTextNode(data[i]);
        td.appendChild(text_node);
        row.appendChild(td);
    }
    row.onclick = function () { alert(data[0]); };
    body.appendChild(row);
    return function() { 
            var parent_body = table_body ; 
            var data_row = data;
            var elem = row; 
    };
};

var clear_child = function (node) {
    while (node.lastChild)    
        node.removeChild(node.lastChild);
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
       var tRow = table_row(table.body, data);
       this.rows.push(tRow);
       console.log(data[0]);
    };
};



var initApplication = function () {
    var btn = document.getElementById("genButton");
    initTable();
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

