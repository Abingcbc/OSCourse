let state = {
    'HOVER': 0,
    'UP': 1,
    'DOWN':-1,
    'OPEN':2,
}

// -3 : 按键未被激活但无法被激活
// -2 : 按键未被激活
// -1 : 按键被激活但未被分配
// >=0 : 按键被激活且被分配到第i个电梯
floorState = [[-2,-2],[-2,-2],[-2,-2],[-2,-2],[-2,-2],
              [-2,-2],[-2,-2],[-2,-2],[-2,-2],[-2,-2],
              [-2,-2],[-2,-2],[-2,-2],[-2,-2],[-2,-2],
              [-2,-2],[-2,-2],[-2,-2],[-2,-2],[-2,-2]];
elevator_normal = [true,true,true,true,true]

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class Elevator {
    constructor(id) {
        this.id = id;
        this.state = state['HOVER']; // 表示电梯此时的运动方向
        this.direction = state['HOVER']; // 表示电梯此时响应的请求的方向
        this.current = 0;
        this.innerDest = [];
        this.open = 0;
        this.isRun = false;
    }

    setYellow() {
        $("tbody").children().eq(19 - this.current).children().eq(this.id+1).attr("class","table-warning");
    }
    setRed() {
        $("tbody").children().eq(19 - this.current).children().eq(this.id+1).attr("class","table-danger");
    }
    setDefault() {
        $("tbody").children().eq(19 - this.current).children().eq(this.id+1).attr("class","table-default");
    }

    addDest(floor) {
        this.innerDest.push(floor);
    }

    checkIfStop() {
        if (this.innerDest.indexOf(this.current) != -1) {
            return true;
                                                            // this.id
        } else if (floorState[this.current][this.direction==1?0:1] >= 0) {
            return true;
        }
        return false;
    }

    checkKeepMoving() {
        if (this.direction == state['UP']) {
            for (var i = 0; i < 20; i++) {
                if (floorState[i][0] == this.id) {
                    return true;
                }
            }
        } else if (this.direction == state['DOWN']) {
            for (var i = 19; i >= 0; i--) {
                if (floorState[i][1] == this.id) {
                    return true;
                }
            }
        }
        if (this.innerDest.length != 0 && this.state != state['OPEN']) {
            if (this.current > this.innerDest[0]) {
                this.direction = state['DOWN'];
            } else if (this.current < this.innerDest[0]) {
                this.direction = state['UP'];
            }
            return true;
        }
        return false;
    }

    arriveFloor() {
        if (this.innerDest.indexOf(this.current) != -1) {
            this.innerDest.splice(this.innerDest.indexOf(this.current),1);
            finishInnerRequest(this.id);
            console.log("arriveFloor" + this.current.toString());
        } 
                                                        // this.id
        if (floorState[this.current][this.direction==1?0:1] >= 0) {
            finishRequest(this.current,this.direction);
            console.log("arriveFloor" + this.current.toString());
        }
    }

    async run() {
        this.isRun = true;
        while(elevator_normal[this.id]) {
            var sign = true;
            if (this.checkIfStop()) {
                console.log("countdown" + this.id.toString());
                this.arriveFloor();
                this.state = state['OPEN'];
                floorState[this.current][this.direction==1?0:1] = -3;
                this.setYellow();
                this.open++;
                for (var i = 0; i < 5; i++) {
                    if (this.open > 0) {
                        await sleep(1000);
                    } else {
                        break;
                    }
                }
                this.open--;
                if (!elevator_normal[this.id]) {
                    break;
                }
                if (this.open <= 0) {
                    this.setDefault();
                    this.open = 0;
                    if (this.state == state['OPEN']) {
                        this.state = state['HOVER'];
                    }
                }
                sign = false;
                floorState[this.current][this.direction==1?0:1] = -2;
            }
            if (this.checkKeepMoving() && this.state != state['OPEN']) {
                if (!elevator_normal[this.id]) {
                    break;
                }
                this.moveNextFloor();
                if (!elevator_normal[this.id]) {
                    break;
                }
                await sleep(1000);
                if (!elevator_normal[this.id]) {
                    break;
                }
                sign = false;
            }
            if (sign) {
                break;
            }
        }
        console.log("id-"+this.id.toString()+" stop");
        this.direction = state['HOVER'];
        document.getElementById("state_"+this.id.toString()).innerHTML = "⏺"
        this.state = state['HOVER'];
        this.isRun = false;
    }

    moveNextFloor() {
        $("tbody").children().eq(19 - this.current)
        .children().eq(this.id+1).children().eq(0).children().eq(0).attr("style","visibility:hidden");
        if (this.direction == state['DOWN']) {
            var isFound = false;
            for (var i = 19; i >= 0; i--) {
                if (floorState[i][1] == this.id) {
                    if (i > this.current) {
                        this.state = state['UP'];
                        document.getElementById("state_"+this.id.toString()).innerHTML = "⬆️";
                    } else if (i < this.current) {
                        this.state = state['DOWN'];
                        document.getElementById("state_"+this.id.toString()).innerHTML = "⬇️";
                    }
                    isFound = true;
                    break;
                }
            }
        } else if (this.direction == state['UP']) {
            for (var i = 0; i < 20; i++) {
                if (floorState[i][0] == this.id) {
                    if (i > this.current) {
                        this.state = state['UP'];
                        document.getElementById("state_"+this.id.toString()).innerHTML = "⬆️";
                    } else if (i < this.current) {
                        this.state = state['DOWN'];
                        document.getElementById("state_"+this.id.toString()).innerHTML = "⬇️";
                    }
                    isFound = true;
                    break;
                }
            }
        }
        if (!isFound) {
            if (this.innerDest[0] < this.current) {
                this.state = state['DOWN'];
                document.getElementById("state_"+this.id.toString()).innerHTML = "⬇️";
            } else if (this.innerDest[0] > this.current) {
                this.state = state['UP'];
                document.getElementById("state_"+this.id.toString()).innerHTML = "⬆️";
            }
        }
        this.current += this.state;
        $("tbody").children().eq(19 - this.current)
        .children().eq(this.id+1).children().eq(0).children().eq(0).attr("style","visibility:visible");
    }
}

class RequestQueue {
    constructor() {
        this.upQueue = [];
        this.downQueue = [];
        this.setMonitor();
    }
    addRequest(request,type) {
        if (type == state['UP']) {
            if (this.upQueue.length != 0) {
                var i = 0;
                var exist = false;
                for (i = 0; i < this.upQueue.length; i++) {
                    if (this.upQueue[i] == request) {
                        exist = true;
                        break;
                    } else if (this.upQueue[i] < request) {
                        break;
                    }
                }
                if (!exist) {
                    if (i == this.upQueue.length) {
                        this.upQueue.push(request);
                    } else {
                        this.upQueue.slice(i,0,request);
                    }
                }
            } else {
                this.upQueue.push(request);
            }
        } else {
            if (this.downQueue.length != 0) {
                var i = 0;
                var exist = false;
                for (i = 0; i < this.downQueue.length; i++) {
                    if (this.downQueue[i] == request) {
                        exist = true;
                        break;
                    } else if (this.downQueue[i] > request) {
                        break;
                    }
                }
                if (!exist) {
                    if (i == this.downQueue.length) {
                        this.downQueue.push(request);
                    } else {
                        this.downQueue.slice(i,0,request);
                    }
                }
            } else {
                this.downQueue.push(request);
            }
        }
    }

    setMonitor() {
        var monitor = () => {
            if (this.upQueue.length != 0) {
                var bestLift = -1;
                var bestDistance = 999;
                for (var i = 0; i < 5; i++) {
                    if (elevator_normal[i]) {
                        if (elevatorList[i].direction == state['HOVER']) {
                            if (Math.abs(this.upQueue[this.upQueue.length-1] - elevatorList[i].current) 
                                < bestDistance) {
                                    bestLift = i;
                                    bestDistance = Math.abs(elevatorList[i].current - this.upQueue[this.upQueue.length-1]);
                            }
                        } else if ((elevatorList[i].state == state['UP'] ||
                                    elevatorList[i].state == state['OPEN'])
                                    && elevatorList[i].direction == state['UP']) {
                            if (this.upQueue[this.upQueue.length-1] > elevatorList[i].current && 
                                this.upQueue[this.upQueue.length-1] - elevatorList[i].current < bestDistance) {
                                    bestLift = i;
                                    bestDistance = elevatorList[i].current - this.upQueue[this.upQueue.length-1];
                            }
                        }
                    }
                }
                if (bestLift != -1) {
                    console.log("floor-"+this.upQueue[this.upQueue.length-1].toString()+
                                " bestLift-"+bestLift.toString()+
                                " UP");
                    floorState[this.upQueue[this.upQueue.length-1]][0] = bestLift;
                    if (elevatorList[bestLift].direction == state['HOVER']) {
                        elevatorList[bestLift].state = (elevatorList[bestLift].current
                            -this.upQueue[this.upQueue.length-1]>=0)?state['DOWN']:state['UP'];
                        if (elevatorList[bestLift].state == state['DOWN']) {
                            document.getElementById("state_"+bestLift.toString()).innerHTML = "⬇️";
                        } else {
                            document.getElementById("state_"+bestLift.toString()).innerHTML = "⬆️";
                        }
                        elevatorList[bestLift].direction = state['UP'];
                        elevatorList[bestLift].run();
                        elevatorList[bestLift].isRun = true;
                    }
                    this.upQueue.pop();
                }
            }
            if (this.downQueue.length != 0) {
                var bestLift = -1;
                var bestDistance = 999;
                for (var i = 0; i < 5; i++) {
                    if (elevator_normal[i]) {
                        if (elevatorList[i].direction == state['HOVER']) {
                            if (Math.abs(this.downQueue[this.downQueue.length-1] - elevatorList[i].current) 
                                < bestDistance) {
                                    bestLift = i;
                                    bestDistance = Math.abs(elevatorList[i].current - this.downQueue[this.downQueue.length-1]);
                            }
                        } else if ((elevatorList[i].state == state['DOWN'] ||
                                    elevatorList[i].state == state['OPEN'])
                                    && elevatorList[i].direction == state['DOWN']) {
                            if (this.downQueue[this.downQueue.length-1] < elevatorList[i].current && 
                                this.downQueue[this.downQueue.length-1] - elevatorList[i].current < bestDistance) {
                                    bestLift = i;
                                    bestDistance = elevatorList[i].current - this.downQueue[this.downQueue.length-1];
                            }
                        }
                    }
                }
                if (bestLift != -1) {
                    console.log("floor-"+this.downQueue[this.downQueue.length-1].toString()+
                                " bestLift-"+bestLift.toString()+
                                " DOWN");
                    floorState[this.downQueue[this.downQueue.length-1]][1] = bestLift;
                    if (elevatorList[bestLift].direction == state['HOVER']) {
                        elevatorList[bestLift].state = (elevatorList[bestLift].current
                            -this.downQueue[this.downQueue.length-1]>=0)?state['DOWN']:state['UP'];
                        if (elevatorList[bestLift].state == state['DOWN']) {
                            document.getElementById("state_"+bestLift.toString()).innerHTML = "⬇️";
                        } else {
                            document.getElementById("state_"+bestLift.toString()).innerHTML = "⬆️";
                        }
                        elevatorList[bestLift].direction = state['DOWN'];
                        elevatorList[bestLift].run()
                        elevatorList[bestLift].isRun = true;
                    }
                    this.downQueue.pop();
                }
            }
        }
        setInterval(monitor,500);
    }
    
}

init = () => {
    requestQueue = new RequestQueue();
    elevatorList = [new Elevator(0), new Elevator(1), new Elevator(2), new Elevator(3), new Elevator(4)];
}

pushRequest = (current,type) => {
    if (floorState[current][type==1?0:1] == -2) {
        requestQueue.addRequest(current,type);
        $("tbody").children().eq(19 - current).children().eq(6)
        .children().eq(type==1?0:1).attr("style","background-color:#ff7575");
        floorState[current][type==1?0:1] = -1;
    } else if (floorState[current][type==1?0:1] == -3) {
        for (var i = 0; i < 5; i++) {
            if (elevatorList[i].current == current) {
                openDoor(i);
                break;
            }
        }
    }
}

finishRequest = (current,type) => {
    floorState[current][type==1?0:1] = -3;
    $("tbody").children().eq(19 - current).children().eq(6)
    .children().eq(type==1?0:1).removeAttr("style");
}

addInnerDest = (id,dest) => {
    if (elevator_normal[id]) {
        elevatorList[id].innerDest.push(dest);
        $("tbody").children().eq(19-dest)
        .children().eq(id+1).children().eq(0).attr("style","background-color:#ff7575");
        if (!elevatorList[id].isRun) {
            elevatorList[id].run();
        }
    }
}

finishInnerRequest = (id) => {
    $("tbody").children().eq(19-elevatorList[id].current)
    .children().eq(id+1).children().eq(0).removeAttr("style","background-color:#ff7575");
}

async function openDoor(id) {
    if (elevator_normal[id]) {
        elevatorList[id].state = state['OPEN'];
        elevatorList[id].setYellow();
        elevatorList[id].open++;
        await sleep(1000);
        elevatorList[id].open--;
        if (elevatorList[id].open <= 0) {
            elevatorList[id].open = 0;
            elevatorList[id].setDefault();
            if (elevatorList[id].state == state['OPEN']) {
                elevatorList[id].state = state['HOVER'];
            }
        }
    }
}

async function closeDoor(id) {
    if (elevator_normal[id]) {
        elevatorList[id].open = 0;
        elevatorList[id].setDefault();
        if (elevatorList[id].state == state['OPEN']) {
            elevatorList[id].state = state['HOVER'];
        }
    }
}

async function setWarning(id) {
    if (elevator_normal[id]) {
        elevator_normal[id] = false;
        console.log("id-"+id+" warning");
        if (floorState[elevatorList[id].current][elevatorList[id].direction==1?0:1] == -3) {
            floorState[elevatorList[id].current][elevatorList[id].direction==1?0:1] = -2;
        }
        for (var i = 0; i < 20; i++) {
            if (floorState[i][elevatorList[id].direction==1?0:1] == id) {
                floorState[i][elevatorList[id].direction==1?0:1] = -1;
                requestQueue.addRequest(i, elevatorList[id].direction);
            }
        }
        for (var i = 0; i < 20; i++) {
            $("tbody").children().eq(19 - i).children().eq(id+1).attr("class","table-danger");
        }
        await sleep(1000);
        for (var i = 0; i < 20; i++) {
            $("tbody").children().eq(19 - i).children().eq(id+1).attr("class","table-default");
        }
        await sleep(1000);
        for (var i = 0; i < 20; i++) {
            $("tbody").children().eq(19 - i).children().eq(id+1).attr("class","table-danger");
        }
    }
}

