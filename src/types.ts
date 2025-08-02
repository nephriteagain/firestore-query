import admin from "firebase-admin"


export type DocumentData  =  admin.firestore.DocumentData;
/** Timestamp is a class */
export const Timestamp = admin.firestore.Timestamp;
export const GeoPoint = admin.firestore.GeoPoint;
export const DocumentReference = admin.firestore.DocumentReference