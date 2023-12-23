const fs = require('fs');
const { google } = require('googleapis');
var collection = require('../config/collection')
const apikeys = require('./connect.json');
const { promises } = require('dns');
const { resolve } = require('path');
const { reject } = require('promise');
const { file } = require('googleapis/build/src/apis/file');
const SCOPE = ['https://www.googleapis.com/auth/drive'];
var data = {

}

module.exports.call = async function (data) {
    return new Promise((outerResolve, outerReject) => {
        // A Function that can provide access to Google Drive API
        async function authorize() {
            const jwtClient = new google.auth.JWT(
                apikeys.client_email,
                null,
                apikeys.private_key,
                SCOPE
            );

            await jwtClient.authorize();
            return jwtClient;
        }

        // A Function that will upload the desired file to Google Drive folder
        async function uploadFile(authClient) {
            return new Promise((innerResolve, innerReject) => {
                const drive = google.drive({ version: 'v3', auth: authClient });

                var fileMetaData = {
                    name: data.name,
                    parents: [collection.GDRIVE_FOLDER]
                };

                drive.files.create({
                    resource: fileMetaData,
                    media: {
                        body: fs.createReadStream('./' + data.name),
                        mimeType: data.mimetype,
                    },
                    fields: 'id',
                }, function (error, file) {
                    if (error) {
                        return innerReject(error);
                    }
                    innerResolve(file);
                });
            });
        }

        // Chain the promises and handle the result
        authorize()
            .then(uploadFile)
            .then(file => {
                // You can use 'file' here or pass it to the outer resolve if needed
                outerResolve(file);
            })
            .catch(error => {
                // Handle errors
                // console.error("Error:", error);
                outerReject(error);
            });
    });


}



