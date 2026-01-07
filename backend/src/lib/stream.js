import { StreamChat } from 'stream-chat';
import { ENV } from './env';

const apiKey = ENV.STREAM_API_KEY;

const apiSecret = ENV.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
  console.error('Stream API key and secret are missing');
  throw new Error('Stream API credentials are required');
}
export const chatClient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreamUser = async (userData) => {
  if (!userData || !userData.id) {
    throw new Error('userData with id is required');
  }

  try {
    await chatClient.upsertUser(userData);

    console.log('Stream user upserted successfully:', userData.id);
    return { success: true };
  } catch (error) {
    console.error('Error upserting Stream user:', error);
    throw error;
  }
};
export const deleteStreamUser = async (userId) => {
  try {
    await chatClient.deleteUser(userId);
    console.log('Stream user deleted successfully:', userId);
  } catch (error) {
    console.error('Error deleting Stream user:', error);
  }
};

// todo: add another method to generate a token for a user
