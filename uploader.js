// Imports the Google Cloud client library
const credentials = require("./credentials");
const storage = require("./storage");
const fs = require("fs");
const path = require("path");
const util = require("util");

if (process.argv.length < 4) {
    throw new Error("Please specify Folder path and bucket name as args");
}

async function uploadFiles(directory, bucketName) {
    directory = path.resolve(directory);
    console.log(`Import jpegs from directory '${directory}' into bucket '${bucketName}'`);

    const bucket = await storage.getOrCreateBucket(bucketName);
    const fileNames = await util.promisify(fs.readdir)(directory);
    const absoluteFileNames = fileNames.map(name => path.join(directory, name));
    const onlyFiles = absoluteFileNames.filter(name => fs.lstatSync(name).isFile());
    const uploadTasks = onlyFiles.map(fileName => storage.uploadTo(bucket, fileName, { public: true }));

    await Promise.all(uploadTasks);
}

async function main(directory, bucketName) {
    try {
        await uploadFiles(directory, bucketName);
    } catch (error) {
        throw new Error(`Upload failed: ${error}`);
    }
}

const directory = process.argv[2];
const bucketName = process.argv[3];

main(directory, bucketName);
