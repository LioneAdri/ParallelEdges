Parallel = {
    defaults: {
        edgeSpacingX: 10,
        edgeSpacingY: 8
    },
    /**
     * set up and draw graph
     * @param divId
     */
    initGraph: function (divId) {
        this.container = document.getElementById(divId);
        this.model = new mxGraphModel();
        this.graph = new mxGraph(this.container, this.model);
        new mxRubberband(this.graph);

        this.graph.setEnabled(false);
        this.graph.setAllowDanglingEdges(false);
        this.graph.setAllowLoops(false);
        this.graph.setSplitEnabled(false);

        this.container.style.position = 'absolute';
        this.container.style.left = '0px';
        this.container.style.top = '0px';
        this.container.style.right = '0px';
        this.container.style.bottom = '0px';

        this.parent = this.graph.getDefaultParent();

        this.model.beginUpdate();

        try {
            this.addItems();
        }
        finally {
            this.model.endUpdate();
            this.doParallel();
            // you should call doParallel whenever you want to reposition the edges (on move etc.)
        }
    },
    /**
     * add items to the graph
     */
    addItems: function () {
        var style = 'strokeColor=#000000;fillColor=#ffffff;strokeWidth=2;';
        var item1 = this.graph.insertVertex(this.parent, "node_1", "Node 1",
            60, 70, 80, 50, style);

        var item2 = this.graph.insertVertex(this.parent, "node_2", "Node 2",
            240, 100, 80, 50, style);

        var item3 = this.graph.insertVertex(this.parent, "node_3", "Node 3",
            70, 170, 80, 50, style);

        var edgeStyle = 'strokeColor=#008bff;strokeWidth=2;';
        var arrow1 = this.graph.insertEdge(this.parent,
            "conn_1", '',
            this.model.getCell('node_2'),
            this.model.getCell('node_1'),
            edgeStyle);
        edgeStyle = 'strokeColor=#d800b7;strokeWidth=2;';
        var arrow2 = this.graph.insertEdge(this.parent,
            "conn_2", '',
            this.model.getCell('node_2'),
            this.model.getCell('node_1'),
            edgeStyle);
        edgeStyle = 'strokeColor=#00e575;strokeWidth=2;';
        var arrow3 = this.graph.insertEdge(this.parent,
            "conn_3", '',
            this.model.getCell('node_1'),
            this.model.getCell('node_3'),
            edgeStyle);
        edgeStyle = 'strokeColor=#008bff;strokeWidth=2;';
        var arrow4 = this.graph.insertEdge(this.parent,
            "conn_4", '',
            this.model.getCell('node_3'),
            this.model.getCell('node_1'),
            edgeStyle);

        edgeStyle = 'strokeColor=#008bff;strokeWidth=2;';
        var arrow5 = this.graph.insertEdge(this.parent,
            "conn_5", '',
            this.model.getCell('node_2'),
            this.model.getCell('node_3'),
            edgeStyle);
        edgeStyle = 'strokeColor=#00e575;strokeWidth=2;';
        var arrow6 = this.graph.insertEdge(this.parent,
            "conn_6", '',
            this.model.getCell('node_2'),
            this.model.getCell('node_3'),
            edgeStyle);
        edgeStyle = 'strokeColor=#d800b7;strokeWidth=2;';
        var arrow7 = this.graph.insertEdge(this.parent,
            "conn_7", '',
            this.model.getCell('node_3'),
            this.model.getCell('node_2'),
            edgeStyle);
        edgeStyle = 'strokeColor=#ff885c;strokeWidth=2;';
        var arrow8 = this.graph.insertEdge(this.parent,
            "conn_8", '',
            this.model.getCell('node_2'),
            this.model.getCell('node_3'),
            edgeStyle);
    },
    /**
     * if you want to rebuild the parallel edges after move, you should call this fn
     */
    doParallel: function () {
        var more = this.listParallel();
        for (var i = 0; i < more.length; i++) {
            this.solveParallel(more[i])
        }
    },
    /**
     * list all the parallel edges
     * @returns {[]}
     */
    listParallel: function () {
        var p = this.findParallels();

        var more = [];
        for (var key in p) {
            if (p[key].length > 1) {
                more.push(p[key]);
            }
        }

        return more;
    },
    /**
     * find all the parallel edges
     * @returns {{}}
     */
    findParallels: function () {

        var lookup = {};
        var childCount = this.model.getChildCount(this.parent);

        for (var i = 0; i < childCount; i++) {
            var child = this.model.getChildAt(this.parent, i);
            var id = this.getEdgeId(child);
            if (id != null) {
                if (lookup[id] == null) {
                    lookup[id] = [];
                }
                lookup[id].push(child);
            }
        }

        return lookup;
    },
    /**
     * getting info about edge
     * @param edge
     * @returns {string|null}
     */
    getEdgeId: function (edge) {
        var view = this.graph.getView();
        var src = view.getVisibleTerminal(edge, true);
        var trg = view.getVisibleTerminal(edge, false);

        if (src != null && trg != null)
        {
            src = mxObjectIdentity.get(src);
            trg = mxObjectIdentity.get(trg);

            return (src > trg) ? trg + '-' + src : src + '-' + trg;
        }

        return null;
    },
    /**
     * set position of parallel edges
     * @param parallels
     */
    solveParallel: function (parallels) {
        var view = this.graph.getView();
        var spx = 1 / this.defaults.edgeSpacingX;
        var spy = 1 / this.defaults.edgeSpacingY;

        var x0 = 0.5;
        var y0 = 0.5;

        for (var i = 0; i < parallels.length; i++) {
            var source = view.getVisibleTerminal(parallels[i], true);
            var target = view.getVisibleTerminal(parallels[i], false);

            var src = this.model.getGeometry(source);
            var trg = this.model.getGeometry(target);

            var srcx = src.x, srcy = src.y, trgx = trg.x, trgy = trg.y;

            if (parallels[i].getParent() != source.getParent()) {
                var pGeo = this.model.getGeometry(source.getParent());
                srcx = src.x + pGeo.x;
                srcy = src.y + pGeo.y;
            }

            if (parallels[i].getParent() != target.getParent()) {
                var pGeo = this.model.getGeometry(target.getParent());
                trgx = trg.x + pGeo.x;
                trgy = trg.y + pGeo.y;
            }

            var scx = srcx + src.width; // source element right
            var scy = srcy + src.height; // source element bottom

            var tcx = trgx + trg.width; // target element right
            var tcy = trgy + trg.height; // target element bottom

            var dx = tcx - scx; // length x
            var dy = tcy - scy; // length y

            var sourcePointX, sourcePointY, targetPointX, targetPointY;
            if (Math.abs(dx) > Math.abs(dy)) { // horizontal
                sourcePointY = y0;
                targetPointY = y0;
                if (srcx < trgx) { // left-right
                    sourcePointX = 1;
                    targetPointX = 0;
                } else { // right-left
                    sourcePointX = 0;
                    targetPointX = 1;
                }
            } else { // vertical
                sourcePointX = x0;
                targetPointX = x0;
                if (srcy < trgy) { // top-bottom
                    sourcePointY = 1;
                    targetPointY = 0;
                } else { // bottom-top
                    sourcePointY = 0;
                    targetPointY = 1;
                }
            }

            this.graph.setConnectionConstraint(parallels[i], parallels[i].source, true, new mxConnectionConstraint(new mxPoint(sourcePointX, sourcePointY), true));
            this.graph.setConnectionConstraint(parallels[i], parallels[i].target, false, new mxConnectionConstraint(new mxPoint(targetPointX, targetPointY), true));

            if (i % 2) { // next by defaults
                x0 += spx * (i + 1);
                y0 += spy * (i + 1);
            } else {
                x0 -= spx * (i + 1);
                y0 -= spy * (i + 1);
            }
        }
    }
};

(function() {
    Parallel.initGraph("example");
})();
