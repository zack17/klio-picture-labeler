const storage = require("./storage");
const recognition = require("./recognition");

async function labelPictures(bucketName) {
    const bucket = await storage.getOrCreateBucket(bucketName);
    const fileNames = await storage.ls(bucket);

    for (const file of fileNames) {
        console.log(`Retrieve labels for file ${file.name}`);
        try {
            const labels = await recognition.getLabels(file.metadata.mediaLink);
            const metadata = {
                metadata: {
                    labels: JSON.stringify(labels)
                }
            };

            console.log(`Set metadata for file ${file.name}`);
            await storage.setMetadata(file, metadata);
        } catch (ex) {
            console.warn("Failed to set metadata for file ${file.name}", ex);
        }
    }
}

async function main(bucketName) {
    try {
        await labelPictures(bucketName);
    } catch (error) {
        console.error(error);
    }
}

if (process.argv.length < 3) {
    throw new Error("Please specify a bucket name");
}

main(process.argv[2]);
