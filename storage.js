const credentials = require("./credentials");
const util = require("util");

const storage = require('@google-cloud/storage')(credentials);

function getBuckets() {
    return new Promise((resolve, reject) => {
        storage.getBuckets(function (error, buckets) {
            if (error !== null) {
                reject(error);
            }
            resolve(buckets);
        });
    });
}

function createBucket(name) {
    return new Promise((resolve, reject) => {
        storage.createBucket(name, function (error, bucket) {
            if (error !== null) {
                reject(error);
            }

            resolve(bucket);
        });
    });
}

async function getOrCreateBucket(name) {
    const bucket = storage.bucket(name);

    return new Promise((resolve, reject) => {
        bucket.get({ autoCreate: true }, function (error, retrieved) {
            if (error !== null) {
                reject(error);
            }
            resolve(retrieved);
        });
    });
}

function uploadTo(bucket, filePath, options) {
    return new Promise((resolve, reject) => {
        bucket.upload(filePath, options, function (error, result) {
            if (error !== null) {
                reject(error);
            }

            resolve(result);
        })
    });
}

function ls(bucket) {
    return new Promise((resolve, reject) => {
        bucket.getFiles({
            maxResults: 1000
        }, function (error, files) {
            if (error !== null) {
                reject(error);
            }
            resolve(files);
        });
    })
}

function setMetadata(file, metadata) {
    return new Promise((resolve, reject) => {
        file.setMetadata(metadata, function (error, apiResponse) {
            if (error !== null) {
                reject(error);
            }
            resolve(apiResponse);
        });
    });
}

module.exports = {
    getOrCreateBucket,
    uploadTo,
    ls,
    setMetadata
};

