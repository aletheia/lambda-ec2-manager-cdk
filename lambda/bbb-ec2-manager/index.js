const AWS = require('aws-sdk');
const {InstanceIds} = require('./config.json');
const ec2 = new AWS.EC2();

function parseCWevent(event) {
  const eventDate = new Date(event.time);
  const h = eventDate.getHours();
  // const m = eventDate.getMinutes();
  const d = eventDate.getDay();


  let op;

  if (d !== 0) {
    if ((h > 6) && (h < 9)) {
      op = 'start';
    } else if ((h > 16) && (h < 18)) {
      op = 'stop';
    }
  }
  return op;
}

exports.handler = async (event) => {
  const EVENT = {
    SCHEDULED: 'scheduled',
    API: 'api',
  };

  console.log('Received:\n' + JSON.stringify(event));

  let eventType;
  if ((event['source']) && (event.source === 'aws.events')) {
    eventType = EVENT.SCHEDULED;
  } else if ((event['httpMethod']) && (event.httpMethod === 'GET')) {
    eventType = EVENT.API;
  }

  console.log('Event Type: ' + eventType);

  let operation;
  if (eventType === EVENT.SCHEDULED) {
    // we've received a cloudformationevent
    operation = parseCWevent(event);
  } else if (eventType === EVENT.API) {
    // it is a lambda proxy event
    operation = event.pathParameters.desiredState;
  }

  console.log('Operation requested: '+operation+' on instances '+InstanceIds);

  const params = {
    InstanceIds,
  };

  let message;
  switch (operation) {
    case 'start':
      const data = await ec2.startInstances(params).promise();
      const instances = data.StartingInstances;
      message = JSON.stringify(instances);
      break;
    case 'stop':
      await ec2.stopInstances(params).promise();
      message = 'Instance stopping.';
      break;
    default:
      throw new Error('Unknown operation ' + operation);
  }

  console.log('Operation completed. Sending message '+message);

  let response;
  if (eventType === EVENT.SCHEDULED) {
    response = message;
  } else if (eventType === EVENT.API) {
    response = {
      statusCode: 200,
      body: message,
    };
  }

  return response;
};
