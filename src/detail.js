import * as d3 from "d3";
const url = "http://iz-websrv01.ethz.ch:3000/api/visitors";
const debugMode = false;
const nrOfIcons = {
	sittingPeopleG: 14,
	sittingPeopleH: 14,
	sittingPeopleJ: 8
};
let lastData;
let trendTimer;
let updateTimer;


const putText = (text, color="#808080", size=36) => {
    d3
        .selectAll("#ts > *")
        .text(text)
        .attr("font-size", size)
        .attr("fill", color);
}


const annotate = (closed, ts) => {
    d3
        .selectAll("#closed > #icon")
        .attr("opacity", closed ? 1 : 0);
    let text, color;
    if (closed) {
    	color = "#EC1C24";
		text = "closed";
    } else {
        const formatTime = d3.timeFormat("%H:%M");
    	text = formatTime(new Date(ts));
    }
    putText(text, color);
};


const processData = data => {
    console.log(data);
    if (data.library_is_closed) {
    	data.G = 0;
		data.H = 0;
		data.J = 0;
		data.trend = 0;
    } 
    refreshFloorOccupancy("sittingPeopleG", data.G, data.G_max);
    refreshFloorOccupancy("sittingPeopleH", data.H, data.H_max);
    refreshFloorOccupancy("sittingPeopleJ", data.J, data.J_max);
    visualizeTrend(data.trend);
    annotate(data.library_is_closed, data.ts);
}


const update = () => {
   	if (!debugMode) {
    	updateTimer = setTimeout(() => putText("updating...", "#808080", 22), 2000);
        fetch(url)
            .then(response => response.json())
            .then(data => {
            	clearTimeout(updateTimer);
                processData(data);
                lastData = data;
            }).catch(e => {
                clearTimeout(updateTimer);
                processData(lastData);
                console.log("Couldn't fetch library occupancy data from server |", e);                
                if (lastData) {
                    // lastData.ts = new Date().toString(); // vorgaukeln
                } else {
                    putText("no data", "#808080", 30);    
                }
            });        
    } else {
        const data = {
            G_max: 68,
            H_max: 68,
            J_max: 40,
            trend: Math.round((Math.random()*2)-1),
            ts: new Date().toString(),
            library_is_closed: Math.random() > 0.7
        }
        data.G = Math.round(Math.random()*data.G_max);
        data.H = Math.round(Math.random()*data.H_max);
        data.J = Math.round(Math.random()*data.J_max); 
        data.no_data = Math.random() > 0.7 && !data.library_is_closed;
        processData(data);       
    }
}


const visualizeTrend = trend => {
    if (trendTimer) {
        trendTimer.stop();
    }
    d3
        .selectAll("#walkingPerson")
        .interrupt()  
        .attr("opacity", 0);     
    if (trend === 0) {
        return;
    }
    const target = {
        x: trend === 1 ? 150 : 24,
        y: 499,
        scale: trend === 1 ? 1 : 2
    };
    const origin = {
        x: trend === 1 ? 24 : 150,
        y: 499,
        scale: trend === 1 ? 2 : 1
    };
    const transtitionTime = 4000;
    const move = () => {
        d3
            .selectAll("#walkingPerson")
            .attr("transform", "translate(" + origin.x + "," + origin.y + ") scale(" + origin.scale + ")")
            .attr("opacity", 0)
            .transition()
            .duration(0.2*transtitionTime)
            .attr("opacity", 1)
            .transition()
            .duration(0.6*transtitionTime)
            .attr("transform", "translate(" + target.x + "," + target.y + ") scale(" + target.scale + ")")
            .transition()
            .duration(0.2*transtitionTime)            
            .attr("opacity", 0);             
    }   
    move();
    trendTimer = d3.interval(move, transtitionTime);
}


const refreshFloorOccupancy = (id, count, count_max) => {
	const nrOfPeoplePerDesk = Math.round(count_max / nrOfIcons[id]);
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


const enableRefresh = () => {
    d3
        .selectAll("#text-ts")
        .on("click", update);
}

enableRefresh();
update();
setInterval(update, 60000);


console.log("Interactive visualization by Sam Hertig ––– www.samhertig.com");

