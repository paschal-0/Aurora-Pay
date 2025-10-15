// src/screens/LoginScreen.tsx
import React, { useRef, useState, useEffect } from "react";
import {
  View,
  SafeAreaView,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
  Image,
} from "react-native";
import { useNavigation, CommonActions } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Button, AppText, Input, IconButton } from "../components"; // barrel exports
import { colors, spacing, radius } from "../components/tokens";

// IMPORT storage helpers
import { loginUser } from "../lib/storage";

// Define your app stack param list for typing (adjust as needed)
type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  Dashboard: undefined;
  // add other routes app has...
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Login">;

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();

  // animation
  const entrance = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(entrance, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [entrance]);

  const translateY = entrance.interpolate({ inputRange: [0, 1], outputRange: [18, 0] });
  const opacity = entrance.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  // form state
  const [identifier, setIdentifier] = useState(""); // email or phone
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  function validate() {
    if (!identifier.trim()) return "Please enter your phone or email.";
    if (!password.trim()) return "Please enter your password.";
    return null;
  }

  async function handleLogin() {
    const err = validate();
    if (err) {
      Alert.alert("Validation", err);
      return;
    }
    setLoading(true);
    try {
      // Use local demo auth
      await loginUser({ identifier: identifier.trim(), password });

      // On successful login: reset the navigation stack and go to Dashboard
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Dashboard" }],
        })
      );
    } catch (e: any) {
      // loginUser throws Errors with messages — show them
      const msg = e?.message ?? "Login failed. Try again.";
      Alert.alert("Login failed", msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <Animated.View
          style={[
            styles.topAccent,
            {
              opacity: entrance,
              transform: [
                {
                  translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [-14, 0] }),
                },
              ],
            },
          ]}
        />

        <Animated.View style={[styles.container, { transform: [{ translateY }], opacity }]}>
          <AppText variant="h1" style={styles.title}>
            Welcome back
          </AppText>

          {/* subtitle is explicitly white to read on the purple header */}
          <AppText variant="caption" style={styles.subtitle}>
            Sign in to continue to Aurora Pay
          </AppText>

          <View style={styles.form}>
            <Input
              placeholder="Phone number or email"
              value={identifier}
              onChangeText={setIdentifier}
              keyboardType="email-address"
              autoCapitalize="none"
              textContentType="username"
              returnKeyType="next"
            />

            <Input
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              textContentType="password"
              returnKeyType="done"
              right={
                <IconButton
                  accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                  onPress={() => setShowPassword((s) => !s)}
                  size={36}
                >
                  {/* quick eye glyph; replace with SVG icon if you have one */}
                  <AppText variant="button" style={{ color: colors.textSecondary }}>
                    {showPassword ? "🙈" : "👁️"}
                  </AppText>
                </IconButton>
              }
            />

            <TouchableOpacity style={styles.forgotRow} onPress={() => navigation.navigate("ForgotPassword")}>
              <AppText variant="caption" style={styles.forgotText}>
                Forgot password?
              </AppText>
            </TouchableOpacity>

            <Button title="Sign in" variant="primary" onPress={handleLogin} loading={loading} style={styles.cta} />

            <View style={styles.orRow}>
              <View style={styles.orLine} />
              <AppText variant="caption" style={styles.orText}>
                or continue with
              </AppText>
              <View style={styles.orLine} />
            </View>

            {/* Social / alternate sign-in row */}
            <View style={styles.socialRow}>
              {/* Google button: uses local image asset. Add src/assets/google.png */}
              <TouchableOpacity
                style={[styles.socialBtn, styles.googleBtn]}
                onPress={() => Alert.alert("Google Login", "Not wired in demo")}
                accessibilityRole="button"
                accessibilityLabel="Sign in with Google"
              >
                <View style={styles.googleLogo}>
                  {/* Place a Google logo PNG at src/assets/google.png */}
                  <Image source={require("../assets/google.png")} style={styles.googleLogoImage} resizeMode="contain" />
                </View>
                <AppText variant="button" style={styles.googleText}>
                  Continue with Google
                </AppText>
              </TouchableOpacity>

              {/* Another icon-based login (e.g., Passkey / Key) */}
              <TouchableOpacity
                style={[styles.socialBtn, styles.altBtn]}
                onPress={() => Alert.alert("Passkey Login", "Not wired in demo")}
                accessibilityRole="button"
                accessibilityLabel="Sign in with passkey"
              >
                <AppText variant="button" style={styles.altIcon}>
                  🔑
                </AppText>
              </TouchableOpacity>
            </View>

            <View style={styles.signupRow}>
              <AppText variant="caption" style={{ color: colors.textPrimary }}>
                Don’t have an account?
              </AppText>
              <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
                <AppText variant="caption" style={styles.signupLink}>
                  Sign up
                </AppText>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topAccent: {
    height: 140,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    zIndex: 0,
    opacity: 0.95,
  },
  container: {
    paddingHorizontal: spacing.md,
    marginTop: 56,
    zIndex: 2,
  },
  title: {
    color: colors.textPrimary,
    textAlign: "left",
    marginBottom: 6,
  },
  subtitle: {
    color: "#FFFFFF",
    marginBottom: spacing.lg,
  },
  form: {
    marginTop: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 6,
  },
  forgotRow: {
    alignItems: "flex-end",
    marginTop: 6,
  },
  forgotText: {
    color: colors.primary,
    textDecorationLine: "underline",
  },
  cta: {
    marginTop: spacing.md,
  },
  orRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.md,
    gap: 12,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  orText: {
    marginHorizontal: 12,
    color: colors.textSecondary,
    textAlign: "center",
  },
  socialRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.md,
    gap: 12,
  },
  socialBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
    flexDirection: "row",
  },
  googleBtn: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  googleLogo: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  // actual image inside the logo container
  googleLogoImage: {
    width: 20,
    height: 20,
  },
  googleText: {
    color: "#111111",
    flex: 1,
    textAlign: "left",
  },
  altBtn: {
    backgroundColor: colors.accent,
    width: 56,
    height: 44,
    paddingHorizontal: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  altIcon: {
    fontSize: 20,
    color: "#fff",
  },
  signupRow: {
    marginTop: spacing.md,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  signupLink: {
    color: colors.primary,
    marginLeft: 8,
    textDecorationLine: "underline",
  },
});
