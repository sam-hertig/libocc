import { get } from "axios";

const url = "http://iz-websrv01.ethz.ch:3000/api/visitors";
const debugMode = false; // if true, no backend-call is performed, and only fake data is generated (-> set to false for production!)
let lastData;

const updateTrend = trend => {
	let rot;
	if (trend === 1) {
		rot = "45deg";
	} else if (trend === -1) {
		rot = "-45deg";
	} else {
		rot = "0deg";
	}
	document.querySelector(".occupancy .trend .arrow").style.transform = "rotate(" + rot + ")";
}

const updateBar = data => {
	const current = data.overall || data.G + data.H + data.J;
	const max = data.overall_max || data.G_max + data.H_max + data.J_max;
	const width = Math.round(100*current/max) + "%";
	document.querySelector(".occupancy .bar .bar-filled").style.width = width;
	document.querySelector(".occupancy .bar-value").innerHTML = width;
}

const showElement = closed => {
	const el = document.querySelector(".occupancy");
	if (closed) {
		el.style.display = "none";
	} else {
		el.style.display = "flex";
	}
}

const processData = data => {
	console.log("Data:", data);
	showElement(data.library_is_closed);
	updateBar(data);
	updateTrend(data.trend);		

}

const update = () => {
   	if (!debugMode) {
        get(url)
            .then(response => {
                processData(response.data);
                lastData = response.data;
            }).catch(error => {
            	if (lastData) {
            		processData(lastData);	
            	}
                console.log("Couldn't fetch library occupancy data from server |", error);                
            });        
    } else {
        const data = {
            G_max: 68,
            H_max: 68,
            J_max: 40,
            overall_max: 176,
            trend: Math.round((Math.random()*2)-1),
            ts: new Date().toString(),
            library_is_closed: Math.random() > 0.9
        }
        data.G = Math.round(Math.random()*data.G_max);
        data.H = Math.round(Math.random()*data.H_max);
        data.J = Math.round(Math.random()*data.J_max);
        data.overall = Math.round(Math.random()*data.overall_max);
        data.no_data = Math.random() > 0.7 && !data.library_is_closed;
        processData(data);       
    }
}

update();
setInterval(update, debugMode ? 4000 : 60000);