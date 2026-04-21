const {
    uploadToAzure,
    deleteFromAzure,
    deleteManyFromAzure,
    keyFromLocationUrl,
    collectImageKeys,
} = require("./azureBlob");

module.exports = {
    generateOtpService: require("./generateOtp"),
    uploadToAzure,
    deleteFromAzure,
    deleteManyFromAzure,
    keyFromLocationUrl,
    collectImageKeys,
};
