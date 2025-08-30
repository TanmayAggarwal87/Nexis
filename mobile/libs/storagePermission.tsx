import * as Permissions from 'expo-permissions';
import { Platform } from 'react-native';

export const useStoragePermissions = () => {
  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      const { status } = await Permissions.askAsync(Permissions.MEDIA_LIBRARY);
      return status === 'granted';
    }
    return true;
  };

  return { requestStoragePermission };
};