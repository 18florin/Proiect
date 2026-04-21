import { useEffect, useState } from "react";
import {
  Text,
  View,
  Button,
  Alert,
  TextInput,
  StyleSheet,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { io } from "socket.io-client";
import axios from "axios";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const socket = io("http://192.168.0.37:5000");

export default function HomeScreen() {
  const router = useRouter();

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // 🔐 login fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 🔥 SOCKET EVENTS
  useEffect(() => {
    socket.on("connect", () => {
      console.log("📱 Mobile connected:", socket.id);
    });

    socket.on("approval-needed", (data: any) => {
  Alert.alert(
    "Reservation Request",
    `Approve reservation for ${data.vehicle}?`,
    [
      {
        text: "Reject",
        onPress: () =>
          socket.emit("approval-response", {
            sessionId,
            approved: false,
          }),
      },
      {
        text: "Approve",
        onPress: () =>
          socket.emit("approval-response", {
            sessionId,
            approved: true,
            payload: data.payload,
          }),
      },
    ]
  );
});

    return () => {
      socket.off("connect");
      socket.off("approval-needed");
    };
  }, [sessionId]);

  // 🔍 SCAN QR
  const handleScan = ({ data }: { data: string }) => {
    setScanned(true);
    setSessionId(data);

    socket.emit("join-session", data);

    console.log("📱 Joined session:", data);
  };

  if (!permission) return <Text>Loading camera...</Text>;

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text>No camera permission</Text>
        <Button title="Allow Camera" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {!scanned ? (
        // 📷 CAMERA SCREEN
        <CameraView
          style={{ flex: 1 }}
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={handleScan}
        />
      ) : (
        // 🔐 LOGIN SCREEN
        <View style={styles.container}>
          <Text style={styles.title}>Login from phone</Text>

          <TextInput
            placeholder="Email"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />

          <TextInput
            placeholder="Password"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />

          <Button
            title="Login"
            onPress={async () => {
              if (!sessionId) return;

              if (!email || !password) {
                Alert.alert("Error", "Please fill all fields");
                return;
              }

              try {
                const res = await axios.post(
                  "http://192.168.0.37:5000/api/auth/login",
                  {
                    email,
                    password,
                  }
                );

                if (res.data.success) {
  // 🔥 notificăm desktop
  socket.emit("mobile-login", sessionId, {
  user: res.data.user,
  token: res.data.token,
});

  // 🔥 navigăm la profil (CORECT)
  router.replace("/(tabs)/profile" as any);
} else {
                  Alert.alert("Error", res.data.message);
                }
              } catch (err) {
                Alert.alert("Error", "Invalid credentials");
              }
            }}
          />

          <View style={{ marginTop: 10 }}>
            <Button
              title="Scan again"
              onPress={() => {
                setScanned(false);
                setSessionId(null);
                setEmail("");
                setPassword("");
              }}
            />
          </View>
        </View>
      )}
    </View>
  );
}

// 🎨 STYLES
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "#111827",
  },
  input: {
    backgroundColor: "#F9FAFB",
    color: "#111827",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 15,
    padding: 14,
    borderRadius: 10,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});