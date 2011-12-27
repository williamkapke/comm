# comm

To create a website that uses AJAX to transition between pages we need to decouple the content of the page from the framework that supports it.

If pages create direct references to components of the shell, those references would remain in memory after the page is cleared and the new page is transitioned in- **comm** has been created to address this.

When a page needs to communicate with the shell, it can listen and send messages to it.

**The comm framework DOES NOT define commands- individual developers do!**

Commands are defined by developers creating controls. **comm** does not care about the name of the command or any related data. It just relays it. Developers wanting to listen to commands from a control will need to consult/coordinate with the control developer.

---


###comm.debug
Setting this property to `true` sends debug information to the browser’s console.

####Optional
>By default, debug messages are sent to console.log. Set this property to a `function` to override the default debugging behavior.

_
_
###comm.listen(command, callback(data, command), persist)
Allows scripts to respond to commands.

####Parameters
>`command` : String
>The prefix and name of the command to listen to. Optionally, this can be a comma separated list of commands to map to the callback.
>
>`callback` : Function
>A callback to execute when the command is triggered.
>
>`persist` : Boolean
> If non-falsey, causes a listener to persist when `comm._clearListeners()` is called. Defaults to false. Intended for controls that live in the "shell" of the page.

####Return value:
>none

####Optional
>The callback can optionally return true to stop listening to any future events.

####Example
```javascript
comm.listen("audio.stopped,audio.paused", function (data) {
    showPlayButton();
});

function onStarted(data, cmd) {
    showStopButton();
}
comm.listen("audio.started", onStarted);
```
_
_

###comm.stopListening(command, callback)
Removes the callback from the pool of listeners for the specified command.

####Parameters:
>`command` : String
>The prefix and name of the command to trigger.
>
>`callback` : Function
>The callback to remove.

####Return value
>none

####Example
```javascript
comm.stopListening("audio.started", onStarted)
```
_
_

###comm.send(command[, data])
Calls all listeners for the specified command passing any data specified.

####Parameters
>`command` : String
>The prefix and name of the command to trigger.
>
>`data` : Object
>An object to send to the listeners.

####Return value
>none

####Example
```javascript
comm.send("audio.stopped", { name: "Macarena" })
```
_
_

###comm.own(name, switchboard)
Claims ownership of a comm prefix restricting the ability to send commands with it. Only scripts with access to the controller that is returned will be able to send commands.

The switchboard allows scripts to communicate with the prefix owner. When a script sends a command with an “owned” prefix, **comm** will relay the message to the switchboard- which is controlled by the owner. The owner is responsible for doing (or NOT doing) whatever is needed for the command.

If the switchboard does not have a callback mapped for the command, the command is ignored.

This was primarily intended for controls in “the shell.”

####Parameters
>`name` : String
>The command prefix to own. 
>
>`switchboard` : Object
>A map of commands to callbacks.

####Return value
>A controller object is returned for broadcasting commands and abandoning control if desired.

>`broadcast(command, name)`
>Identical to comm.send() except that the prefix is omitted. 

>`abandon()`
>Releases restricted access to the controlled command prefix. Any calls to broadcast() after abandon() had been called will throw an error.

####Example
```javascript
var controller = comm.own("audio", {
  stopped: function(data){
    //code
  },
  started: function(data){
    //code
  }
});
controller.broadcast("paused", { name: "Macarena" });
controller.abandon();
```
_
_

###comm._clearListeners()
Disconnects all "non-persistent" listeners. This is intended to be used only by an orchestrating framework.

####Parameters:
>none

####Return value
>none
_
_
License
=======

comm is released under a **MIT License**:

    Copyright (C) 2011 by William Wicks
    
    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.
    
    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.