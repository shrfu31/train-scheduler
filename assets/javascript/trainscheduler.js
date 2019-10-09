var config = {
    apiKey: "AIzaSyCIpbpLNmnPIGbgl6OtOPC7tcg_qclIk-o",
    authDomain: "traincountboi.firebaseapp.com",
    databaseURL: "https://traincountboi.firebaseio.com",
    projectId: "traincountboi",
    storageBucket: "",
    messagingSenderId: "691571443489",
    appId: "1:691571443489:web:9727e9ebdab0f4a264e060"
};
firebase.initializeApp(config);

var database = firebase.database();

tableSchedule = $("#schedule-table");
trainName = "";
destination = "";
firstTrainTime = "";
frequency = "";
// FORM INPUTS
trainNameInput = $("#train-name-input");
destinationInput = $("#destination-input");
firstTrainTimeInput = $("#first-train-time-input");
frequencyInput = $("#frequency-input");
// DANGER REFERENCES
trainNameText = $("#train-name");
destinationText = $("#destination");
firstTrainTimeText = $("#first-train-time");
frequencyText = $("#frequency");

const hhmmKeyRegExp = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;


// ADD TRAIN
$("#add-train").on("click", function (event) {
    event.preventDefault();

    if (isFormValid()) {

        dbTrainRecord = {
            trainName: trainNameInput.val().trim(),
            destination: destinationInput.val().trim(),
            firstTrainTime: firstTrainTimeInput.val().trim(),
            frequency: frequencyInput.val().trim(),
            dateAdded: firebase.database.ServerValue.TIMESTAMP
        };

        database.ref().push(dbTrainRecord);

        console.log(dbTrainRecord)
        console.log("Train Successfully Added");
        clearForm();
    }
});
//Which one is better? Setting up variables or being direct with jQuery?
function isFormValid() {

    trainName = trainNameInput.val().trim();
    destination = destinationInput.val().trim();
    firstTrainTime = firstTrainTimeInput.val().trim();
    frequency = parseInt(frequencyInput.val().trim());

    passed = true;

    if (trainName === "") {
        trainNameInput.addClass("is-invalid");
        trainNameText.text("Please Provide a Train Name");
        passed = false;
    }
    else {
        trainNameInput.removeClass("is-invalid");
        trainNameText.text("");
    }

    if (destination === "") {
        destinationInput.addClass("is-invalid");
        destinationText.text("Please Provide a Destination");
        passed = false;
    }
    else {
        destinationInput.removeClass("is-invalid");
        destinationText.text("");
    }

    if (!(hhmmKeyRegExp.test(firstTrainTime))) {
        firstTrainTimeInput.addClass("is-invalid");
        firstTrainTimeText.text("Did you forget the colon? Don't forget the format HH:mm");
        passed = false;
    }
    else {
        firstTrainTimeInput.removeClass("is-invalid");
        firstTrainTimeText.text("");
    }

    if (isNaN(frequency) || (frequency <= 0)) {
        frequencyInput.addClass("is-invalid");
        frequencyText.text("How often do you want the train to arrive? Choose a number between 1-1440!");
        passed = false;
    }
    else {
        frequencyInput.removeClass("is-invalid");
        frequencyText.text("");
    }

    if (passed) {
        trainNameInput.removeClass("is-invalid");
        trainNameText.val("");
        destinationInput.removeClass("is-invalid");
        destinationText.val("");
        firstTrainTimeInput.removeClass("is-invalid");
        firstTrainTimeText.val("");
        frequencyInput.removeClass("is-invalid");
        frequencyText.val("");
        alert("“Time goes faster the more hollow it is. Lives with no meaning go straight past you, like trains that don’t stop at your station.”- Carlos Zafon");
        return true;
    }
}

function clearForm() {
    trainNameInput.val("");
    destinationInput.val("");
    firstTrainTimeInput.val("");
    frequencyInput.val("");
};

function nextArrival(firstTime, tFrequency) {

    firstTimeConverted = moment(firstTime, "HH:mm").subtract(1, "years");
    diffTime = moment().diff(moment(firstTimeConverted), "minutes");
    tRemainder = diffTime % tFrequency;
    tMinutesTillTrain = tFrequency - tRemainder;
    nextTrain = moment().add(tMinutesTillTrain, "minutes");

    return moment(nextTrain).format("HH:mm");
};

function minutesAway(firstTime, tFrequency) {
    firstTimeConverted = moment(firstTime, "HH:mm").subtract(1, "years");
    diffTime = moment().diff(moment(firstTimeConverted), "minutes");
    tRemainder = diffTime % tFrequency;
    tMinutesTillTrain = tFrequency - tRemainder;

    return tMinutesTillTrain;
};

database.ref().on("child_added", function (snapshot) {

    firstTrainTime = snapshot.val().firstTrainTime;
    frequency = snapshot.val().frequency;
    nextArrival = nextArrival(firstTrainTime, frequency);
    minutesAway = minutesAway(firstTrainTime, frequency);

    row = $('<tr id="' + snapshot.key + '">');
    row.addClass("row-class");
    trainNameTd = $("<td>");
    trainNameTd.text(snapshot.val().trainName);

    destinationTd = $("<td>");
    destinationTd.text(snapshot.val().destination);

    firstTrainTimeTd = $("<td>");
    firstTrainTimeTd.text(firstTrainTime);

    frequencyTd = $("<td>");
    frequencyTd.text(frequency);

    nextArrivalTd = $("<td>");
    nextArrivalTd.text(nextArrival);

    minutesAwayTd = $("<td>");
    minutesAwayTd.text(minutesAway);

    buttonTd = $("<td>");
    buttonRemove = $('<button class="btn btn-sm btn-danger btn-remove" data-key="' + snapshot.key + '">');
    buttonRemove.html("<span>&times;</span>");
    buttonTd.append(buttonRemove);

    row.append(trainNameTd);
    row.append(destinationTd);
    row.append(firstTrainTimeTd);
    row.append(frequencyTd);
    row.append(nextArrivalTd);
    row.append(minutesAwayTd);
    row.append(buttonTd);

    row.appendTo(tableSchedule);

}, function (errorObject) {
    console.log("Errors handled: " + errorObject.code);
});

function deleteTrain() {
    // console.log(this);
    key = $(this).attr("data-key");
    console.log(key);

    database.ref().child(key).remove();
    $("#" + key).remove()
   
}
//ALLOWS IMMEDIATE DELETION WITH NO REFRESH
 $(document).on("click", ".btn-remove", deleteTrain);
