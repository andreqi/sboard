// linked list, usefull to do a clean swap in the table but could be replaced for an array
var linked_list = function () {

	var node_methods = {
		_b : null, _e : null, 
		has_prev : function () {
			return (this.prev !== null && 
					this.prev !== this._b);
		},
		has_next : function () {
			return (this.next !== null && 
					this.next !== this._e);
		}, 
		it_next : function (dir) {
			if (dir < 0) return this.prev;
			return this.next;
		}
	};

	var list = {
		_begin : null, 
		_end : null,
		length : null,
		init : function () {
			this._begin = this.new_node();
			this._end = this.new_node();
			this._begin.next = this._end;
			this._end.prev = this._begin;
			node_methods._b = this._begin;
			node_methods._e = this._end;
			this.length = 0;
		}, 
		new_node : function () {
			var node = Object.create(node_methods);
			node.prev = null;
			node.next = null;
			return node;
		}, 
		// the 'next' node is the one that is in the list, and 'cur' is the new node
		link : function (cur, next) {
			cur.next = next;
			cur.prev = next.prev;
			next.prev = cur;
			cur.prev.next = cur;
		}, 
		unlink : function (node) {
			var p = node.prev;
			var n = node.next;
			if (p === null || n === null)
				console.log("invalid operation");
			p.next = n;
			n.prev = p;
		}, 
		push_back : function (node) {
			this.link(node, this._end);
			this.length++;
			return node;
		}, 
		begin : function () {
			return this._begin.next;
		}, 
		end : function () {
			return this._end;
		}, 
		rbegin : function () {
			return this._end.prev;
		}, 
		rend : function () {
			return this._begin;
		}
	};
	list.init();
	return list;
};

var board_handler = (function () {
  // i miss my c++ iteration macross ):
	var rep = function (i, n, f) {
		for (var x = i; x < n; x++) {
			f(x);
		}
	};

	var table = {
		body : null, 
		lock : null, 
		node_list : null, 
    less_than : null, 
		in_transition : false,
    // starts the mess
		init_table : function (less_op) {
      this.less_than = less_op || function () { return false; };
			this.body = scoreboard_table.childNodes[3];
			this.lock = [];
			this.node_list = linked_list();
			in_transition = false;
		}, 
    // cleans the mess
		clear : function () {
			this.lock.length = 0;
			this.node_list.init();
			while (this.body.lastChild)
				this.body.removeChild(this.body.lastChild);
			in_transition = false;
		},
    // transition to swap the rows, only supports webkit. moz and others should be added
		transition : function (e, movement, callback) {
			movement = -movement;
			e.style["webkitTransition"] = "-webkit-transform";
			e.style["webkitTransitionDuration"] = "1.5s";
			e.style["webkitTransitionTimingFunction"] = "easeInSine";
			e.style["webkitTransform"]  = "translateY("+ movement +"px)";
			var auto_delete = (function () {
				var handler = function (event) {
					e.removeEventListener('webkitTransitionEnd', handler);
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
    // moves up a row, the less_than function defines if it keeps going up or stops
    // next_it is a function called when the row can't go any higher
		move_up : function (e, next_it) {
			next_it = next_it || (function () {});
			if (!e.has_prev()) {
				next_it();
				return;
			}
			if (table.lock[e.id] > 0) return;

			var dom_e = e.dom_e;
			var prev = e.prev;
			if (!table.less_than(e, prev)) {
				next_it();
				return;
			}

			var prev_dom = prev.dom_e;
			var ids = [e.id, e.prev.id];
			if (prev.has_prev()) ids.push(e.prev.prev.id);
			if (e.has_next())	 ids.push(e.next.id); 
			rep (0, ids.length, function (id) { table.lock[ids[id]]++; });

			this.transition(prev_dom, -(prev_dom.offsetHeight + 2), function(){});
    
			this.transition(dom_e, dom_e.offsetHeight + 2,
					function () {
						table.node_list.unlink(e);
						table.node_list.link(e, prev);
						table.body.insertBefore(e.dom_e, prev.dom_e);
						table.in_transition = false;
            var order = e.order;
            e.order = prev.order;
            prev.order = order;
            e.dom_e.childNodes[0].textContent = e.order+1;
            prev.dom_e.childNodes[0].textContent = prev.order+1;
						rep (0, ids.length, 
							function (id) { table.lock[ids[id]]--; }
						);
						if (!e.has_prev() || table.less_than(e, e.prev))
							table.move_up(e, next_it);
						else next_it();
					}
			);
		},
    // adds a dummy row, also needs to be replaced for a call to a parser
		add_row : function (e) {
			var _id = this.node_list.length;
			var node = this.node_list.new_node();
			var row = Object.create(node);
      row.order = _id;
			row.id = _id;
			row.data = e;
			row.dom_e = (function () {
					var dom_row = document.createElement("tr");
					rep (0, e.length, function (id) {
						var td = document.createElement("td");
						var txt = document.createTextNode(e[id]);
						td.appendChild(txt);
						dom_row.appendChild(td);
					});

					dom_row.classList.add('inactive');
					dom_row.onclick = function () {
						table.move_up(row);
					};

					return dom_row;
			})();
      // reveals the judgement of a submition, it would be replaced for the actual query to a parser or something
      row.reveal = function () {
        var data = row.data;
        for (var idx = 1; idx < data.length; idx++) {
          if (data[idx] === '-') {
            data[idx] = Math.floor(Math.random()*2);
            row.dom_e.childNodes[idx].textContent = data[idx];
            data[2] += data[idx];
            row.dom_e.childNodes[2].textContent = data[2];
            if (data[idx] > 0) {
              data[3] += Math.floor(Math.random()*10) + 10;
              row.dom_e.childNodes[3] = data[3];
              row.dom_e.childNodes[3].textContent = data[3];
              return true;
            }
          } 
        }
        return false;
      }

      this.node_list.push_back(row);
      this.body.appendChild(row.dom_e);
      this.lock.push(0);
			return row;
		}
	};

  // mock less operator used everywhere
  var less = function (a, b) {
      if (a.data[2] !== b.data[2])
       return a.data[2] > b.data[2];
      return a.data[3] < b.data[3];
  };

  // setup and auto sorting animations
	var _o = {
		init : function () {
			table.init_table(less);
			genButton.onclick = function () {
				var rows = parseInt(rowNum.value, 10);
				if (isNaN(rows)) return;
				if (rows <= 0) return;
				table.clear();
				rep (0, rows, function (id) {
					var xd = rows - id;
					table.add_row([id + 1, "Name "+id, xd, xd * 10, "-", "-", "-"]);
				});
				_o.play(table.node_list.rbegin());
			};
		},
		move_up : function (id) {
			table.move_up(id);
		},
		play : function (node) {
 			var dom = node.dom_e;
			dom.classList.remove('inactive');
			dom.classList.add('active');
			var next = node.prev;
			var pode = node.has_prev();
      while (node.reveal() && pode && !less(node, next)) {}
      if (!pode) while (node.reveal());
      setTimeout(function () {
        table.move_up(node, 
            function () {
              dom.classList.remove('active');
              dom.classList.add('inactive');
              if (pode) setTimeout(_o.play(next), 1000);
            });
      }, 1000);
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
