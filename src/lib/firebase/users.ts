"use client";

import { db } from "@/lib/firebase";
import { AuthUser, ServerTimestamp } from "@/lib/firebase/types";
import type { User } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
  type CollectionReference,
  type DocumentReference,
} from "firebase/firestore";

function usersCollection(): CollectionReference<AuthUser> {
  return collection(db, "users") as CollectionReference<AuthUser>;
}

function userDocRef(uid: string): DocumentReference<AuthUser> {
  return doc(usersCollection(), uid) as DocumentReference<AuthUser>;
}

export const getUser = async (uid: string): Promise<AuthUser | null> => {
  const ref = userDocRef(uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return null;
  }

  return snap.data();
};

export async function createUser(user: User): Promise<void> {
  const ref = userDocRef(user.uid);
  const data = {
    uid: user.uid,
    email: user.email ?? null,
    displayName: user.displayName ?? null,
    photoURL: user.photoURL ?? null,
    providerIds: user.providerData.map((p) => p.providerId),
    createdAt: serverTimestamp() as ServerTimestamp,
    updatedAt: serverTimestamp() as ServerTimestamp,
    lastLogin: serverTimestamp() as ServerTimestamp,
    role: "user",
    isActive: true,
  };
  await setDoc(ref, data as AuthUser);
}

export async function updateUser(user: User): Promise<void> {
  const ref = userDocRef(user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    // For backwards compatibility, create user if doesn't exist
    await createUser(user);
    return;
  }

  await updateDoc(ref, {
    lastLogin: serverTimestamp(),
  });
}

export function getUserDocRef(uid: string): DocumentReference<AuthUser> {
  return userDocRef(uid);
}

export function activateUser(
  uid: string,
  id: string,
  serialNumber: string,
): Promise<void> {
  const ref = userDocRef(uid);
  const ntag = {
    serialNumber: `${id}:${serialNumber}`,
    scanTime: new Date().toISOString(),
    metadata: { id },
    type: "",
  };
  return updateDoc(ref, {
    isActivated: true,
    ntag,
  });
}

export const deactivateUser = async (uid: string): Promise<void> => {
  const ref = userDocRef(uid);
  await updateDoc(ref, {
    isActivated: false,
  });
};
