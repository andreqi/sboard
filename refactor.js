var board_handler = (function () {

	var rep = function (i, n, f) {
		for (var x = i; x < n; x++) {
			f(x);
		}
	};

	var table = {
		body : null, 
		nodes : null,
		in_transition : false,
		init_table : function () {
			this.body = scoreboard_table.childNodes[3];
			this.nodes = [];
			in_transition = false;
		}, 
		clear : function () {
			this.nodes.length = 0;
			while (this.body.lastChild)
				this.body.removeChild(this.body.lastChild);
			in_transition = false;
		},
		delete_node : function (id) {
			var prev = null;
			var next = null;
			var row = this.nodes[id];
			if (row.prev_id >= 0) 
				prev = this.nodes[row.prev_id];

			if (row.next_id < this.nodes.length)
				next = this.nodes[row.next_id];
			
			if (prev === null && next === null) 
				return;	

			if (prev === null) 
				next.prev_id = -1; 
			else if (next === null) 
				prev.next_id = this.nodes.length;
			else {
				prev.next_id = row.next_id;
				next.prev_id = row.prev_id;
			}
		},
		insert_node : function (id_n, id_new ,next , node) {
			if (next.prev_id === -1) {
				node.next_id = id_n;
				node.prev_id = -1;
				next.prev_id = id_new;
			} else {
				var prev = this.nodes[next.prev_id];
				prev.next_id = id_new;
				node.prev_id = next.prev_id;
				node.next_id = id_n;
				next.prev_id = id_new;
			}
		},
		transition : function (e, movement, callback) {
			movement = -movement;
			e.style["webkitTransition"] = "-webkit-transform";
			e.style["webkitTransitionDuration"] = "1.5s";
			e.style["webkitTransitionTimingFunction"] = "easeInSine";
			e.style["webkitTransform"]  = "translateY("+ movement +"px)";
			var flag = true;
			e.addEventListener( 
					'webkitTransitionEnd', 
					function( event ) { 
						console.log("transition ended");
						e.style["webkitTransition"] = "";
						e.style["webkitTransitionTimingFunction"] = "";
						e.style["webkitTransitionDuration"] = "";
						e.style["webkitTransform"]  = "";
						if (!flag) return;
						callback();
					}, false );
		},
		move_up : function (e) {
			if (this.nodes[e].prev_id < 0) 
				return;
			console.log("moving up row " + e);
			if (this.in_transition) 
				return;
			this.in_transition = true;
			var dom_e = table.nodes[e].dom_e;
			var row  = table.nodes[e];
			var prev_dom = table.nodes[row.prev_id].dom_e;
			this.transition(dom_e, dom_e.offsetHeight,
					function () {
						var row  = table.nodes[e];
						var prev = table.nodes[row.prev_id];
						table.delete_node(e);
						table.insert_node(row.prev_id, e, prev, row); 
						table.body.insertBefore(row.dom_e, prev.dom_e);
						table.in_transition = false;
						console.log("mod row " + e + 
									" n:" + row.next_id + " p:" + row.prev_id);
					}
			);
			this.transition(prev_dom, -prev_dom.offsetHeight , function(){});
		},
		add_row : function (e) {
			var id = this.nodes.length;
			var row = {
				data : e,
				dom_e : (function () {
					var dom_row = document.createElement("tr");
					rep (0, e.length, function (id) {
						var td = document.createElement("td");
						var txt = document.createTextNode(e[id]);
						td.appendChild(txt);
						dom_row.appendChild(td);
					});

					dom_row.onclick = function () {
						console.log("clicked on row " + e + 
									" n:" + row.next_id + " p:" + row.prev_id);
						//table.move_up(id);
					};

					return dom_row;
				})(),
				next_id : id + 1,
				prev_id : id - 1
			};

			this.nodes.push(row);
			this.body.appendChild(row.dom_e);

			console.log(e[0]);
			return row;
		}
	};

	var _o = {
		init : function () {
			table.init_table();
			genButton.onclick = function () {
				var rows = parseInt(rowNum.value, 10);
				if (isNaN(rows)) return;
				if (rows <= 0) return;
				table.clear();
				rep (0, rows, function (id) {
					table.add_row(["Name "+(id), "p1", "p2", "p3"]);
				});
			};
		},
		move_up : function (id) {
			table.move_up(id);
		}
	};
	return _o;
})();

document.onreadystatechange = function () {
	board_handler.init();
	submitBtn.onclick = function () {
		board_handler.move_up(parseInt(editRow.value, 10));
	};
};
