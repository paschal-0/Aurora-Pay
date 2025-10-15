// App.tsx
import React from "react";
import "react-native-get-random-values";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AppProvider } from "./src/context/AppContext";
import SplashScreen from "./src/screens/SplashScreen";
import LoginScreen from "./src/screens/LoginScreen"; // implement or placeholder
import SignupScreen from "./src/screens/SignupScreen"; // implement or placeholder
import DashboardScreen from "./src/screens/DashboardScreen";
import TransactionScreen from "./src/screens/TransactionScreen";
import TransactionHistoryScreen from "./src/screens/TransactionHistoryScreen";
import TopUpScreen from "./src/screens/TopUpScreen";




const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AppProvider>
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Transaction" component={TransactionScreen} />
        <Stack.Screen name="History" component={TransactionHistoryScreen} />
        <Stack.Screen name="TopUp" component={TopUpScreen} />
      </Stack.Navigator>
    </NavigationContainer>
    </AppProvider>
  );
}
