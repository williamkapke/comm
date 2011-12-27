comm = (function (console) {
	var noop = function () { },
		log = (console && console.log ? function (m) {
				if (comm.debug){
					if(isFunction(comm.debug))
						comm.debug(m);
					else console.log(m);
				}
			} : noop),
		owners = {},
		commands = {},
		persistent = {},
		isFunction = function (o) { return Object.prototype.toString.call(o) === "[object Function]"; },
		indexOf = function (item, array) {
			if (array.indexOf) return array.indexOf(item);
			for (var i = 0, l = array.length; i < l; i++)
				if (array[i] === item) return i;
			return -1;
		},
		comm = {
			onerror: noop,
			own: function (name, switchboard) {
				if (owners[name])
					throw new Error(name + " already registered");
				if (!switchboard)
					throw new Error("invalid switchboard");

				owners[name] = switchboard;
				var broadcast = function (cmd, data) {
					callem(cmd, commands[cmd], data);
				};
				return {
					broadcast: function (cmd, data) {
						if (!broadcast) throw new Error("This controller has been abandoned");
						cmd = name + '.' + cmd;
						log("broadcasting: " + cmd);
						broadcast(cmd, data);
					},
					abandon: function () {
						if (!broadcast) throw new Error("This controller has already been abandoned");
						log("abandoned control of: " + name);
						delete owners[name];
						broadcast = null
					}
				};
			},
			listen: function (cmd, callback, persist) {
				if(typeof cmd == "object"){
					for(var prefix in cmd){
						var handlers = cmd[prefix];
						if(typeof handlers != "object")
							continue;

						for(var command in handlers){
							var persist = command.charAt(0)=="+";
							var handler = handlers[command];
							listen(prefix+'.'+(persist?command.substr(1):command), handler, persist);
						}
					}
				}
				else listen(cmd, callback, persist);
			},
			stopListening: function (cmd, callback) {
				var audience = commands[cmd];
				if (!audience) return;
				var i = indexOf(callback, audience);
				if (i == -1) return;
				audience.splice(i, 1);

				audience = persistent[cmd];
				if (audience) {
					i = indexOf(callback, audience);
					if (i > -1)
						audience.splice(i, 1);
				}

				log("listener removed for: " + cmd);
			},
			send: function (cmd, data) {
				log("sending: " + cmd);
				var parts = cmd.match(/([^.]+)(?:\.(.+))?/).slice(1)
				if (parts.length != 2)
					throw new Error("invalid command");
				var owner = owners[parts[0]];
				if (owner) {
					cmd = parts[1];
					if(owner[cmd]) owner[cmd](data);
					else if(owner["*"]) owner["*"](cmd, data);
				}
				else callem(cmd, commands[cmd], data);
			},
			_clearListeners: function () {
				commands = {};
				for (var i in persistent)
					commands[i] = persistent[i].slice(0);
			}
		};
	function listen(cmd, callback, persist){
		if (!isFunction(callback)) return;
		var cmds = cmd.split(',');
		for (var i = 0; i < cmds.length; i++) {
			cmd = cmds[i];
			log("listener added for: " + cmd);
			(commands[cmd] || (commands[cmd] = [])).push(callback);
			if (persist)
				(persistent[cmd] || (persistent[cmd] = [])).push(callback);
		}
	}
	function callem(cmd, handlers, data) {
		if (!handlers) return;
		for (var i = 0; i < handlers.length; i++) {
			try {
				if (handlers[i](data, cmd) === true)
					comm.stopListening(cmd, handlers[i--]);
			}
			catch (ex) {
				comm.onerror("comm handler error", ex);
			}
		}
	}
	return comm;
})(window.console);