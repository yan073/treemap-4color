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
