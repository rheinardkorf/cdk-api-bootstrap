const AWS = require("aws-sdk");

const seedsStage = process.env.SEEDS_STAGE || "dev";
const documentClient = new AWS.DynamoDB.DocumentClient({
  convertEmptyValues: true,
});

const writeTypeFromAction = (action) => {
  if (action === "Delete") return "Key";
  return "Item";
};

const mutateTable = async (data, action) => {
    do {
        const requests = [];
        const batch = data.splice(0, 25);
        for (let i = 0; i < batch.length; i++) {
          requests.push({
            [action + "Request"]: {
              [writeTypeFromAction(action)]: batch[i]
            }
          });
        }
        const RequestItems = {}
        RequestItems[process.env.TABLE_NAME] = [...requests];
        await documentClient.batchWrite({RequestItems}).promise();
      }
      while (data.length > 0);
}

exports.handler = async function (event) {
  const putData = require(`/opt/${seedsStage}/put.json`);
  const deleteData = require(`/opt/${seedsStage}/delete.json`);

  // Teardown.
  console.log('Tearing down seed data...');
  try {
    await mutateTable(deleteData, 'Delete');  
  } catch (error) {
    console.log('Could not tear down.');
  }

  // Setup.
  if (event.RequestType !== 'Delete') {
    console.log('Seeding with seed data...');
    await mutateTable(putData, 'Put')
  }

  console.log('Seeding completed.')
  
  return;
};