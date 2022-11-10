To reproduce the error:

- git clone https://github.com/aymeric75/ExpoProject.git

- cd ExpoProject

- npx expo install expo-image-picker

- npx expo install expo-image-manipulator

- npm install react-native-image-colors

- npx expo prebuild

- npx expo run:ios

- npx expo start


Then, once the app starts go to select an image on the left column (white background) and see the console error:

'TypeError: null is not an object (evaluating '_module.RNImageColors.getColors')'

If no error, do the same on the right column


