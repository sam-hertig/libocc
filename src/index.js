import * as d3 from "d3";

const url = "http://iz-websrv01.ethz.ch:3000/api/visitors"; // API
const debugMode = true; // mock API and generate dummy data
const nrOfPeoplePerDesk = 5;
let timer;

// Main function
const update = () => {

    const processData = data => {
        console.log(data);
        refreshTimestamp(data.ts);
        refreshFloorOccupancy("sittingPeopleG", data.G, data.G_max);
        refreshFloorOccupancy("sittingPeopleH", data.H, data.H_max);
        refreshFloorOccupancy("sittingPeopleJ", data.J, data.J_max);
        visualizeTrend(data.trend);
        libIsClosed(data.library_is_closed);
        // !data.no_data) 
    }

    if (!debugMode) {
        fetch(url)
            .then(response => response.json())
            .then(data => {
                processData(data);
            }).catch(e => {
                console.log("Couldn't fetch library data from server |", e);
            });        
    } else {
        const data = {
            G_max: 68,
            H_max: 68,
            J_max: 40,
            trend: Math.round((Math.random()*2)-1),
            ts: new Date().toString(),
            library_is_closed: Math.random() > 0.5
        }
        data.G = Math.round(Math.random()*data.G_max);
        data.H = Math.round(Math.random()*data.H_max);
        data.J = Math.round(Math.random()*data.J_max); 
        processData(data);       
    }

}

const libIsClosed = closed => {
    d3
        .selectAll("#closed > #icon")
        .attr("opacity", closed ? 1 : 0);
    if (closed) {
        if (timer) {
            timer.stop();
        }     
        d3
            .selectAll("#walkingPerson")
            .interrupt()            
            .attr("opacity", 0);
        d3
            .selectAll("#ts > *")
            .text("closed")
            .attr("dx", -5);            
    } else {
        d3
            .selectAll("#ts > *")
            .attr("dx", 0);         
    }
};




const visualizeTrend = trend => {

    if (timer) {
        timer.stop();
    }

    d3
        .selectAll("#walkingPerson")
        .attr("opacity", 0);     

    if (trend === 0) {
        return;
    }

    const targetX = trend === 1 ? 150 : 24; 
    const originX = trend === 1 ? 24 : 150; 
    const transtitionTime = 4000;

    const move = () => {
        d3
            .selectAll("#walkingPerson")
            .attr("transform", "translate(" + originX + ",499)")
            .attr("opacity", 0)
            .transition()
            .duration(0.3*transtitionTime)
            .ease(d3.easeLinear)
            .attr("transform", "translate(" + (originX + (targetX-originX)/3) + ",499)")
            .attr("opacity", 1)
            .transition()
            .duration(0.6*transtitionTime)
            .ease(d3.easeLinear)
            .attr("transform", "translate(" + targetX + ",499)")
            .attr("opacity", 0);             
    }   
    
    move();
    timer = d3.interval(move, transtitionTime);
}


// Update timestamp and insert refresh link
const refreshTimestamp = (ts) => {
    const formatTime = d3.timeFormat("%H:%M");
    const timeStamp = formatTime(new Date(ts));
    d3
        .selectAll("#ts > *")
        .text(timeStamp)
        .on("click", () => update());
};

// Refresh occupancy for a single floor
const refreshFloorOccupancy = (id, count, count_max) => {
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
        .attr("opacity", d => d.occ ? 1 : 0)
}

// Initialize and then update every minute
update();
d3.interval(update, 60000);

// Console branding
console.log("Interactive visualization by Sam Hertig ––– www.samhertig.com");






