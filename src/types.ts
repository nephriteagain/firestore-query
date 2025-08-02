import admin from "firebase-admin"


export type DocumentData  =  admin.firestore.DocumentData;
export type WhereFilterOp = admin.firestore.WhereFilterOp;
/**classes */
export const Timestamp = admin.firestore.Timestamp;
export const GeoPoint = admin.firestore.GeoPoint;
export const DocumentReference = admin.firestore.DocumentReference