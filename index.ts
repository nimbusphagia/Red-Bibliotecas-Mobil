import { LogBox } from "react-native";

// nativewind registers ImageBackground on startup; we never render it
LogBox.ignoreLogs(["ImageBackground is deprecated"]);

// eslint-disable-next-line @typescript-eslint/no-require-imports -- must run after LogBox setup; imports are hoisted
require("expo-router/entry");
