/*!
 * js Prison Architect Calculator
 * Copyright 2015 Andreas
 * Licensed under MIT (https://github.com/amuttsch/js-prison-architect-calculator/blob/master/LICENSE)
 */

$(document).ready(function () {
    $("#room_tab").find("a").click(function (e) {
        e.preventDefault();
        $(this).tab('show')
    });

    cellRatioPrint();
    onPrisonChange();

    $(document).on('change', 'input', function(){
        onPrisonChange()
    });

    $("#cell_grading_ratio_error").hide(0);
});

function onPrisonChange() {
    CalculatePAObjectsAmount();
    printKitchen();
    printLaundry();
    calculateCellGrading();
    cellRatioPrint();
}

// All objects related to the kitchen and canteen
PAObjects = {
    "Cookers": {amount: 0, squareSize: 2, squaresNeeded: 0, type: "kitchen"},
    "Cooks": {amount: 0, squareSize: 0, squaresNeeded: 0, type: "kitchen_personal"},
    "Fridges": {amount: 0, squareSize: 2, squaresNeeded: 0, type: "kitchen"},
    "Sinks": {amount: 0, squareSize: 3, squaresNeeded: 0, type: "kitchen"},
    "Bins": {amount: 0, squareSize: 1, squaresNeeded: 0, type: "kitchen"},

    "Tables": {amount: 0, squareSize: 4, squaresNeeded: 0, type: "canteen"},
    "Benches": {amount: 0, squareSize: 4, squaresNeeded: 0, type: "canteen"},
    "Serving Table": {amount: 0, squareSize: 5, squaresNeeded: 0, type: "canteen"},

    "Baskets": {amount: 0, squareSize: 1, squaresNeeded: 0, type: "laundry"},
    "Ironing Boards": {amount: 0, squareSize: 3, squaresNeeded: 0, type: "laundry"},
    "Washing Machines": {amount: 0, squareSize: 1, squaresNeeded: 0, type: "laundry"},
    "Janitors": {amount: 0, squareSize: 1, squaresNeeded: 0, type: "laundry_personal"},
    "Laundry Prisoners": {amount: 0, squareSize: 4, squaresNeeded: 0, type: "laundry"},
    "Cleaning Prisoners": {amount: 0, squareSize: 4, squaresNeeded: 0, type: "cleaning"},
};

function CalculatePAObjectsAmount() {
    // get the prison numbers
    var prisoners = $("#no_prisoners").val();
    var meal_variety = $("#meal_variety").val();
    var meal_quantity = $("#meal_quantity").val();

    // Initialize the factors to calculate the objects
    var cookerFactor = 20;
    var fridgeFactor = 1.0;

    // Depending on the meal variety, change the factors
    switch (meal_variety) {
        case "Low":
            fridgeFactor = 1.3;
            break;
        case "Medium":
            fridgeFactor = 1.7;
            break;
        case "High":
            fridgeFactor = 2.0;
            break;
        default:

            break;
    }

    // Depending on the meal quantity, change the factors
    switch (meal_quantity) {
        case "Low":
            cookerFactor = 30;
            break;
        case "Medium":
            cookerFactor = 20;
            break;
        case "High":
            cookerFactor = 11;
            break;
        default:

            break;
    }

    // Kitchen / Canteen
    PAObjects["Cookers"].amount = prisoners / cookerFactor;
    PAObjects["Cooks"].amount = PAObjects["Cookers"].amount + 1;
    PAObjects["Fridges"].amount = PAObjects["Cookers"].amount * fridgeFactor;
    PAObjects["Sinks"].amount = PAObjects["Cookers"].amount / 2;
    PAObjects["Tables"].amount = 1; // Only one table is needed, they are eating from the benches
    PAObjects["Benches"].amount = prisoners / 4;
    PAObjects["Serving Table"].amount = prisoners / 40;
    PAObjects["Bins"].amount = 1; // Only one bin is needed as it can take infinite garbage

    // Laundry / Cleaning
    PAObjects["Baskets"].amount = prisoners / 16;
    PAObjects["Ironing Boards"].amount = PAObjects["Baskets"].amount / 2;
    PAObjects["Washing Machines"].amount = PAObjects["Baskets"].amount / 3;
    PAObjects["Janitors"].amount = prisoners / 100;

    // Working prisoners
    PAObjects["Laundry Prisoners"].amount = prisoners / 16;
    PAObjects["Cleaning Prisoners"].amount = prisoners / 10;

    // Calcuate square requirements
    $.each(PAObjects, function (key, value) {
        PAObjects[key].squaresNeeded = value.squareSize * value.amount;
    });
}


function printKitchen() {
    // Kitchen / canteen objects
    var objectsTable = $("#table_kitchen_objects").find("tbody");
    objectsTable.empty();
    $.each(PAObjects, function (key, value) {
        if (value.type == "kitchen" || value.type == "canteen") {
            objectsTable.append(getRow(key, value.amount));
        }
    });

    // Kitchen area
    objectsTable = $("#table_kitchen_area").find("tbody");
    objectsTable.empty();
    $.each(PAObjects, function (key, value) {
        if (value.type == "kitchen") {
            objectsTable.append(getRow(key, value.squaresNeeded));
        }
    });

    // Canteen area
    objectsTable = $("#table_canteen_area").find("tbody");
    objectsTable.empty();
    $.each(PAObjects, function (key, value) {
        if (value.type == "canteen") {
            objectsTable.append(getRow(key, value.squaresNeeded));
        }
    });
}

function printLaundry() {
    // Laundry objects
    var objectsTable = $("#table_laundry_room").find("tbody");
    objectsTable.empty();
    $.each(PAObjects, function (key, value) {
        if (value.type == "laundry" || value.type == "laundry_personal") {
            objectsTable.append(getRow(key, value.amount));
        }
    });

    // Cleaning cupboard objects
    objectsTable = $("#table_cleaning_cupboard").find("tbody");
    objectsTable.empty();
    $.each(PAObjects, function (key, value) {
        if (value.type == "cleaning") {

            objectsTable.append(getRow(key, value.amount));
        }
    });

    // laundy area
    objectsTable = $("#table_laundry_area").find("tbody");
    objectsTable.empty();
    var squaresRequired = 0;
    $.each(PAObjects, function (key, value) {
        if (value.type == "laundry") {
            objectsTable.append(getRow(key, value.squaresNeeded));
            squaresRequired += value.squaresNeeded;
        }
    });

    // Squares required
    squaresRequired -= PAObjects["Laundry Prisoners"].squaresNeeded;
    if (squaresRequired < PAObjects["Laundry Prisoners"].squaresNeeded) {
        squaresRequired = PAObjects["Laundry Prisoners"].squaresNeeded;
    }
    $("#laundry_squares_required").html("<b>Total squares required: </b>" + Math.round(squaresRequired));

    // Suggested room number
    $("#laundry_suggested_room_number").html("<b>Suggested number of rooms: </b>" + ($("#no_prisoners").val() / 100).toFixed(2));

    // cleaning area
    objectsTable = $("#table_cleaning_area").find("tbody");
    objectsTable.empty();
    squaresRequired = 0;
    $.each(PAObjects, function (key, value) {
        if (value.type == "cleaning") {
            objectsTable.append(getRow(key, value.squaresNeeded));
            squaresRequired += value.squaresNeeded;
        }
    });

    // Rooms to build
    $("#cleaning_rooms_to_build").html("<b>Suggested number of rooms: </b>" + (squaresRequired / 28).toFixed(2));
}

function getRow(key, value) {
    var row = "<tr><td>";
    row += key;
    row += "</td><td>";
    row += Math.round(value);
    row += "</td></tr>";

    return row;
}

CellLevels = {
    0: {size: "3x2", ratio: 0.0, cells: 0},
    1: {size: "3x2", ratio: 0.20, cells: 0},
    2: {size: "3x2", ratio: 0.25, cells: 0},
    3: {size: "3x2", ratio: 0.0, cells: 0},
    4: {size: "3x2", ratio: 0.20, cells: 0},
    5: {size: "3x3", ratio: 0.15, cells: 0},
    6: {size: "3x3", ratio: 0.0, cells: 0},
    7: {size: "3x3", ratio: 0.10, cells: 0},
    8: {size: "4x4", ratio: 0.0, cells: 0},
    9: {size: "4x4", ratio: 0.10, cells: 0},
    10: {size: "4x4", ratio: 0.0, cells: 0}
};

function calculateCellGrading() {
    var prisoners = $("#no_prisoners").val();

    $.each(CellLevels, function (key, value) {
        var id = "#cell_level_" + key;
        var input = $(id).val();
        value.ratio = input / 100;
        value.cells = prisoners * value.ratio;
    });
}

function cellRatioPrint() {
    var objectsTable = $("#table_cell_grading").find("tbody");
    objectsTable.empty();
    var total_ratio = 0.0;
    var avg_level = 0.0;
    var total_cells = 0;

    $.each(CellLevels, function (key, value) {
        var row = '<tr><td class="vertical-center" style="text-align: center;">';
        row += key;
        row += '</td><td class="vertical-center">';
        row += value.size;
        row += '</td><td class="vertical-center">';

        row += '<div class="input-group">';

        var id = "cell_level_" + key;
        var input_value = Math.round(value.ratio * 100);
        row += '<input type="number" aria-describedby="basic-addon2" min="0" max="100" class="form-control" id="' + id + '" value="' + input_value + '">';
        row += '<span class="input-group-addon" id="basic-addon2">%</span>';

        row += '</div>';

        row += '</td><td class="vertical-center" style="text-align: right;">';
        row += Math.round(value.cells);
        row += "</td></tr>";
        objectsTable.append(row);

        total_ratio += value.ratio;
        total_cells += value.cells;
        avg_level += value.cells * key;
    });



    // Show error if ratios don't fit
    if (total_ratio != 1.0) {
        $("#cell_grading_ratio_error").show(500);
    } else {
        $("#cell_grading_ratio_error").hide(500);

        // Show number of cells and avg cell rating
        $("#cell_grading_no_cells").html("<b>Number of cells:</b> " + total_cells);
        $("#cell_grading_avg_level").html("<b>Average cell level:</b> " + (avg_level / total_cells).toFixed(2));
    }
}