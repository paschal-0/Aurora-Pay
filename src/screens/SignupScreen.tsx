// src/screens/SignupScreen.tsx
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
  ScrollView,
} from "react-native";
import { useNavigation, CommonActions } from "@react-navigation/native";

import { Input, Button, AppText, IconButton } from "../components";
import { colors, spacing, radius } from "../components/tokens";

// storage helper
import { signupUser } from "../lib/storage";

type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  Dashboard: undefined;
  Terms: undefined;
  Privacy: undefined;
  // add other routes app has...
};

type Nav = {
  navigate: (s: string) => void;
};

export default function SignupScreen() {
  const nav = useNavigation<Nav>();

  // entrance animation
  const entrance = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(entrance, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [entrance]);

  const translateY = entrance.interpolate({ inputRange: [0, 1], outputRange: [20, 0] });
  const opacity = entrance.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  // form state
  const [fullName, setFullName] = useState("");
  const [phoneOrEmail, setPhoneOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);

  // simple validations
  function validate() {
    if (!fullName.trim()) return "Please enter your full name.";
    if (!phoneOrEmail.trim()) return "Please enter your phone number or email.";
    if (!password.trim()) return "Please enter a password.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (password !== confirm) return "Passwords do not match.";
    if (!agree) return "You must accept the Terms & Privacy policy to continue.";
    return null;
  }

  async function handleSignup() {
    const err = validate();
    if (err) {
      Alert.alert("Validation", err);
      return;
    }
    setLoading(true);
    try {
      // Use local demo signup helper which stores the secret in SecureStore
      await signupUser({
        name: fullName.trim(),
        identifier: phoneOrEmail.trim(),
        password,
      });

      // After successful signup, reset navigation stack and go to Dashboard
      nav.dispatch?.(
        // @ts-ignore - navigation object shape in this project
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Dashboard" }],
        })
      );
    } catch (e: any) {
      const msg = e?.message ?? "Sign up failed. Please try again.";
      Alert.alert("Sign up failed", msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary ?? "#6F17FF"} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <Animated.View style={[styles.headerBackground, { opacity: entrance }]} />

          <Animated.View style={[styles.container, { transform: [{ translateY }], opacity }]}>
            <AppText variant="h1" style={styles.title}>
              Create account
            </AppText>
            <AppText variant="caption" style={styles.subtitle}>
              Join Aurora Pay — fast, secure, and simple.
            </AppText>

            <View style={styles.form}>
              <Input
                placeholder="Full name"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                returnKeyType="next"
              />

              <Input
                placeholder="Phone number or email"
                value={phoneOrEmail}
                onChangeText={setPhoneOrEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
              />

              <Input
                placeholder="Password (min 6 chars)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                returnKeyType="next"
                right={
                  <IconButton size={36} onPress={() => setShowPassword((s) => !s)} accessibilityLabel={showPassword ? "Hide password" : "Show password"}>
                    <AppText variant="button" style={{ color: colors.muted }}>
                      {showPassword ? "🙈" : "👁️"}
                    </AppText>
                  </IconButton>
                }
              />

              <Input
                placeholder="Confirm password"
                value={confirm}
                onChangeText={setConfirm}
                secureTextEntry={!showPassword}
                returnKeyType="done"
              />

              <View style={styles.refRow}>
                <Input
                  placeholder="Referral code (optional)"
                  value={""}
                  onChangeText={() => {}}
                  containerStyle={{ flex: 1, marginRight: spacing.sm }}
                />
              </View>

              <View style={styles.termsRow}>
                <TouchableOpacity
                  onPress={() => setAgree((a) => !a)}
                  style={[styles.checkbox, agree ? styles.checkboxOn : styles.checkboxOff]}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: agree }}
                >
                  {agree ? <AppText variant="button" style={{ color: "#fff" }}>✓</AppText> : null}
                </TouchableOpacity>

                <View style={{ flex: 1 }}>
                  <AppText variant="caption" style={styles.termsText}>
                    I agree to the{" "}
                    <AppText variant="caption" style={styles.linkText} onPress={() => nav.navigate("Terms")}>
                      Terms
                    </AppText>{" "}
                    and{" "}
                    <AppText variant="caption" style={styles.linkText} onPress={() => nav.navigate("Privacy")}>
                      Privacy Policy
                    </AppText>
                    .
                  </AppText>
                </View>
              </View>

              <Button title="Create account" variant="primary" onPress={handleSignup} loading={loading} style={styles.cta} />

              <View style={styles.loginRow}>
                <AppText variant="caption">Already have an account?</AppText>
                <TouchableOpacity onPress={() => nav.navigate("Login")}>
                  <AppText variant="caption" style={styles.loginLink}>
                    Sign in
                  </AppText>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background ?? "#F7F7FB",
  },
  headerBackground: {
    height: 160,
    backgroundColor: colors.primary ?? "#6F17FF",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    zIndex: 0,
    opacity: 0.96,
  },
  container: {
    paddingHorizontal: spacing.md,
    paddingTop: 56,
    zIndex: 2,
  },
  title: {
    color: colors.textPrimary ?? "#111111",
    marginBottom: 6,
  },
 subtitle: {
    color: "#FFFFFF",
    marginBottom: spacing.lg,
  },
  form: {
    marginTop: spacing.sm,
    backgroundColor: colors.surface ?? "#fff",
    borderRadius: radius.lg ?? 16,
    padding: spacing.md,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 6,
  },
  refRow: {
    flexDirection: "row",
    marginTop: spacing.sm,
  },
  termsRow: {
    marginTop: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  checkboxOn: {
    backgroundColor: colors.primary,
  },
  checkboxOff: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  termsText: {
    color: colors.textSecondary,
    flexWrap: "wrap",
  },
  linkText: {
    color: colors.primary,
    textDecorationLine: "underline",
  },
  cta: {
    marginTop: spacing.md,
  },
  loginRow: {
    marginTop: spacing.md,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  loginLink: {
    color: colors.primary,
    marginLeft: 8,
    textDecorationLine: "underline",
  },
});
