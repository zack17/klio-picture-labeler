const url = "https://www.googleapis.com/storage/v1/b";

async function getFiles(bucketName) {
    const response = fetch(`${url}/${bucketName}/o`);
    if (response.ok()) {
        return fetched.json();
    }

    throw new Error(`Failed to fetch resources: ${fetched.messageText}`);
}

