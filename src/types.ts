import { firestore } from "firebase-admin"

export type DocumentData  =  firestore.DocumentData;
export type WhereFilterOp = firestore.WhereFilterOp;
/**classes */
export const Timestamp = firestore.Timestamp;
export const GeoPoint = firestore.GeoPoint;
export const DocumentReference = firestore.DocumentReference