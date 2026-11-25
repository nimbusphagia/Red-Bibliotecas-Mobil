import { LogBox } from "react-native";

// nativewind registers ImageBackground on startup; we never render it
LogBox.ignoreLogs(["ImageBackground is deprecated"]);

require("expo-router/entry");
