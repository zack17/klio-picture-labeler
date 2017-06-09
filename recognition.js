const Vision = require('@google-cloud/vision');
const path = require("path");
const util = require("util");
const credentials = require("./credentials");

// Instantiates a client
const vision = Vision(credentials);



function getLabels(imageUrl) {
    return new Promise((resolve, reject) => {
        vision.detectLabels(imageUrl, {
            maxResults: 10
        }, function (error, labels) {
            if (error !== null) {
                reject(error);
            }
            resolve(labels);
        });
    });
}

module.exports = {
    getLabels: getLabels
};
