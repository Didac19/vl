import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { useQuery } from '@tanstack/react-query';
import { Navigation } from 'lucide-react-native';
import { api } from '../../lib/api';
import { theme } from '../../constants/theme';

export default function NearPlacesScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  const { data: routes, isLoading: isNearbyLoading } = useQuery({
    queryKey: ['nearbyRoutes', location?.coords.latitude, location?.coords.longitude],
    queryFn: async () => {
      if (!location) return [];
      const { data } = await api.get('/transport/nearby', {
        params: {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        },
      });
      return data;
    },
    enabled: !!location,
  });

  const centerOnUser = () => {
    if (location && webViewRef.current) {
      const script = `
        window.map.setView([${location.coords.latitude}, ${location.coords.longitude}], 15);
        if (window.userMarker) {
          window.userMarker.setLatLng([${location.coords.latitude}, ${location.coords.longitude}]);
        }
      `;
      webViewRef.current.injectJavaScript(script);
    }
  };

  const getHtmlContent = () => {
    if (!location) return '';

    const routesData = JSON.stringify(routes || []);
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body { margin: 0; padding: 0; }
          #map { height: 100vh; width: 100vw; }
          .user-marker {
            background-color: #3b82f6;
            border: 2px solid white;
            border-radius: 50%;
            width: 15px;
            height: 15px;
            box-shadow: 0 0 5px rgba(0,0,0,0.5);
          }
          .leaflet-popup-content-wrapper {
            border-radius: 12px;
            font-family: sans-serif;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const userLat = ${location.coords.latitude};
          const userLng = ${location.coords.longitude};
          const routes = ${routesData};
          const colors = ['#e11d48', '#2563eb', '#16a34a', '#d97706', '#7c3aed', '#db2777', '#0891b2'];

          const map = L.map('map', {
            zoomControl: false,
            attributionControl: false
          }).setView([userLat, userLng], 15);

          window.map = map;

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19
          }).addTo(map);

          // User Marker
          const userIcon = L.divIcon({
            className: 'user-marker',
            iconSize: [15, 15]
          });
          window.userMarker = L.marker([userLat, userLng], { icon: userIcon }).addTo(map)
            .bindPopup('Tu ubicación')

          // Route Polylines and Markers
          routes.forEach((route, index) => {
            const routeColor = colors[index % colors.length];
            const routeCoords = route.stops.map(stop => [parseFloat(stop.lat), parseFloat(stop.lng)]);
            
            // Draw Polyline
            L.polyline(routeCoords, {
              color: routeColor,
              weight: 5,
              opacity: 0.8,
              lineJoin: 'round'
            }).addTo(map);

            // Add Stop Markers
            route.stops.forEach(stop => {
              const stopLat = parseFloat(stop.lat);
              const stopLng = parseFloat(stop.lng);
              
              const stopIcon = L.divIcon({
                className: 'custom-marker',
                iconSize: [16, 16],
                html: \`<div style="background-color: \${routeColor}; border: 2px solid white; border-radius: 50%; width: 12px; height: 12px; box-shadow: 0 0 3px rgba(0,0,0,0.3);"></div>\`
              });

              L.marker([stopLat, stopLng], { icon: stopIcon })
                .addTo(map)
                .bindPopup(\`
                  <div style="font-family: sans-serif; min-width: 120px;">
                    <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">\${stop.name}</div>
                    <div style="font-size: 12px; color: \${routeColor}; margin-bottom: 2px;">Ruta: \${route.name}</div>
                    <div style="font-size: 11px; color: #666;">\${route.transportType.name}</div>
                  </div>
                \`);
            });
          });
        </script>
      </body>
      </html>
    `;
  };

  if (errorMsg) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.primary.esmeralda} />
        <Text style={styles.loadingText}>Obteniendo tu ubicación...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: getHtmlContent() }}
        style={styles.map}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={theme.colors.primary.esmeralda} />
          </View>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={centerOnUser}>
        <Navigation color="white" size={24} />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cerca de mí</Text>
        <Text style={styles.headerSubtitle}>Explora paradas y rutas conectadas</Text>
      </View>

      {isNearbyLoading && !routes && (
        <View style={styles.loadingOverlayMini}>
          <ActivityIndicator size="small" color={theme.colors.primary.esmeralda} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  map: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: theme.colors.primary.esmeralda,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 16,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  headerTitle: {
    fontFamily: theme.typography.fontFamily.sans,
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.neutral[900],
  },
  headerSubtitle: {
    fontFamily: theme.typography.fontFamily.sans,
    fontSize: 14,
    color: theme.colors.neutral[500],
    marginTop: 2,
  },
  loadingText: {
    marginTop: 10,
    color: theme.colors.neutral[500],
    fontFamily: theme.typography.fontFamily.sans,
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    padding: 20,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlayMini: {
    position: 'absolute',
    bottom: 100,
    left: '50%',
    marginLeft: -20,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 20,
    elevation: 2,
  }
});
