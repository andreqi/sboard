var board_handler = (function () {

	var rep = function (i, n, f) {
		for (var x = i; x < n; x++) {
			f(x);
		}
	};

	var table = {
		body : null, 
		nodes : null,
		lock : null, 
		in_transition : false,
		init_table : function () {
			this.body = scoreboard_table.childNodes[3];
			this.nodes = [];
			this.lock = [];
			in_transition = false;
		}, 
		clear : function () {
			this.nodes.length = 0;
			this.lock.length = 0;
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
		insert_node : function (id_n, id_new, next, node) {
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
			var auto_delete = (function () {
				var handler = function (event) {
					e.removeEventListener('webkitTransitionEnd', handler);
					//console.log("transition ended " + e.textContent);
					e.style["webkitTransition"] = "";
					e.style["webkitTransitionTimingFunction"] = "";
					e.style["webkitTransitionDuration"] = "";
					e.style["webkitTransform"]  = "";
					callback();
				};
				return handler;
			})();
			e.addEventListener('webkitTransitionEnd', auto_delete);
		},
		move_up : function (e, less_than, next_it) {
			if (this.nodes[e].prev_id < 0) { 
				next_it();
				return;
			}
			//console.log("moving up row " + e);
			if (this.lock[e] > 0) return;
			var row  = table.nodes[e];
			var dom_e = row.dom_e;
			var prev = table.nodes[row.prev_id];
			if (!less_than(row, prev)) {
				next_it();
				return;
			}
			var prev_dom = prev.dom_e;
			var ids = [e, row.prev_id];
			if (prev.prev_id >= 0) 
				ids.push(prev.prev_id);
			if (row.next_id < this.nodes.length) 
				ids.push(row.next_id);
			rep (0, ids.length, 
					function (id) { table.lock[ids[id]]++; }
				);

			this.transition(prev_dom, -(prev_dom.offsetHeight + 2), function(){});

			this.transition(dom_e, dom_e.offsetHeight + 2,
					function () {
						table.delete_node(e);
						table.insert_node(row.prev_id, e, prev, row); 
						table.body.insertBefore(row.dom_e, prev.dom_e);
						table.in_transition = false;
					//	console.log("mod row " + e + 
					//				" n:" + row.next_id + " p:" + row.prev_id);

						rep (0, ids.length, 
							function (id) { table.lock[ids[id]]--; }
						);
						if (row.prev_id < 0 || less_than(row, table.nodes[row.prev_id]))
							table.move_up(e, less_than, next_it);
						else {
							next_it();
						}
					}
			);
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

					dom_row.classList.add('inactive');
					dom_row.onclick = function () {
						//console.log("clicked on row " + e + 
						//			" n:" + row.next_id + " p:" + row.prev_id);
						table.move_up(id, function (a, b) {
							return a.data[0] < b.data[0];
						});
					};

					return dom_row;
				})(),
				next_id : id + 1,
				prev_id : id - 1
			};

			this.nodes.push(row);
			this.body.appendChild(row.dom_e);
			this.lock.push(0);

			//console.log(e[0]);
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
					var xd = (1 + Math.floor(Math.random() * rows));
					table.add_row([xd, "Name "+id, "-", "-", "-"]);
				});
				_o.play(rows - 1);
			};
		},
		move_up : function (id) {
			table.move_up(id);
		},
		play : function (n) {
			if (n < 0) return;
			var last = n;
			var id = table.nodes[last].prev_id;
			var dom = table.nodes[last].dom_e;
			dom.classList.remove('inactive');
			dom.classList.add('active');
			table.move_up(
					last, 
					function (a, b) {
						return a.data[0] < b.data[0];
					}, 
					function () {
						dom.classList.remove('active');
						dom.classList.add('inactive');
						setTimeout(_o.play(id), 1000);
					});

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
