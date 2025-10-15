// src/screens/DashboardScreen.tsx
import React, { useCallback, useEffect, useRef } from "react";
import {
  View,
  SafeAreaView,
  StyleSheet,
  FlatList,
  RefreshControl,
  Animated,
  Easing,
  TouchableOpacity,
  Dimensions,
  Platform,
  StatusBar,
} from "react-native";
import { useNavigation, useIsFocused } from "@react-navigation/native";

import {
  TopHeader,
  BalanceCard,
  TransactionListItem,
  BottomNav,
  AppText,
} from "../components";
import { colors, spacing, radius } from "../components/tokens";

import { useApp } from "../context/AppContext";

const { width } = Dimensions.get("window");

type Nav = {
  navigate: (to: string, params?: any) => void;
};

type LocalTx = {
  id: string;
  title: string;
  subtitle?: string;
  amount: string;
  status?: "sent" | "received" | "pending" | "failed";
  date?: string;
  avatarUri?: string;
};

export default function DashboardScreen() {
  const nav = useNavigation<Nav>();
  const isFocused = useIsFocused();

  // use app context
  const { state, refresh, getTransactions } = useApp();
  // state.loading used as refreshing indicator
  const refreshing = state.loading ?? false;
  const balance = state.balance ?? 0;
  const storageTxs = state.transactions ?? [];

  // animation
  const balanceAnim = useRef(new Animated.Value(0)).current;
  const actionsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(120, [
      Animated.timing(balanceAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(actionsAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [balanceAnim, actionsAnim]);

  // redirect to Login if no user (context)
  useEffect(() => {
    if (!state.user) {
      // If no user, navigate to Login screen
      nav.navigate("Login");
    }
    // otherwise, we rely on `isFocused` effect to refresh data
  }, [state.user, nav]);

  // refresh when screen is focused (ensures updates after transactions)
  useEffect(() => {
    if (isFocused) {
      // call refresh from context
      refresh().catch((e) => {
        // non-fatal - show in console for demo
        console.warn("Dashboard refresh error:", e);
      });
    }
  }, [isFocused, refresh]);

  const onRefresh = useCallback(async () => {
    try {
      await refresh();
    } catch (e) {
      console.warn("Refresh failed:", e);
    }
  }, [refresh]);

  // quick actions for the grid
  const actions = [
    { key: "send", label: "Send", onPress: () => nav.navigate("Transaction") },
    { key: "receive", label: "Receive", onPress: () => nav.navigate("Receive") },
    { key: "topup", label: "Top up", onPress: () => nav.navigate("TopUp") },
    { key: "pay", label: "Pay", onPress: () => nav.navigate("PayMerchant") },
  ];

  // sample sparkline data
  const sparkValues = [30, 45, 28, 70, 40, 65, 50];
  const maxVal = Math.max(...sparkValues);

  // map storage transactions to LocalTx used by list item
  const mappedTxs: LocalTx[] = storageTxs.slice(0, 20).map((t) => ({
    id: t.id,
    title: t.counterparty ?? t.type,
    subtitle: t.note ?? "",
    amount: t.type === "send" ? `-${Number(t.amount).toFixed(2)}` : `+${Number(t.amount).toFixed(2)}`,
    status: (t.status === "completed" ? (t.type === "send" ? "sent" : "received") : (t.status as any)) as LocalTx["status"],
    date: new Date(t.createdAt).toLocaleDateString(),
    avatarUri: (t as any).avatarUri ?? undefined,
  }));

  const renderTx = ({ item }: { item: LocalTx }) => (
    <TransactionListItem
      testID={`tx-${item.id}`}
      title={item.title}
      subtitle={item.subtitle}
      amount={item.amount}
      status={item.status}
      avatarUri={item.avatarUri}
      onPress={() => nav.navigate("TransactionDetail", { id: item.id })}
    />
  );

  // small top spacer amount — use StatusBar.currentHeight on Android for safe offset
  const topSpacer = Platform.OS === "android" ? (StatusBar.currentHeight ?? 12) : 12;

  return (
    <SafeAreaView style={styles.root}>
      <View style={{ paddingTop: topSpacer, backgroundColor: "transparent" }}>
        <TopHeader
          title="Wallet"
          right={
            <TouchableOpacity onPress={() => nav.navigate("Notifications")} accessibilityRole="button">
              <AppText variant="button" style={{ color: colors.surface }}>
                🔔
              </AppText>
            </TouchableOpacity>
          }
        />
      </View>

      <Animated.ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.balanceWrap,
            {
              opacity: balanceAnim,
              transform: [
                {
                  translateY: balanceAnim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }),
                },
              ],
            },
          ]}
        >
          <BalanceCard
            testID="balancecard"
            available={balance}
            pending={0}
            onAction={(k) => {
              if (k === "send") nav.navigate("Transaction");
              else if (k === "receive") nav.navigate("Receive");
              else if (k === "topup") nav.navigate("TopUp");
            }}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.actionsGrid,
            {
              opacity: actionsAnim,
              transform: [
                {
                  translateY: actionsAnim.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }),
                },
              ],
            },
          ]}
        >
          {actions.map((a) => (
            <TouchableOpacity key={a.key} style={styles.actionItem} onPress={a.onPress} accessibilityRole="button">
              <View style={styles.actionIconWrap}>
                <AppText variant="button" style={{ color: colors.primary }}>
                  {a.key === "send" ? "➡️" : a.key === "receive" ? "⬅️" : a.key === "topup" ? "➕" : "💳"}
                </AppText>
              </View>
              <AppText variant="caption" style={styles.actionLabel}>
                {a.label}
              </AppText>
            </TouchableOpacity>
          ))}
        </Animated.View>

        <View style={styles.analytics}>
          <View style={styles.analyticsLeft}>
            <AppText variant="h2">Spending</AppText>
            <AppText variant="caption" style={{ marginTop: 6 }}>
              Last 7 days
            </AppText>

            <View style={styles.sparkline}>
              {sparkValues.map((v, i) => {
                const h = (v / maxVal) * 40 + 6;
                return <View key={i} style={[styles.sparkBar, { height: h }]} />;
              })}
            </View>
          </View>

          <View style={styles.analyticsRight}>
            <AppText variant="caption" style={{ color: colors.muted }}>
              Categories
            </AppText>
            <View style={{ height: 8 }} />
            <View style={styles.categoryRow}>
              <View style={[styles.pill, { backgroundColor: colors.primary }]} />
              <AppText variant="caption">Transport</AppText>
            </View>
            <View style={styles.categoryRow}>
              <View style={[styles.pill, { backgroundColor: colors.accent }]} />
              <AppText variant="caption">Food</AppText>
            </View>
            <View style={styles.categoryRow}>
              <View style={[styles.pill, { backgroundColor: colors.success }]} />
              <AppText variant="caption">Bills</AppText>
            </View>
          </View>
        </View>

        <View style={styles.txHeader}>
          <AppText variant="h2">Recent activity</AppText>
          <TouchableOpacity onPress={() => nav.navigate("History")} accessibilityRole="button">
            <AppText variant="caption" style={{ color: colors.primary }}>
              See all
            </AppText>
          </TouchableOpacity>
        </View>

        <FlatList
          data={mappedTxs}
          keyExtractor={(i) => i.id}
          renderItem={renderTx}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      </Animated.ScrollView>

      <BottomNav
        items={[
          { key: "home", label: "Home" },
          { key: "wallet", label: "Wallet" },
          { key: "scan", label: "Scan" },
          { key: "activity", label: "Activity" },
          { key: "profile", label: "Profile" },
        ]}
        activeKey="home"
        onNavigate={(k) => {
          if (k === "profile") nav.navigate("Profile");
          else if (k === "wallet") nav.navigate("Wallet");
          else if (k === "scan") nav.navigate("Scanner");
          else if (k === "activity") nav.navigate("History");
          else nav.navigate("Dashboard");
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: spacing.md,
    paddingBottom: 8 + 80, // leave room for bottom nav
  },
  balanceWrap: {
    marginTop: spacing.sm,
  },
  actionsGrid: {
    marginTop: spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  actionItem: {
    alignItems: "center",
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 6,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(15,15,15,0.03)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  actionLabel: {
    color: colors.textPrimary,
  },
  analytics: {
    marginTop: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  analyticsLeft: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginRight: 8,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  analyticsRight: {
    width: width * 0.34,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  sparkline: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 48,
    marginTop: 12,
    gap: 6,
  },
  sparkBar: {
    width: 8,
    marginHorizontal: 4,
    backgroundColor: colors.primary,
    borderRadius: 6,
    opacity: 0.95,
  },
  pill: {
    width: 10,
    height: 10,
    borderRadius: 6,
    marginRight: 8,
  },
  txHeader: {
    marginTop: spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
});
