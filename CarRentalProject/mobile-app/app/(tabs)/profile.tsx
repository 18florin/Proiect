import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_URL = "http://192.168.0.37:5000"; // pune IP-ul tău real

type Reservation = {
  _id: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  reservationStatus: string;
  vehicleTitle?: string;
};

type UserType = {
  _id?: string;
  id?: string;
  userName?: string;
  email?: string;
};

export default function ProfileScreen() {
  const [user, setUser] = useState<UserType | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [reservationList, setReservationList] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserAndReservations();
  }, []);

  async function loadUserAndReservations() {
    try {
      setIsLoading(true);

      const storedUser = await AsyncStorage.getItem("user");
      const storedToken = await AsyncStorage.getItem("token");

      if (!storedUser || !storedToken) {
        setIsLoading(false);
        return;
      }

      const parsedUser: UserType = JSON.parse(storedUser);
      setUser(parsedUser);
      setToken(storedToken);

      const userId = parsedUser._id || parsedUser.id;

      if (!userId) {
        setIsLoading(false);
        return;
      }

      const res = await axios.get(
        `${API_URL}/api/shop/reservation/list/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        },
      );

      setReservationList(res.data?.data || []);
    } catch (error) {
      console.log("Reservation load error:", error);
      Alert.alert("Error", "Could not load reservations");
    } finally {
      setIsLoading(false);
    }
  }

  function getStatusColor(status: string) {
    if (status === "confirmed") return "#16a34a";
    if (status === "pending") return "#eab308";
    if (status === "rejected") return "#dc2626";
    if (status === "cancelled") return "#6b7280";
    return "#2563eb";
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading reservations...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>My Reservations</Text>

      {user && (
        <View style={styles.userBox}>
          <Text style={styles.userName}>{user.userName}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>
      )}

      <View style={styles.tableHeader}>
        <Text style={[styles.headerCell, { flex: 2 }]}>ID</Text>
        <Text style={[styles.headerCell, { flex: 2 }]}>Date</Text>
        <Text style={[styles.headerCell, { flex: 1.4 }]}>Status</Text>
        <Text style={[styles.headerCell, { flex: 1.2 }]}>Total</Text>
      </View>

      {reservationList.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text>No reservations yet</Text>
        </View>
      ) : (
        reservationList.map((r) => (
          <View key={r._id} style={styles.row}>
            <Text style={[styles.cell, { flex: 2 }]}>
              {r._id.slice(-8)}
            </Text>

            <Text style={[styles.cell, { flex: 2 }]}>
              {new Date(r.startDate).toLocaleDateString()}
            </Text>

            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(r.reservationStatus) }]}>
              <Text style={styles.statusText}>{r.reservationStatus}</Text>
            </View>

            <Text style={[styles.cell, { flex: 1.2, fontWeight: "700" }]}>
              ${r.totalAmount}
            </Text>
          </View>
        ))
      )}

      <TouchableOpacity style={styles.refreshBtn} onPress={loadUserAndReservations}>
        <Text style={styles.refreshBtnText}>Refresh</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 14,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 14,
    color: "#111827",
  },
  userBox: {
    marginBottom: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    backgroundColor: "#f9fafb",
  },
  userName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  userEmail: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#d1d5db",
    paddingBottom: 8,
    marginBottom: 8,
  },
  headerCell: {
    fontWeight: "700",
    fontSize: 13,
    color: "#374151",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#f3f4f6",
    paddingVertical: 12,
  },
  cell: {
    fontSize: 12,
    color: "#111827",
  },
  statusBadge: {
    flex: 1.4,
    paddingVertical: 4,
    borderRadius: 999,
    alignItems: "center",
    marginRight: 8,
  },
  statusText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  emptyBox: {
    paddingVertical: 20,
    alignItems: "center",
  },
  refreshBtn: {
    marginTop: 20,
    backgroundColor: "#0f172a",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  refreshBtnText: {
    color: "#fff",
    fontWeight: "700",
  },
});