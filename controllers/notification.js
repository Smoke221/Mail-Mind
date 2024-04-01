
const { PubSub } = require('@google-cloud/pubsub');
const { google } = require('googleapis');
require('dotenv').config();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const PROJECT_ID = process.env.PROJECT_ID;
const TOPIC_NAME = process.env.TOPIC_NAME;
const SUBSCRIPTION_NAME = process.env.SUBSCRIPTION_NAME;

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
const pubsub = new PubSub()

async function createPushNotificationChannel() {
  try {
    const pushNotificationRequest = {
      userId: 'me',
      requestBody: {
        topicName: `projects/${PROJECT_ID}/topics/${TOPIC_NAME}`,
        labelIds: ['INBOX'], // Optional: Specify label IDs to filter notifications
      },
    };

    const response = await gmail.users.watch(pushNotificationRequest);
    console.log('Push notification channel set up successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error setting up push notification channel:', error);
    throw error;
  }
}

async function subscribeToPubSubTopic() {
  try {
    const subscriptionName = `projects/${PROJECT_ID}/subscriptions/${SUBSCRIPTION_NAME}`;
    const [subscription] = await pubsub.subscription(subscriptionName).get();

    if (subscription) {
      console.log('Subscription already exists:', subscriptionName);
      return subscription;
    } else {
      const [newSubscription] = await pubsub
        .topic(`projects/${PROJECT_ID}/topics/${TOPIC_NAME}`)
        .subscription(SUBSCRIPTION_NAME)
        .create();

      console.log('Subscription created:', newSubscription.name);
      return newSubscription;
    }
  } catch (error) {
    console.error('Error subscribing to Pub/Sub topic:', error);
    throw error;
  }
}

module.exports = {
  createPushNotificationChannel,
  subscribeToPubSubTopic,
};

