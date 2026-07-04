// Main export file - import from here in all sites
export { app, auth, db, isFirebaseConfigured } from './config';
export {
  signUp,
  signIn,
  logOut,
  onAuthChange,
  getCurrentUser,
  bootstrapUserProfile,
  getReadableAuthError,
} from './auth';
export {
  saveUserData,
  getUserData,
  updateUserData,
  deleteUserData,
  saveAnimeLibrary,
  getAnimeLibrary,
  queryCollection,
} from './database';
