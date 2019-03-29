# Minesweeper

Inspired by [The Minesweeper game in 100 lines of JavaScript](http://slicker.me/javascript/mine/minesweeper.htm)

I decided to make my own version. Partly to see how easy it is.
Partly because there were some things lacking in that version that I 
wanted to fix.

My version comes in at 300 lines of JavaScript, but I feel that it's cleaner 
and it does have a couple of features that the original is missing such as: 
* Shift left-click will reveal surrounding blocks.
* Removing the old grid when starting again.
* icon fonts instead of images.
 
Of course it may mean that my version is over engineered, 
but I'll leave that decision as an exercise for the reader.

You can probably see how I've been influenced by react by how I've structured my code.
The main class has various functions for managing state and a separate render function.
I'm also treating each Square (or 'spot') as a separate component with it's own render function.
