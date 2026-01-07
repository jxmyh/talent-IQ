import { Inngest } from 'inngest';
import { connectDB } from './db.js';
import User from '../models/User.js';
import { deleteStreamUser, upsertStreamUser } from './stream.js';

export const inngest = new Inngest({
  id: 'talent-iq-hxm',
});

const syncUser = inngest.createFunction(
  {
    id: 'sync-user',
  },
  {
    event: 'clerk/user.created',
  },
  async ({ event }) => {
    await connectDB();
    const { id, email_addresses, first_name, last_name, image_url, username } =
      event.data;
    // 防止中国用户没有first_name和last_name时使用username
    const name =
      first_name || last_name
        ? `${first_name || ''} ${last_name || ''}`
        : username;
    const newUser = {
      clerkId: id,
      email: email_addresses[0]?.email_address,
      name,
      profileImage: image_url,
    };
    await User.create(newUser);

    await upsertStreamUser({
      id: newUser.clerkId.toString(),
      name: newUser.name,
      image: newUser.profileImage,
    });
  }
);
const deleteUserFromDB = inngest.createFunction(
  {
    id: 'delete-user-from-db',
  },
  {
    event: 'clerk/user.deleted',
  },
  async ({ event }) => {
    await connectDB();
    const { id } = event.data;

    await User.deleteOne({ clerkId: id });

    await deleteStreamUser(id.toString());
  }
);

export const functions = [syncUser, deleteUserFromDB];
