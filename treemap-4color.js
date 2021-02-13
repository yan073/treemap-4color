function setLeavesColor(getElementBound, clusterAttribute ='data-cluster', numColorSpace = 4, adjacentMargin = 5) {
    let leaves = document.querySelectorAll('[' + clusterAttribute +']');

    let adjacent = function () { 
        var isAdjacent = function (rect1, rect2) {
            var is_same = (x1, x2) => Math.abs(x1 - x2) < adjacentMargin;
            if (is_same(rect1.top, rect2.bottom) || is_same(rect1.bottom, rect2.top)){
                return rect1.left > rect2.right || rect1.right < rect2.left ? false : true;
            }
            if (is_same(rect1.left, rect2.right) || is_same(rect1.right, rect2.left)){
                return rect1.top > rect2.bottom || rect1.bottom < rect2.top ? false : true;
            }    
            return false;
        };
    
        var _adjacent = {};
        for(i = 0; i< leaves.length; i++) {
            _adjacent[i] = [];
        }    
        for(var i = 0; i< leaves.length - 1; i++) {
            let rect1 = getElementBound(leaves[i]);
            for(var j=i+1; j < leaves.length; j++ ) {
                let rect2 = getElementBound(leaves[j]);
                if (isAdjacent(rect1, rect2)){
                    _adjacent[i].push(j);
                    _adjacent[j].push(i);
                }
            }
        }
        return _adjacent;
    }();

    var highPriorityTodo = [];
    var lowPriorityTodo = [];
    var adjacentColors = {};
    var coloringOptionStack = [];
    var assignedColor = -1;

    var workspace = {
        colormap: {},
        allTried: false,
        isTodoQueueNotEmpty : function () {
            return highPriorityTodo.length > 0 || lowPriorityTodo.length > 0;
        },
        getNextCellIndexToColor : function () {
            return highPriorityTodo.length >0 ? highPriorityTodo.shift() : lowPriorityTodo.shift();
        },
        queueCellIndex : function(cell) {
            if (!(cell in this.colormap)){
                var cluster = this.getClusterName(cell);
                switch(adjacentColors[cluster].length) {
                    case 0:
                    case 1:
                        if (lowPriorityTodo.indexOf(cell) <0) {
                            lowPriorityTodo.push(cell);
                        }
                        break;
                    case 2:
                        if(highPriorityTodo.indexOf(cell) <0) {
                            highPriorityTodo.push(cell);
                        }
                        break;
                    default: // highest priority, put it into the head of high priority queue.
                        highPriorityTodo.unshift(cell);
                        break;
                }            
            }
        },
        recordClusterAdjacentToColor: function(cell, color) {
            if (!(cell in adjacentColors)) {
                adjacentColors[cell] = [];
            }
            if (adjacentColors[cell].indexOf(color) <0) {
                adjacentColors[cell].push(color);
            }
        },
        createColorClass: function(){
            for(var i=0; i<leaves.length; i++){
                leaves[i].classList.add( 'leafc_' + this.colormap[i] );        
            }
        },
        stackColoringOption : function(current, color_option) {
            var context = {
                current: current,
                coloring_option: color_option,
                colormap: {},
                adjacentColors: {}
            }
            context['lowPriorityTodo'] = [...lowPriorityTodo];
            context['highPriorityTodo'] = [...highPriorityTodo];
            for(var key in this.colormap) {
                context['colormap'][key] = this.colormap[key];
            }
            for(var key in adjacentColors) {
                context['adjacentColors'][key] = [...adjacentColors[key]];
            }
            coloringOptionStack.push(context);
        },
        rollback_to_diffrent_coloring_option: function (){
            if (coloringOptionStack.length <= 1) {
                this.allTried = true;                        
            }
            var context = coloringOptionStack.pop();
            assignedColor = context['coloring_option'];
            lowPriorityTodo = context['lowPriorityTodo'];
            highPriorityTodo = context['highPriorityTodo'];
            this.colormap = context['colormap'];
            adjacentColors = context['adjacentColors'];
        },
        /*
            Get all the colours different from existing adjacent colours.
            It could be empty. 
        */
        getDiffColor: function (cluster) {
            let adjcolors = adjacentColors[cluster];
            if (adjcolors === undefined) {
                return Array.from({length: numColorSpace}, (_, i) => i + 1);
            } else {
                diff = []
                for(var i=1; i<=numColorSpace; i++) {
                    if (adjcolors.indexOf(i) <0) {
                        diff.push(i);
                    }
                }
                return diff;
            }
        }, 
        getAdjacents: function (cell) {
            return adjacent[cell];
        },
        getClusterName: function(cell) {
            var element = leaves[cell];
            var cluster = element.getAttribute(clusterAttribute);
            if (cluster == null) { // if there is no cluster, pick an unique id
                cluster = element.getAttribute('transform');
            }
            return cluster;
        },
        getCellsInSameCluster: function(cluster){
            let samel = [];
            if (cluster != null && cluster.length >0) {
                for(var i = 0; i< leaves.length; i++) {
                    if (cluster == this.getClusterName(i)) {
                        samel.push(i);
                    }
                }
            }
            return samel;
        },
        getColorIndexForUnknownCluster: function(){
            return numColorSpace + 1;
        },
        isOtherOptionAvailable: function(){
            return coloringOptionStack.length > 0;
        },
        popAssignedColor: function(){
            let tmp = assignedColor;
            if (assignedColor >=0) {
                assignedColor = -1;
            }
            return tmp;
        }

    };

    setColorToCell(0, workspace);
    while( workspace.isTodoQueueNotEmpty() ) {
        let next = workspace.getNextCellIndexToColor(); 
        setColorToCell(next, workspace)
    }
    workspace.createColorClass();
}

function setColorToCell(current, workspace){
    if (!(current in workspace.colormap)){
        var cluster = workspace.getClusterName(current);
        var new_c = workspace.popAssignedColor();
        if (new_c <0) {
            if (cluster == 'unknown') {
                new_c = workspace.getColorIndexForUnknownCluster();
            }
            else {
                let diffcs = workspace.getDiffColor(cluster);
                if (diffcs.length > 0) {
                    new_c = diffcs[0];
                    if ( !workspace.allTried ) {
                        for(var i = 0; i<diffcs.length ; i++) {
                            workspace.stackColoringOption(current, diffcs[i]);
                        }
                    }
                }
                else {
                    if (workspace.isOtherOptionAvailable()) {
                        workspace.rollback_to_diffrent_coloring_option();
                        return;
                    }
                    else {
                        console.log('Nothing in the option stack.');
                        new_c = 1;
                    }
                }
            }
        }
        workspace.colormap [current] = new_c;
        let siblings = workspace.getCellsInSameCluster(cluster);
        for(var i=0;i<siblings.length;i++){
            let next = siblings[i];
            if (next != current) {
                workspace.colormap[next] = new_c;
            }
        }
        for(var i=0;i<siblings.length;i++){
            processNeighborAfterColoring(siblings[i], new_c, cluster, workspace);
        }
    }
}

function processNeighborAfterColoring(current, color, cluster, workspace){
    let adjs = workspace.getAdjacents(current);
    for(var i=0;i<adjs.length;i++) {
        var nextCluster = workspace.getClusterName(adjs[i]);
        if (nextCluster != cluster) {
            workspace.recordClusterAdjacentToColor(nextCluster, color);
        }
    }

    for(var i=0;i<adjs.length;i++) {
        workspace.queueCellIndex(adjs[i]);
    }

}

