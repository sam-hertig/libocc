import * as d3 from "d3";

// API
const url = "http://iz-websrv01.ethz.ch:3000/api/visitors";

// Debug (mock API and generate dummy data)
const debugMode = true;

// Main function
const update = () => {

    const processData = data => {
        refreshFloorOccupancy("sittingPeopleG", data.G, data.G_max);
        refreshFloorOccupancy("sittingPeopleH", data.H, data.H_max);
        refreshFloorOccupancy("sittingPeopleJ", data.J, data.J_max);
        refreshTimestamp(data.ts);        
    }

    if (!debugMode) {
        fetch(url)
            .then(response => response.json())
            .then(data => {
                // if (data.library_is_closed) {
                // else if (!data.no_data) {
                processData(data);
            }).catch(e => {
                console.log("Couldn't fetch library data from server;", e);
            });        
    } else {
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
        processData(data);       
    }

}

// Update timestamp and insert refresh link
const refreshTimestamp = (ts) => {
    const formatTime = d3.timeFormat("%H:%M");
    const timeStamp = formatTime(new Date(ts));
    d3
        .selectAll("#ts")
        .text(timeStamp)
        .on("click", () => update());
};

// Refresh occupancy for a single floor
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
    d3
        .selectAll("#" + id + " > g")
        .data(data)
        .attr("opacity", d => d.occ ? 1 : 0.1)
}

// Initialize and then update every minute
update();
d3.interval(update, 60000);

// Console branding
console.log("Interactive visualization by Sam Hertig ––– www.samhertig.com");






