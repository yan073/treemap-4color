<div align="center">
    <img src="https://github.com/yan073/treemap-4color/raw/main/logo.png" height="120" />
</div>
<div align="center">
    <h1>treemap-4color</h1>
    <p>Colouring Treemap Cells with 4 or More Colours</p>
</div>

### CDN

```html
<script type="text/javascript" src="https://unpkg.com/treemap-4color@1.0.1/dist/treemap-4color.min.js"></script>
```

### API
The only API exposed by this library is the function 

```Javascript
// getElementBound is the function to get the boundary rectangle of each cell in treemap.
setLeavesColor(getElementBound)
```

This function finds all the element with the attribute ```data-cluster```, compares its cell boundary by calling the given function ```getElementBound```, adds the colouring class ```leafc_1```, ```leafc_2```, ```leafc_3``` or ```leafc_4``` to the element, to ensure the elements with the same ```data-cluster``` given the same colouring class, and the elements adjacent to each other but with the diffrent ```data-cluster``` given different colouring class.  

It is up to the html page to display desired colours for these colouring classes.  

In the two examples in the example folder, the file ```chemical.css``` provides the colour definitions for the colouring classes ```leafc_1```, ```leafc_2```, ```leafc_3``` and ```leafc_4```.

### Examples
The file ```simple.html``` in the example folder is a simple example utilise this library, without depending on any other javascript library.

The file ```d3-treemap-example.html``` in the example folder is an example creating a visualisation with d3 treemap library and colour the cells of that treemap with this library.

Live example: https://yan073.github.io/visualtag/chemical.html

### Basic Ideas
When picking a colour for one cell, if there are other options, save each of the other option into a checkpoint, put those checkpoints into a stack, colouring all the cells in the same cluster with the same colour, calculating the amount of different colours for each adjacent un-coloured cells. <br/>If the amount is three, then there is only one choice left for this cell, so put it into the high priority queue. If the amount is two, put it into the beginning of the low priority queue. If the amount is one, put it into the end of the low priority queue. 
<br/>Pick the next cell for the high priority queue or low priority queue according its priority, repeat the above colouring process.
<br/>If all the four colours have been assigned adjacent to a un-coloured cell, the colouring proces is stuck. Rollback all the colouring up to the previous checkpoint saved in the stack. Start with the option saved in that checkpoint and continue the colouring process.
<br/>To avoid non-stop repetitive colouring, a circuit breaker is created to remember if all the options have been tried out. 

### Global Variables
<ul>
<li>adjacent: dictionary of adjacent cells(a cell index -> array of all cell indexes adjacent to that cell)</li>
<li>todo_cells: array of low priority cell index to colour next</li>
<li>high_priority_todo: array of high priority cell index to colour next</li>
<li>colormap: dictionary of colour index for a cell index.</li>
<li>adjacent_colors: dictionary of adjacent colours (a cell element -> array of colours assigned to the cells adjacent to that element)</li>
<li>color_option: pre-reserved colour option for a given cell in step 5. The initial value is -1.</li>
<li>colored: array of all cell index which have already been coloured</li>
<li>coloring_option_stack: stack of possible colour options reseerved to try laster.</li>
<li>all_tried: a circuit breaker to avoid non-stop repeative searching for a suitable solution. The initial value is false.</li>
</ul>

### Steps of Colouring
The colouring is done in the function ```set_leaf_color()``` in the chemical.js file.

Step 1, collect all the leaf cells with the ```leaf``` class into an array ```leaves```.

Step 2, find all the adjacent cells for every leaf cell, and put it into the dictionary ```adjacent```. The adjacenting test is done by comparing the bounding client rectangle of the element ```<g><rect>```.

Step 3, pick the first cell index (it is 0 here) from the leaves array ```leaves```, go to step 4, start colouring it.

Step 4, If the given cell index is not in the array ```colored```, go to step 5 to find a suitable colour for it. Otherwise, go to step 9 to get the next cell to colour.

Step 5, If the value of ```color_option``` is greater than zero, then the colour for this cell is reserved, use this value as the selected colour for this cell, set the values of ```color_option``` as -1 to remove the reserved colour option, go to step 8. Otherwise, go to step 6 to get a suitable colour for this cell.

Step 6, Get the attribute 'data-cluster' from the cell to colour. If the cluster is 'unknown', assign the colour '5' to this cell. go to step 8. Otherwise go to step 7.

Step 7, Search the dictionary adjacent_colors for all the possible colour options (from 1 to 4) for a given cell element. If the result is not empty, assign the first colour to this cell, and keep all the other options to the ```coloring_option_stack```, go to step 8. Otherwise, the current colouring solution is stuck. It is not possible to go ahead without going back and try a different colour option. Pick a different colouring option reserved in the ```coloring_option_stack```, rollback the values of all the global variables (other than ```coloring_option_stack```) to the status kept in that colouring option, set the value of color_option as the picked colouring option, go to step 8.

Step 8, A colour has been assigned to a cell, find every cell with the same ```data-cluster```, add the cell index to the array  ```colored```, put the colour index against the cell index into the dictionary ```colormap```, record the new colour for all the cells adjacent to this cell into the dictionary ```adjacent_colors```. 
Revisit all the cells adjacent to the new cluster, if this cell has not been coloured, check the amount of its different adjacent colours in the dictionary ```adjacent_colors```. If the amount of different adjacent colour is three or greater than three, then this cell should be colour immediately. So put it into the end of high priority queue ```high_priority_todo```. If the amount is two, put it into the start of the low priority queue ```todo_cells```. If the amount is one, put it into the end of the low priority queue ```todo_cells```.

Step 9, Pick the next cell index to colour from the start of the high priority queue ```high_priority_todo```, go to step 5. If it is empty, pick the next cell index from the start of low priority queue ```todo_cells```, go to step 5.
If both of these two queues are empty, then all the cells have been coloured. Go to step 10.

Step 10, According the dictionary ```colormap```, insert colouring class( One of 'leafc1_1', 'leafc1_2', 'leafc1_3', 'leafc1_4', 'leafc1_5') into each leaf element. The colouring process finishes.