import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createUser, updateUser, deleteUser } from '../../../../lib/actions/user.actions';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!CLERK_WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local');
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(CLERK_WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occurred during verification', {
      status: 400
    });
  }

  // Handle the webhook event
  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses, image_url, username, first_name, last_name } = evt.data;
    
    // Safely structure the username if undefined or null
    let dbUsername = username;
    if (!dbUsername) {
      dbUsername = `${first_name || ''}${last_name || ''}`.toLowerCase().replace(/[^a-z0-9]/g, '');
    }
    if (!dbUsername) {
      dbUsername = `user_${id.substring(0, 8)}`;
    }

    const user = {
      clerkId: id,
      email: email_addresses[0]?.email_address || "",
      username: dbUsername,
      photo: image_url || "",
      firstName: first_name || "",
      lastName: last_name || "",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const newUser = await createUser(user);
    return NextResponse.json({ message: 'OK', user: newUser });
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, image_url, username, first_name, last_name } = evt.data;
    
    let dbUsername = username;
    if (!dbUsername) {
      dbUsername = `${first_name || ''}${last_name || ''}`.toLowerCase().replace(/[^a-z0-9]/g, '');
    }
    if (!dbUsername) {
      dbUsername = `user_${id.substring(0, 8)}`;
    }

    const user = {
      email: email_addresses[0]?.email_address || "",
      username: dbUsername,
      photo: image_url || "",
      firstName: first_name || "",
      lastName: last_name || "",
      updatedAt: new Date()
    };

    const updatedUser = await updateUser(id, user);
    return NextResponse.json({ message: 'OK', user: updatedUser });
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;
    const deletedUser = await deleteUser(id!);
    return NextResponse.json({ message: 'OK', user: deletedUser });
  }

  return new Response('', { status: 200 });
}
