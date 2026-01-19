import React from 'react';
import {
  SignedIn,
  SignedOut,
  SignOutButton,
  SignInButton,
  UserButton,
} from '@clerk/clerk-react';
import toast from 'react-hot-toast';
function HomePage() {
  return (
    <div>
      <button
        className="btn btn-primary"
        onClick={() => toast.success('This is a success toast')}>
        click me
      </button>
      <SignedOut>
        <SignInButton mode="modal">
          <button>login</button>
        </SignInButton>
      </SignedOut>

      <SignedIn>
        <SignOutButton />
        <UserButton />
      </SignedIn>
    </div>
  );
}

export default HomePage;
