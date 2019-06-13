lack_number = 0
step_number = 0
algorithm_type = 0
current_instruction = 0
current_page = 0
current_offset = 0
fifo_list = [0, 1, 2, 3]
lru_list = [0, 1, 2, 3]

class Page {
    constructor(id) {
        this.id = id;
        this.instruction_list = [];
    }

    checkInstruction(instruction_id) {
        if (this.instruction_list.indexOf(instruction_id) > -1) {
            return true;
        } else {
            return false;
        }
    }
}

page_list = [new Page(0), new Page(1), new Page(2), new Page(3)]

chooseAlgorithm = (algorithm) => {
    if (algorithm == 0) {
        document.getElementById('algorithm_name').innerHTML = "FIFO";
        algorithm_type = 0;
    }
    else if (algorithm == 1) {
        document.getElementById('algorithm_name').innerHTML = "LRU";
        algorithm_type = 1;
    } else {
        document.getElementById('algorithm_name').innerHTML = "RAND";
        algorithm_type = 2;
    }
    reset();
}

findInstructionInPages = (instruction_id) => {
    for (var i = 0; i < 4; i++) {
        if (page_list[i].checkInstruction(instruction_id)) {
            current_page = i;
            return i;
        }
    }
    return -1;
}

loadPage = (page_id, instruction_id) => {
    var page_table = document.getElementById("table_page" + page_id.toString());
    var start_id = Math.floor(instruction_id / 10) * 10;
    page_list[page_id].instruction_list = [];
    for (var i = 0; i < 10; i++) {
        page_table.children[1].children[i].children[1].innerHTML = "instruction " + (start_id + i).toString();
        page_list[page_id].instruction_list.push(start_id + i);
    }
}

getRandom = (start, end) => {
    var span = end - start;
    return Math.random() * span;
}

updateUI = () => {
    document.getElementById("lack_number").innerHTML = lack_number;
    if (step_number != 0) {
        document.getElementById("lack_rate").innerHTML = (lack_number * 100 / step_number).toString() + "%";
    } else {
        document.getElementById("lack_rate").innerHTML = "0%";
    }
    document.getElementById("instruction_number").innerHTML = step_number;
    document.getElementById("instruction_name").innerHTML = current_instruction;
    document.getElementById("instruction_address").innerHTML = "Page " + current_page.toString() + " offset " + current_offset;
}

loadNewPage = (instruction_id) => {
    if (algorithm_type == 0) {
        loadPage(fifo_list[0], instruction_id);
        current_page = fifo_list[0];
        fifo_list.push(fifo_list[0]);
        fifo_list.splice(0, 1);
    } else if (algorithm_type == 1) {
        loadPage(lru_list[0], instruction_id);
        current_page = lru_list[0];
        lru_list.push(lru_list[0]);
        lru_list.splice(0, 1);
    } else {
        current_page = Math.floor(getRandom(0, 4))
        loadPage(current_page, instruction_id);
    }
    lack_number += 1;
}

oneStep = (is_update_ui) => {
    if (step_number < 320) {
        var decision = getRandom(0, 1);
        if (decision <= 0.5) {
            current_instruction += 1;
        } else if (decision <= 0.75) {
            current_instruction = Math.floor(getRandom(0, current_instruction));
        } else {
            current_instruction = Math.floor(getRandom(current_instruction, 320));
        }
        var find_result = findInstructionInPages(current_instruction);
        if (find_result == -1) {
            loadNewPage(current_instruction);
        } else {
            if (algorithm_type == 1) {
                lru_list.splice(lru_list.indexOf(current_page), 1);
                lru_list.push(current_page);
            }
        }
        current_offset = current_instruction % 10;
        step_number += 1;
        if (is_update_ui) {
            updateUI();
        }
    }
}

allStep = () => {
    for (var i = step_number; i < 320; i++) {
        oneStep(false);
    }
    updateUI();
}

reset = () => {
    lack_number = 0
    step_number = 0
    current_instruction = 0
    current_page = 0
    current_offset = 0
    fifo_list = [0, 1, 2, 3]
    lru_list = [0, 1, 2, 3]
    page_list = [new Page(0), new Page(1), new Page(2), new Page(3)]
    updateUI();
    for (var i = 0; i < 4; i++) {
        var page_table = document.getElementById("table_page" + i.toString());
        for (var j = 0; j < 10; j++) {
            page_table.children[1].children[j].children[1].innerHTML = "";
        }
    }
}
