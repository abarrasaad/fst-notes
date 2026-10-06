/**
 * FST Notes — consultation des notes (Faculté des Sciences et Techniques de Tanger)
 *
 * @format
 */
import React, { useEffect, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as api from './src/api';

// Lien de configuration envoyé par la scolarité : fstnotes://config?server=http://...
async function handleLink(url: string | null | undefined) {
  const match = url && /^fstnotes:\/\/config\?server=(.+)$/.exec(url);
  if (match) {
    await api.setServer(decodeURIComponent(match[1]));
    Alert.alert('Configuration', 'Serveur mis à jour.');
  }
}

export default function App() {
  const [user, setUser] = useState<api.User | null>(null);

  useEffect(() => {
    api.currentUser().then(setUser);
    Linking.getInitialURL().then(handleLink);
    const sub = Linking.addEventListener('url', ({ url }) => handleLink(url));
    return () => sub.remove();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.fill}>
        {user ? (
          <GradesScreen user={user} onLogout={async () => { await api.logout(); setUser(null); }} />
        ) : (
          <LoginScreen onLogin={setUser} />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function LoginScreen({ onLogin }: { onLogin: (u: api.User) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [server, setServer] = useState('');

  useEffect(() => { api.getServer().then(setServer); }, []);

  const submit = async () => {
    try {
      await api.setServer(server.trim());
      onLogin(await api.login(email.trim(), password));
    } catch (e: any) {
      Alert.alert('Connexion impossible', e.message || 'Serveur injoignable');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.login} keyboardShouldPersistTaps="handled">
      <Text style={styles.brand}>FST Notes</Text>
      <Text style={styles.subtitle}>Faculté des Sciences et Techniques de Tanger</Text>
      <View style={styles.card}>
        <Text style={styles.label}>E-mail</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <Text style={styles.label}>Mot de passe</Text>
        <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />
        <Text style={styles.label}>Serveur</Text>
        <TextInput style={styles.input} value={server} onChangeText={setServer} autoCapitalize="none" />
        <Pressable style={styles.button} onPress={submit}>
          <Text style={styles.buttonText}>Se connecter</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function GradesScreen({ user, onLogout }: { user: api.User; onLogout: () => void }) {
  const [grades, setGrades] = useState<api.Grade[]>([]);

  useEffect(() => {
    api.getGrades(user.id).then(setGrades).catch((e) => Alert.alert('Erreur', e.message));
  }, [user.id]);

  const avg = grades.length ? grades.reduce((s, g) => s + g.note, 0) / grades.length : 0;

  return (
    <View style={[styles.fill, { backgroundColor: '#F4F6FA' }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{user.name}</Text>
        <Pressable onPress={onLogout}><Text style={styles.headerBtn}>Déconnexion</Text></Pressable>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={[styles.card, { alignItems: 'center' }]}>
          <Text style={styles.label}>Moyenne générale</Text>
          <Text style={styles.avg}>{avg.toFixed(2)} / 20</Text>
        </View>
        {grades.map((g) => (
          <View key={g.module} style={[styles.card, styles.row]}>
            <Text style={styles.module}>{g.module}</Text>
            <Text style={[styles.note, { color: g.note >= 10 ? '#1E7B4D' : '#B3261E' }]}>{g.note}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: '#0E4D64' },
  login: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  brand: { fontSize: 34, fontWeight: '800', color: '#fff', textAlign: 'center' },
  subtitle: { color: '#CFE3EA', textAlign: 'center', marginBottom: 24, marginTop: 4 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 10 },
  label: { fontSize: 13, color: '#6B7686', marginTop: 8, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#D5DBE5', borderRadius: 8, padding: 10, fontSize: 15, color: '#1B2430' },
  button: { backgroundColor: '#0E4D64', borderRadius: 8, padding: 12, alignItems: 'center', marginTop: 16 },
  buttonText: { color: '#fff', fontWeight: '700' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#0E4D64' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  headerBtn: { color: '#fff', fontWeight: '600' },
  avg: { fontSize: 34, fontWeight: '800', color: '#0E4D64' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  module: { fontSize: 16, color: '#1B2430' },
  note: { fontSize: 22, fontWeight: '800' },
});
