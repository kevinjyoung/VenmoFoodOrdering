// Executes when an option's checkbox is checked or unchecked.
var onOptionChange = function () {
    // Index of the option in the menu
    var index = $(this).attr('id')

    // The index in the item group's children array.
    var option = optionsToDisplay[index];

    if (this.checked) {
        // Add the option to the item in the tray.
        tray.items[option.itemId].options.push(option);
    }
};

// Displays a menu for selection options for a given item.
var displayOptions = function (item) {
    $('#optionsModal').empty();
    $('#optionsModal').append('<h3 align="center">Options</h3>' +
        '<a class="close-reveal-modal">&#215;</a>');

    // Intentionally global for now.
    optionsToDisplay = [];
    if (item.children) {
        for (var i = 0; i < item.children.length; i += 1) {
            for (var j = 0; j < item.children[i].children.length; j += 1) {
                var optionGroup = item.children[i];
                var option = item.children[i].children[j];
                for (var k = 0; k < option.availability.length; k += 1) {
                    if (availableMeals.indexOf(option.availability[k]) !== -1) {
                        optionsToDisplay.push({
                            'id': option.id,
                            'itemId': item.id,
                            'name': option.name,
                            'price': option.price,
                            'description': option.descrip
                        });
                    }
                }
            }
        }
    }

    // Item name for reminder.
    $('#optionsModal').append('<div class="row" align="center"><h3>' + item.name + '</h3></div>');

    // Actually display the options.
    for (var h = 0; h < optionsToDisplay.length; h += 1) {
        option = optionsToDisplay[h];
        $('#optionsModal').append('<div class="row" align="center">' +
            option.name + '</h4> <div class="row"> <h5>' +
            option.description + '</h5> </div> <div class="row"> <h5>' +
            option.price + '</h5> </div> <input type="checkbox"' +
            'class="option" id="' + h + '"></input><h4></div>');
    }

    $('#optionsModal').append('<div align="center"><input type="text" placeholder="Quantity" id="quantity"></input>');
    $('#optionsModal').append('<div align="center">' +
            '<button id="closeModal" class="row large-12 small-12 columns">Add to order</button></div>');
    $('#optionsModal').foundation('reveal', 'open');
    $('.option').change(onOptionChange);
    $('#closeModal').click(function () {
        $('#optionsModal').foundation('reveal', 'close');
    });
};

// Executes when a menu item's checkbox is checked or unchecked.
var onMenuItemChange = function () {
    // Index of the item in the menu
    var index = $(this).attr('id')

    // The index in the item group's children array.
    var itemIndex = displayItems[index].itemIndex;

    // The actual item that was clicked on.
    var item = currentMenu[displayItems[index].menuIndex].children[itemIndex];

    if (this.checked) {
        // Add the item to the tray here.
        tray.addToTray({
            'id': item.id,
            'name': item.name,
            'price': item.price,
            'quantity': 1,
            'options': []
        });
        displayOptions(item);
    }
};

// Executes when a restaurant is chosen, and displays the menu for that restaurant.
var onRestaurantClick = function () {
    $('#menu').html('<h3 align="center">Loading menu</h3>');
    var index = $(this).attr('id');
    var rid = restaurants[index].id;
    $.getJSON('/fee', { 'rid': rid, 'addr': addr, 'city': city, 'zip': zip }, function (feeData) {
        var minOrderAmount = parseFloat(feeData.mino);
        availableMeals = feeData.meals;
        var willStillDeliver = feeData.delivery;

        // Clear the loading message.
        $('#menu').empty();

        //Display either a menu or a notifaction that there is no delivery.
        if (willStillDeliver === '0' || feeData.msg){
            $('#menu').append('<h3 align="center">This restaurant is no longer currently delivering</h3>');
        } else {
            $.getJSON('/menuitems', { 'rid': rid }, function (menu) {
                displayItems = [];
                currentMenu = menu;

                // Iterate through the data to build an array of all valid menu items.
                for (var i = 0; i < menu.length; i += 1) {
                    for (var j = 0; j < menu[i].children.length; j += 1) {
                        // i is the index in the menu, and j is the index
                        // for the menu's children
                        var item = menu[i].children[j];
                        for (var h =0; h < item.availability.length; h += 1) {
                            if (availableMeals.indexOf(item.availability[h]) !== -1) {
                                displayItems.push({
                                    'id': item.id,
                                    'menuIndex': i,
                                    'itemIndex': j,
                                    'name': item.name,
                                    'description': item.descrip,
                                    'price': item.price
                                });
                                break;
                            }
                        }
                    };
                };

                // Populate the menu div with all valid menu items.
                for (var k = 0; k < displayItems.length; k += 1) {
                    var item = displayItems[k];
                    $('#menu').append('<div class="row" align="center"><h4>' +
                        item.name + ' <input type="checkbox" class="menu-item" id="' + k +
                        '"></input> </h4> <div class="row"> <h5>' + item.description +
                        '</h5> </div> <div class="row"> <h5>' + item.price +
                        '</h5> </div></div>');
                }

                $('.menu-item').change(onMenuItemChange);

            });
        }
    });
};

$(document).ready(function () {
    var displayItems = [];
    var currentMenu = {};
    $('.restaurant').click(onRestaurantClick);
});
