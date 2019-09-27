JavaScript...in VR!
=================

This project explores programming in virtual reality. Programs are represented as abstract syntax trees and you can try it at  [https://jsvr.glitch.me](https://jsvr.glitch.me) although it's currently limited to Oculus touch controls and still quite buggy/very much work in progress.


Objects and Controls
------------

### Nodes
Nodes in the abstract syntax tree are represented as wireframe cubes. They can be moved around (which moves the whole tree) by using the grip controls.

### Ports
Ports are points on a node which can be used to connect nodes together. They are represented by spheres and are green if they're open and red if occupied (i.e. the node is connected to some other node at that point). Using the right hand trigger on an occupied port disconnects the node at that point. Using the right hand trigger on an open port allows you to connect the node by dragging the line that gets created to another node.

You can create new nodes by activating the pointer (the 'a' button) and pointing to an open node. This brings up a menu of possible nodes to create. Use the right hand trigger on a menu item to create that node.

### Array Ports
Array ports are points on a node that may have multiple connections and are represented by blue cylinders. The array ports have a yellow cone that can be used to add new open ports to the array by using the right hand trigger on the cone.

### Editable Fields 
Certain fields in some nodes can be edited. This is indicated by a yellow ring and orange text. Use the right hand trigger on the yellow ring to bring up keyboard. Activate the pointer (the 'a' button) to use the keyboard and use the "return" key to update the node value and close the keyboard.

### Interpreter
You can step through the program by activating the interpreter menu (the 'x' button). This brings up a menu attached to the left hand with a single step button that can be pressed with the right hand trigger button.

Thanks
-------

Made with...

[Glitch](https://glitch.com)
[A-Frame](https://aframe.io)
[JS-Interpreter](https://github.com/NeilFraser/JS-Interpreter)
[Supermedium A-Frame Keyboard](https://github.com/supermedium/aframe-super-keyboard/tree/master/dist)
[Supermedium A-Frame Log](https://github.com/supermedium/superframe/tree/master/components/log)
[A-Frame GUI](https://github.com/rdub80/aframe-gui)
[Cherow Parser](https://github.com/cherow/cherow)
-------------------

\ ゜o゜)ノ
