// src/screens/SplashScreen.tsx
import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  Image,
  SafeAreaView,
  StatusBar,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import AppText from "../components/atoms/AppText";
import Button from "../components/atoms/Button";
import { colors, spacing } from "../components/tokens";
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");
const AnimatedImage = Animated.createAnimatedComponent(Image);

type Nav = {
  navigate: (s: string) => void;
};

export default function SplashScreen() {
  const nav = useNavigation<Nav>();

  // Animated values
  const fade = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(28)).current;
  const scale = useRef(new Animated.Value(0.94)).current;
  const bob = useRef(new Animated.Value(0)).current; // subtle up/down
  const rotate = useRef(new Animated.Value(0)).current; // slow wobble
  const ringScale = useRef(new Animated.Value(0.9)).current; // pulsing ring behind logo
  const titleFade = useRef(new Animated.Value(0)).current;
  const titleTranslate = useRef(new Animated.Value(8)).current;
  const taglineFade = useRef(new Animated.Value(0)).current;
  const ctaTranslate = useRef(new Animated.Value(12)).current;
  const ctaPulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance: fade + translate + spring scale (logo)
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 520, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 620, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 7, useNativeDriver: true }),
    ]).start();

    // Logo bobbing (slow)
    Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: -8, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();

    // Slow gentle wobble (rotate - small angle)
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotate, { toValue: 1, duration: 3000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(rotate, { toValue: -1, duration: 3000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();

    // Ring pulse behind logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(ringScale, { toValue: 1.06, duration: 1200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(ringScale, { toValue: 0.94, duration: 1200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    ).start();

    // Staggered reveal for title/tagline/cta
    Animated.sequence([
      Animated.delay(360),
      Animated.parallel([
        Animated.timing(titleFade, { toValue: 1, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(titleTranslate, { toValue: 0, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(taglineFade, { toValue: 1, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(ctaTranslate, { toValue: 0, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
    ]).start();

    // CTA pulse (gentle)
    Animated.loop(
      Animated.sequence([
        Animated.timing(ctaPulse, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(ctaPulse, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();

    // Auto navigate after short delay (optional)
    const t = setTimeout(() => nav.navigate("Login"), 10600);
    return () => clearTimeout(t);
  }, [fade, translateY, scale, bob, rotate, ringScale, titleFade, titleTranslate, taglineFade, ctaTranslate, ctaPulse, nav]);

  // Compose transforms
  const logoTransform = {
    transform: [
      { translateY: Animated.add(translateY, bob) as any },
      {
        rotate: rotate.interpolate({
          inputRange: [-1, 1],
          outputRange: ["-3deg", "3deg"],
        }) as any,
      },
      { scale },
    ],
  };

  const ringTransform = {
   transform: [{ scale: ringScale }],
  };

  const titleStyle = {
    opacity: titleFade,
    transform: [{ translateY: titleTranslate }],
  };

  const taglineStyle = {
    opacity: taglineFade,
  };

  const ctaStyle = {
    transform: [{ translateY: ctaTranslate }, { scale: ctaPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.03] }) as any }],
  };

  // Location or path to logo
  const logoSource = require("../assets/logo (1).png");

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <View style={styles.bgLayer}>
        <Animated.View style={[styles.floatingCircle, styles.circleA, { transform: [{ translateY: Animated.add(bob, -6) as any }, { translateX: -18 }] }]} />
        <Animated.View style={[styles.floatingCircle, styles.circleB, { transform: [{ translateY: Animated.add(bob, 6) as any }, { translateX: 28 }] }]} />
        <Animated.View style={[styles.floatingBlur, styles.blurA]} />
      </View>

      <Animated.View style={[styles.brandWrap, { opacity: fade }]}>
        <View style={{ alignItems: "center" }}>
          {/* pulsing ring behind logo */}
          <Animated.View style={[styles.ring, ringTransform]} pointerEvents="none" />
          {/* logo */}
          <Animated.View style={[styles.logoBox, logoTransform]}>
            <AnimatedImage source={logoSource} resizeMode="contain" style={styles.logoImage} accessible accessibilityLabel="Aurora Pay logo" />
          </Animated.View>
        </View>

        <Animated.View style={[styles.titleWrap, titleStyle]}>
          <AppText variant="h1" style={styles.title}>
            Aurora Pay
          </AppText>
        </Animated.View>

        <Animated.View style={[styles.tagWrap, taglineStyle]}>
          <AppText variant="caption" style={styles.tagline}>
            Fast. Secure. Everyday.
          </AppText>
        </Animated.View>

        <Animated.View style={[{ marginTop: spacing.lg }, ctaStyle]}>
          <Button title="Get Started" variant="primary" onPress={() => nav.navigate("Signup")} testID="splash-getstarted" />
        </Animated.View>

        <TouchableOpacity onPress={() => nav.navigate("Login")} style={styles.signInLink} accessibilityRole="button">
          <AppText variant="caption" style={styles.signInText}>
            Already have an account? Sign in
          </AppText>
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.bottomDecoration} pointerEvents="none" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  // background layered shapes
  bgLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  floatingCircle: {
    position: "absolute",
    width: width * 0.42,
    height: width * 0.42,
    borderRadius: (width * 0.42) / 2,
    opacity: 0.12,
    backgroundColor: "#00C2FF",
  },
  circleA: {
    top: height * 0.06,
    left: -width * 0.12,
    backgroundColor: "#00C2FF",
  },
  circleB: {
    top: height * 0.12,
    right: -width * 0.14,
    backgroundColor: "#BB6FFF",
  },
  floatingBlur: {
    position: "absolute",
    width: width * 0.9,
    height: height * 0.55,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.03)",
    top: height * 0.05,
  },
  blurA: {
    transform: [{ rotate: "18deg" }],
  },

  brandWrap: {
    width: "90%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
    zIndex: 2,
    marginTop: -20,
  },

  // ring behind logo (subtle glow)
  ring: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255,255,255,0.06)",
    shadowColor: "#fff",
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 6,
  },

  logoBox: {
    width: 120,
    height: 120,
    borderRadius: 120 / 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 10,
    backgroundColor: "transparent",
  },
  logoImage: {
    width: 110,
    height: 110,
  },

  titleWrap: {
    marginTop: 6,
  },
  title: {
    color: "#fff",
    letterSpacing: 0.2,
    textAlign: "center",
  },
  tagWrap: {
    marginTop: 6,
  },
  tagline: {
    color: "rgba(255,255,255,0.92)",
    textAlign: "center",
  },

  signInLink: {
    marginTop: spacing.md,
  },
  signInText: {
    color: "rgba(255,255,255,0.9)",
    textDecorationLine: "underline",
  },

  bottomDecoration: {
    position: "absolute",
    bottom: -60,
    left: -50,
    right: -50,
    height: 180,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
  },
});
