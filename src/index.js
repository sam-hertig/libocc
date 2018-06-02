import * as d3 from "d3";

const url = 'http://iz-websrv01.ethz.ch:3000/api/visitors';

console.log("yay");


fetch(url)
    .then(response => response.json())
    .then(data => {
        console.log(data);
    })
    .catch(e => {
        console.log("Couldn't get library data;", e)
    });







// Define dimensions
const maxWidth = 643;
const maxHeight = 1250;
const margin = { top: 20, right: 20, bottom: 20, left: 20 };
const width = maxWidth - margin.left - margin.right;
const height = maxHeight - margin.top - margin.bottom;

// Create base SVG
const svg = d3.select("#viz")
   .append("div")
   .classed("svg-container", true)
   .append("svg")
   .attr("preserveAspectRatio", "xMinYMin meet")
   .attr("viewBox", "0 0 " + width + " " + height)
   .classed("svg-content-responsive", true)
   .append('g')
   .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');    

// Console branding
console.log("Interactive visualization by Sam Hertig ––– www.samhertig.com");
