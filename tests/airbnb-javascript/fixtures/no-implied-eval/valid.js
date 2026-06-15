// Passing a function — not a string — to the timer is fine.
setTimeout(() => {}, 100);
setInterval(fn, 50);
setTimeout(function () {}, 100);
