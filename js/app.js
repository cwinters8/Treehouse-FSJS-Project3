// focus on first form field when the page loads
$(document).ready(() => {
    $('#name').focus();
})

// object to track if all validations are passing
const validations = {
    name: false,
    email: false,
    tshirt: false,
    activities: false,
    payment: false
}

// only display other-title input if 'Other' job role is selected
const titles = $('#title');
const otherTitle = $('#other-title');
otherTitle.hide();
titles.change((e) => {
    if (e.target.value === 'other') {
        otherTitle.show();
        otherTitle.focus();
    } else {
        otherTitle.hide();
    }
})

const tshirtColorLabel = $("label[for='color']");
const tshirtColorSelect = $('#color');
// function to show or hide tshirt color elements
function colorElementDisplay(bool) {
    if (bool) {
        tshirtColorLabel.show();
        tshirtColorSelect.show();
    } else {
        tshirtColorLabel.hide();
        tshirtColorSelect.hide();
    }
}

// initially hide t-shirt color label and input
colorElementDisplay(false);

const designs = $('#design');
const colors = $('#color option');
// displays appropriate colors based on regex input
function colorOptionDisplay(regex) {
    const matchedColors = [];
    colorElementDisplay(true);
    const selected = $('#color option[selected="selected"]');
    selected.removeAttr('selected');
    colors.each((i) => {
        const color = $(colors[i]);
        color.detach();
        if (regex.test(color.text())) {
            color.appendTo('#color');
            matchedColors.push(color);
        }
    })
    // set first option as default
    matchedColors[0].attr('selected', 'selected');
}

// show appropriate colors when a design is selected
designs.change((e) => {
    if (e.target.value === 'js puns') {
        colorElementDisplay(true);
        colorOptionDisplay(/.*JS Puns.*/);
    } else if (e.target.value === 'heart js') {
        colorElementDisplay(true);
        colorOptionDisplay(/.*I ♥ JS.*/);
    } else {
        colorElementDisplay(false);
    }
})

/****************
** VALIDATIONS **
****************/

// highlight given field in red
function error(field, bool) {
    if (bool) {
        field.addClass('error');
    } else {
        field.removeClass('error');
    }
}

// execute error and append functions based on regex tests
function validateActions(event, label, err, regex) {
    if (!regex.test(event.target.value)) {
        error($(event.target), true);
        label.append(err);
        return false;
    } else {
        error($(event.target), false);
        err.remove();
        return true;
    }
}

// name
const nameLabel = $('label[for="name"]');
const nameError = $('<span> Please enter a name.</span>');
$('#name').blur((e) => {
    const regex = /\w+/;
    const check = validateActions(e, nameLabel, nameError, regex);
    validations.name = check;
})

// email
const emailInput = $('#mail');
const emailLabel = $('label[for="mail"]');
const emailError = $('<span> Please enter a valid email.</span>');
const emailRegex = /^[^@]+@[^@]+\.[a-z]+$/i;
emailInput.on('input', (e) => {
    validateActions(e, emailLabel, emailError, emailRegex);
})
emailInput.blur((e) => {
    const check = validateActions(e, emailLabel, emailError, emailRegex);
    validations.email = check;
})

// activities
const activities = $('.activities input');

// add a cost section to activities fieldset
const activitiesFieldset = $('.activities');
const costDiv = $('<div id="cost">Total Cost: $</div>');
const costSpan = $('<span></span>');
let totalCost = 0;
activitiesFieldset.append(costDiv);
costDiv.append(costSpan);
costSpan.text(totalCost);

// add or subtract from the total cost
function costs(activity, operator) {
    let label = activity.parent();
    const regex = / \$/;
    label = label.text().split(regex);
    let activityCost = label[label.length - 1];
    activityCost = parseInt(activityCost);
    if (operator === 'add') {
        totalCost += activityCost;
    } else {
        totalCost -= activityCost;
    }
    costSpan.text(totalCost);
}

// TO-DO: remove hardcoded activity data and extract from text with regex
// const tuesNineAm = [
//     $('input[name="js-frameworks"]'),
//     $('input[name="express"]')
// ]
// const tuesOnePm = [
//     $('input[name="js-libs"]'),
//     $('input[name="node"]')
// ]
// grey out conflicting activity times, or re-enable if unchecked
function conflict(activity, checked) {
    // const name = activity.attr('name');
    const regex = / — ([^$].+),/;
    const targetText = activity.parent().text();
    let targetTime = targetText.match(regex);
    if (targetTime) {
        targetTime = targetTime[1];
    }
    const labels = $('.activities label');
    // loop through labels and find any matching times
    for (let i = 0; i < labels.length; i++) {
        let text = labels[i].innerText;
        let time = text.match(regex);
        if (time) {
            time = time[1];
            if (time === targetTime && text !== targetText) {
                if (checked) {
                    $($(labels[i]).children()[0]).attr('disabled', 'disabled');
                    $(labels[i]).addClass('conflict');
                } else {
                    $($(labels[i]).children()[0]).removeAttr('disabled');
                    $(labels[i]).removeClass('conflict')
                }
                
            }
        }
    }
}

const checked = [];
// attach a listener to each activity checkbox
for (let i = 0; i < activities.length; i++) {
    const activity = activities[i];
    // add and remove activities from the checked array
    $(activity).change((e) => {
        if ($(e.target).prop('checked')) {
            checked.push(e.target.name);
            conflict($(e.target), true);
            costs($(e.target), 'add');
        } else {
            conflict($(e.target), false);
            costs($(e.target), 'subtract');
            for (let j = 0; j < checked.length; j++) {
                if (checked[j] === e.target.name) {
                    checked.splice(j, 1);
                }
            }
        }
        // change activities value in validations object based on whether any boxes are checked
        if (checked.length > 0) {
            validations.activities = true;
        } else {
            validations.activities = false;
        }
    })
}

// payment method handling


// validate all fields on submit and show errors where necessary