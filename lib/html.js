'use strict';

var _ = require('underscore')._;
var fs = require('fs');

function generateGraphData(dependencies, baseDir) {

    // Read data
    var components = _.uniq(_.flatten(_.map(dependencies, function(values, item) {
        var data = [];
        data.push(item);
        data = data.concat(values);

        return data;
    })));

    // Mapped nodes
    var nodes = _.map(components, function(component) {
        return {
            id: component,
            radius: getCircleRadius(component),
        }
    });

    // Figure out links
    var links = [];

    _.each(dependencies, function(outerDependency, component, index) {

        _.each(outerDependency, function(dependency) {

            var sourceIndex = _.indexOf(components, dependency);
            var targetIndex = _.indexOf(components, component);

            var link = {
                source: _.indexOf(components, component),
                target: _.indexOf(components, dependency),
            };

            if (sourceIndex > -1 && targetIndex > -1) {
                links.push(link);
            }

        })

    });

    return {
        "directed": true,
        "multigraph": false,
        "graph": [],
        "nodes": nodes,
        "links": links
    }

};

function getCircleRadius(path) {
    var stats = fs.statSync(path);
    var fileSizeInBytes = stats.size;
    var r = Math.round(Math.sqrt(fileSizeInBytes / Math.PI)) / 10;
    return Math.max(1, r);
}

function generateHtml(baseDir, graphData, identification, title) {

    var templatePath = fs.readFileSync(__dirname + '/html/template.html', 'utf8');
    var css = fs.readFileSync(__dirname + '/html/style.css', 'utf8');
    var js = fs.readFileSync(__dirname + '/html/d3-graph.js', 'utf8');

    var data = {
        css: css,
        js: js,
        title: title,
        baseDir: baseDir,
        graphData: JSON.stringify(graphData, null),
        graphID: identification
    };

    return _.template(templatePath)(data);
}


module.exports.output = function(baseDir, dependencies, identification, title) {

    var graphData = generateGraphData(dependencies);
    return generateHtml(baseDir, graphData, identification, title);

};
