import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { issueService } from '../services';

export default function IssueDetailScreenWeb({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const issueId = route?.params?.issueId;
  const [issue, setIssue] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await issueService.getIssueById(issueId);
        setIssue(res.issue || res);
      } catch (err) {
        console.error('Error loading issue (web):', err);
      } finally {
        setLoading(false);
      }
    };
    if (issueId) load();
  }, [issueId]);

  if (loading) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}> 
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Loading issue...</Text>
      </View>
    );
  }

  if (!issue) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}> 
        <Ionicons name="alert-circle-outline" size={48} color="#f43f5e" />
        <Text style={{ marginTop: 8 }}>Issue not found</Text>
      </View>
    );
  }

  const openMaps = () => {
    if (!issue.location) return;
    const { latitude, longitude } = issue.location;
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    Linking.openURL(url).catch(err => console.error('Failed to open maps:', err));
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top }]}> 
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#334155" />
        </TouchableOpacity>
        <Text style={styles.title}>{issue.title}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{issue.description}</Text>
      </View>

      {issue.mediaUrls && issue.mediaUrls.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Images</Text>
          <ScrollView horizontal>
            {issue.mediaUrls.map((u: string, i: number) => (
              <Image key={i} source={{ uri: u }} style={styles.image} />
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location</Text>
        <Text style={styles.locationText}>{issue.location?.address || issue.location?.district || 'Unknown'}</Text>
        {issue.location?.latitude && (
          <TouchableOpacity onPress={openMaps} style={styles.mapButton}>
            <Ionicons name="map" size={18} color="#fff" />
            <Text style={styles.mapButtonText}>Open in Google Maps</Text>
          </TouchableOpacity>
        )}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  backButton: { marginRight: 12 },
  title: { fontSize: 18, fontWeight: '600', flex: 1 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  description: { fontSize: 14, color: '#334155' },
  image: { width: 200, height: 150, marginRight: 8, borderRadius: 8 },
  locationText: { fontSize: 14, color: '#334155', marginBottom: 8 },
  mapButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0d9488', padding: 8, borderRadius: 6 },
  mapButtonText: { color: '#fff', marginLeft: 8 }
});
