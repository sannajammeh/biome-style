// Passing a string literal to a timer is implied eval.
setTimeout("doStuff()", 100);
setInterval('tick()', 50);
