const updateFields = {};
// updateFields.name = 'asda';
updateFields.vv = 'asda';

// Using hasOwnProperty
if (updateFields.hasOwnProperty("name") ||  updateFields.hasOwnProperty("vv")) {
    console.log("Key exists");
}

if (updateFields.hasOwnProperty("asd")) {
    console.log("Key asd exists");
}