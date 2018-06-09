import * as d3 from "d3";

// API
const url = "http://iz-websrv01.ethz.ch:3000/api/visitors";

// Main function
const update = () => {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            // if (data.library_is_closed) {
            // else if (!data.no_data) {
            console.log("Obtained library data from server");
            refreshOccupancy(data);
            refreshTimestamp(data.ts, data.trend);
        }).catch(e => {
            console.log("Couldn't fetch library data from server;", e);
            // Generate dummy data for testing
            const data = {
                G_max: 68,
                H_max: 68,
                J_max: 40,
                trend: Math.round((Math.random()*2)-1),
                ts: new Date().toString()
            }
            data.G = Math.round(Math.random()*data.G_max);
            data.H = Math.round(Math.random()*data.H_max);
            data.J = Math.round(Math.random()*data.J_max);
            refreshOccupancy(data);  
            refreshTimestamp(data.ts, data.trend);
        });
}

// Update timestamp and insert refresh link
const refreshTimestamp = (ts, trend) => {

    // const formatTime = d3.timeFormat("%H:%M, %B %d, %Y");
    // const timeStamp = formatTime(new Date(ts));
    
    // viz.selectAll(".ts").remove();
    // viz
    //     .append("g")
    //     .attr("class", "ts")
    //     .attr("transform", "translate(" + ((width/2)-margin.left) + "," + (height-(0.4*bezelBottom)) + ")")        
    //     .append("text")
    //     .html("&#x21bb; &nbsp;" + timeStamp)
    //     .attr("text-anchor", "middle")
    //     .on("click", () => update());

};

// Plot data
const refreshOccupancy = data => {

    console.log(data);
    refreshFloorOccupancy("sittingPeopleJ", data.J, data.J_max);

}

const refreshFloorOccupancy = (id, count, count_max) => {

    const nrOfPeoplePerDesk = 5;
    const maxCount = Math.round(count_max/nrOfPeoplePerDesk);
    const curCount = Math.round(count/nrOfPeoplePerDesk);
    const data = [];
    for (let i = 0; i < maxCount; i++) {
        data.push({
            occ: i < curCount
        });
    }

    console.log(curCount, maxCount, data);





}











// Plot single floor data
const plotFloor = (label, count, max, level) => {

    // Generate data with coordinates
    const horMaxNrofIcons = Math.round(max/10);
    const nrOfdesks = horMaxNrofIcons*10;
    const nrOfIcons = nrOfdesks/nrOfDesksPerIcons;
    const data = [];
    for (let i = 0; i<nrOfIcons; i++) {
        const rowNr = Math.floor(i/horMaxNrofIcons);
        data.push({
            x: bezelLeft + (i*iconHorSpace) - (rowNr*horMaxNrofIcons*iconHorSpace),
            y: height - bezelBottom - (rowNr*iconVerSpace) - (level*floorVerSpace),
            occ: (i*nrOfDesksPerIcons)<count
        });
    }

    // Update already placed occupied gradients
    const occupiedGradientsClassName = "occupiedGradientOnFloor" + level;
    const occupiedGradients = viz
        .selectAll("." + occupiedGradientsClassName)
        .data(data)
        .attr("transform", d => "translate(" + d.x + "," + d.y + ") scale(" + iconScale + ")")
        .attr("opacity", d => d.occ ? gradientOpacity : 0)
        .html(occupiedGradient);

    // Add new occupied gradients
    occupiedGradients
        .enter()
        .append("g")
        .attr("class", occupiedGradientsClassName + " gradient")
        .attr("transform", d => "translate(" + d.x + "," + d.y + ") scale(" + iconScale + ")")
        .attr("opacity", d => d.occ ? gradientOpacity : 0)
        .html(occupiedGradient);

    // Remove occupied gradients if necessary
    occupiedGradients.exit().remove();          

    // Update already placed free gradients
    const freeGradientsClassName = "freeGradientOnFloor" + level;
    const freeGradients = viz
        .selectAll("." + freeGradientsClassName)
        .data(data)
        .attr("transform", d => "translate(" + d.x + "," + d.y + ") scale(" + iconScale + ")")
        .attr("opacity", d => d.occ ? 0 : gradientOpacity)
        .html(freeGradient);

    // Add new free gradients
    freeGradients
        .enter()
        .append("g")
        .attr("class", freeGradientsClassName + " gradient")
        .attr("transform", d => "translate(" + d.x + "," + d.y + ") scale(" + iconScale + ")")
        .attr("opacity", d => d.occ ? 0 : gradientOpacity)
        .html(freeGradient);

    // Remove free gradients if necessary
    freeGradients.exit().remove();        

    // Update already placed desks
    const deskClassName = "deskOnFloor" + level;
    const desks = viz
        .selectAll("." + deskClassName)
        .data(data)
        .attr("transform", d => "translate(" + d.x + "," + d.y + ") scale(" + iconScale + ")")
        .html(deskHtml);

    // Add new desks if needed
    desks
        .enter()
        .append("g")
        .attr("class", deskClassName)
        .attr("transform", d => "translate(" + d.x + "," + d.y + ") scale(" + iconScale + ")")
        .html(deskHtml);

    // Remove desks if necessary
    desks.exit().remove();

    // Update already placed people
    const personClassName = "personOnFloor" + level;
    const people = viz
        .selectAll("." + personClassName)
        .data(data)
        .attr("transform", d => "translate(" + d.x + "," + d.y + ") scale(" + iconScale + ")")
        .attr("opacity", d => d.occ ? 1 : 0)
        .html(personHtml);

    // Add new people if needed
    people
        .enter()
        .append("g")
        .attr("class", personClassName + " person")
        .attr("transform", d => "translate(" + d.x + "," + d.y + ") scale(" + iconScale + ")")
        .attr("opacity", d => d.occ ? 1 : 0)
        .html(personHtml);

    // Remove people if necessary
    people.exit().remove();

    // Place floor label
    const labelYPos = height - 0.94*bezelBottom - (level*floorVerSpace);
    const floorLabelName = "floor-" + level + "-label";
    viz.selectAll("." + floorLabelName).remove();
    viz
        .append("text")
        .attr("transform", "translate(" + 0 + "," + labelYPos + ")")
        .attr("class", "floor-label " + floorLabelName)
        .attr("dy", "0.35em")
        .attr("dx", -0.5*margin.left)
        .text(label);   

}

// Initialize and then update every minute
update();
d3.interval(update, 60000);

// Console branding
console.log("Interactive visualization by Sam Hertig ––– www.samhertig.com");






