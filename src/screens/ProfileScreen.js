import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>

                {/* Encabezado del Perfil */}
                <View style={styles.header}>
                    <View style={styles.avatarContainer}>
                        <Ionicons name="person" size={50} color="#cbd5e1" />
                    </View>
                    <Text style={styles.username}>Nico Soto</Text>
                    <Text style={styles.role}>Desarrollador Full Stack</Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>PRO USER</Text>
                    </View>
                </View>

                {/* Estadísticas */}
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>12</Text>
                        <Text style={styles.statLabel}>Proyectos</Text>
                    </View>
                    <View style={[styles.statItem, styles.statBorder]}>
                        <Text style={styles.statNumber}>85%</Text>
                        <Text style={styles.statLabel}>Nivel de Vida</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>4.8</Text>
                        <Text style={styles.statLabel}>Racha Días</Text>
                    </View>
                </View>

                {/* Menú de Opciones */}
                <View style={styles.menuWrapper}>
                    <Text style={styles.sectionTitle}>Configuración</Text>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuIcon}>
                            <Ionicons name="settings-outline" size={22} color="#38bdf8" />
                        </View>
                        <Text style={styles.menuText}>Ajustes de la App</Text>
                        <Ionicons name="chevron-forward" size={20} color="#475569" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuIcon}>
                            <Ionicons name="notifications-outline" size={22} color="#38bdf8" />
                        </View>
                        <Text style={styles.menuText}>Notificaciones</Text>
                        <Ionicons name="chevron-forward" size={20} color="#475569" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuIcon}>
                            <Ionicons name="moon-outline" size={22} color="#38bdf8" />
                        </View>
                        <Text style={styles.menuText}>Modo Oscuro</Text>
                        <Text style={{ color: '#64748b', marginRight: 10 }}>Activado</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]}>
                        <View style={[styles.menuIcon, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                            <Ionicons name="log-out-outline" size={22} color="#ef4444" />
                        </View>
                        <Text style={[styles.menuText, { color: '#ef4444' }]}>Cerrar Sesión</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a' },
    content: { padding: 20, alignItems: 'center' },

    // Header
    header: { alignItems: 'center', marginBottom: 30, width: '100%' },
    avatarContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#38bdf8', marginBottom: 15 },
    username: { color: '#f8fafc', fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
    role: { color: '#94a3b8', fontSize: 16, marginBottom: 10 },
    badge: { backgroundColor: 'rgba(34, 197, 94, 0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: '#22c55e' },
    badgeText: { color: '#22c55e', fontSize: 10, fontWeight: 'bold' },

    // Stats
    statsContainer: { flexDirection: 'row', backgroundColor: '#1e293b', borderRadius: 16, padding: 20, width: '100%', justifyContent: 'space-between', marginBottom: 30 },
    statItem: { alignItems: 'center', flex: 1 },
    statBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#334155' },
    statNumber: { color: '#f8fafc', fontSize: 20, fontWeight: 'bold', marginBottom: 5 },
    statLabel: { color: '#64748b', fontSize: 12 },

    // Menu
    menuWrapper: { width: '100%' },
    sectionTitle: { color: '#94a3b8', fontSize: 14, marginBottom: 15, marginLeft: 10, textTransform: 'uppercase', letterSpacing: 1 },
    menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', padding: 15, borderRadius: 12, marginBottom: 10 },
    menuIcon: { width: 40, height: 40, backgroundColor: 'rgba(56, 189, 248, 0.1)', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    menuText: { flex: 1, color: '#f1f5f9', fontSize: 16, fontWeight: '500' },
});