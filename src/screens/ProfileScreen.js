import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
    Alert,
    Image,
    RefreshControl,
    SafeAreaView, ScrollView,
    StyleSheet, Text,
    TouchableOpacity,
    View
} from 'react-native';
import { borrarTodo, leerDinero, leerHabitos, leerMinutos } from '../utils/storage';

export default function ProfileScreen() {
    const [loading, setLoading] = useState(false);

    // Datos del Usuario RPG
    const [stats, setStats] = useState({
        dinero: 0,
        minutos: 0,
        habitosCompletados: 0,
        nivel: 1,
        xpTotal: 0,
        clase: "Novato"
    });

    useFocusEffect(
        useCallback(() => {
            cargarPerfil();
        }, [])
    );

    const cargarPerfil = async () => {
        setLoading(true);

        // 1. Cargar datos crudos
        const dinero = await leerDinero() || 0;
        const minutos = await leerMinutos() || 0;
        const habitos = await leerHabitos() || [];

        // 2. Calcular Estadísticas RPG
        const countHabitos = habitos.filter(h => h.completado).length;

        // FÓRMULA DE XP: 
        // 1 minuto = 1 XP
        // 1 hábito = 50 XP
        // $1.000 pesos = 1 XP (para que el dinero no rompa el juego)
        const xpDinero = Math.floor(dinero / 1000);
        const xpHabitos = countHabitos * 50;
        const xpTiempo = minutos;

        const xpTotal = xpDinero + xpHabitos + xpTiempo;

        // FÓRMULA DE NIVEL: Cada 1000 XP subes de nivel
        const nivel = Math.floor(xpTotal / 1000) + 1;

        // Determinar "Clase" según el nivel
        let clase = "Nómada Digital";
        if (nivel >= 5) clase = "Freelancer";
        if (nivel >= 10) clase = "SysAdmin";
        if (nivel >= 20) clase = "Netrunner";
        if (nivel >= 50) clase = "Cyber-Lord";

        setStats({
            dinero,
            minutos,
            habitosCompletados: countHabitos,
            nivel,
            xpTotal,
            clase
        });

        setLoading(false);
    };

    const confirmarBorrado = () => {
        Alert.alert(
            "⚠ ZONA DE PELIGRO",
            "¿Estás seguro de hacer un Factory Reset? Se borrará todo tu dinero, metas, habilidades y progreso. No hay vuelta atrás.",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "SÍ, BORRAR TODO",
                    style: "destructive",
                    onPress: async () => {
                        await borrarTodo();
                        Alert.alert("Reinicio", "Sistema formateado. Reinicia la app.");
                        cargarPerfil(); // Recargar para ver todo en cero
                    }
                }
            ]
        );
    };

    // Barra de progreso hacia el siguiente nivel
    const xpParaSiguienteNivel = stats.nivel * 1000;
    const progresoNivel = (stats.xpTotal % 1000) / 1000 * 100;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={cargarPerfil} tintColor="#38bdf8" />}
            >

                {/* --- TARJETA DE IDENTIDAD --- */}
                <View style={styles.idCard}>
                    <View style={styles.headerRow}>
                        <View style={styles.avatarContainer}>
                            {/* Si no tienes icon.png aun, usa una url externa o un icono */}
                            <Image
                                source={require('../../assets/icon.png')}
                                style={styles.avatarImage}
                                resizeMode="cover"
                            />
                        </View>
                        <View style={styles.idInfo}>
                            <Text style={styles.username}>Nico Soto</Text>
                            <Text style={styles.userClass}>{stats.clase}</Text>
                            <View style={styles.levelBadge}>
                                <Text style={styles.levelText}>LVL {stats.nivel}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Barra de XP Global */}
                    <View style={styles.xpSection}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                            <Text style={styles.xpLabel}>Progreso de Sistema</Text>
                            <Text style={styles.xpValue}>{stats.xpTotal} / {xpParaSiguienteNivel} XP</Text>
                        </View>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: `${progresoNivel}%` }]} />
                        </View>
                    </View>
                </View>

                {/* --- ESTADÍSTICAS (HEXAGONALES SIMULADAS) --- */}
                <Text style={styles.sectionTitle}>Atributos</Text>
                <View style={styles.statsGrid}>

                    {/* INTELIGENCIA (Minutos) */}
                    <View style={styles.statBox}>
                        <View style={[styles.iconCircle, { backgroundColor: 'rgba(56, 189, 248, 0.2)' }]}>
                            <Ionicons name="hardware-chip" size={24} color="#38bdf8" />
                        </View>
                        <Text style={styles.statValue}>{stats.minutos}</Text>
                        <Text style={styles.statLabel}>INT (Mins)</Text>
                    </View>

                    {/* DISCIPLINA (Hábitos) */}
                    <View style={styles.statBox}>
                        <View style={[styles.iconCircle, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
                            <Ionicons name="checkbox" size={24} color="#f59e0b" />
                        </View>
                        <Text style={styles.statValue}>{stats.habitosCompletados}</Text>
                        <Text style={styles.statLabel}>DIS (Hab)</Text>
                    </View>

                    {/* ECONOMÍA (Dinero/1000) */}
                    <View style={styles.statBox}>
                        <View style={[styles.iconCircle, { backgroundColor: 'rgba(34, 197, 94, 0.2)' }]}>
                            <Ionicons name="cash" size={24} color="#22c55e" />
                        </View>
                        <Text style={styles.statValue}>{Math.floor(stats.dinero / 1000)}k</Text>
                        <Text style={styles.statLabel}>ECO (CLP)</Text>
                    </View>

                </View>

                {/* --- OPCIONES DE SISTEMA --- */}
                <Text style={styles.sectionTitle}>Sistema</Text>

                <TouchableOpacity style={styles.optionRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="cloud-upload-outline" size={24} color="#94a3b8" />
                        <Text style={styles.optionText}>Exportar Datos (JSON)</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#64748b" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.optionRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="color-palette-outline" size={24} color="#94a3b8" />
                        <Text style={styles.optionText}>Personalizar Tema</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#64748b" />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.optionRow, { borderBottomWidth: 0 }]} onPress={confirmarBorrado}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="trash-bin-outline" size={24} color="#ef4444" />
                        <Text style={[styles.optionText, { color: '#ef4444' }]}>Factory Reset</Text>
                    </View>
                </TouchableOpacity>

                <Text style={styles.versionText}>KAIRO OS v1.0.4 Beta</Text>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a' },
    content: { padding: 20 },

    // ID CARD
    idCard: { backgroundColor: '#1e293b', borderRadius: 20, padding: 20, marginBottom: 30, borderWidth: 1, borderColor: '#334155' },
    headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    avatarContainer: { width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: '#38bdf8', overflow: 'hidden', marginRight: 20, backgroundColor: '#000' },
    avatarImage: { width: '100%', height: '100%' },
    idInfo: { flex: 1 },
    username: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
    userClass: { color: '#94a3b8', fontSize: 14, marginBottom: 8 },
    levelBadge: { backgroundColor: '#38bdf8', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    levelText: { color: '#0f172a', fontWeight: 'bold', fontSize: 12 },

    xpSection: { marginTop: 10 },
    xpLabel: { color: '#64748b', fontSize: 12, marginBottom: 5 },
    xpValue: { color: '#f8fafc', fontSize: 12, fontWeight: 'bold' },
    progressBarBg: { height: 8, backgroundColor: '#0f172a', borderRadius: 4, overflow: 'hidden' },
    progressBarFill: { height: '100%', backgroundColor: '#38bdf8', borderRadius: 4 },

    // STATS GRID
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#f8fafc', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1 },
    statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
    statBox: { backgroundColor: '#1e293b', width: '30%', padding: 15, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
    iconCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    statValue: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    statLabel: { color: '#64748b', fontSize: 12, marginTop: 2 },

    // OPTIONS
    optionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#334155' },
    optionText: { color: '#cbd5e1', fontSize: 16, marginLeft: 15 },

    versionText: { textAlign: 'center', color: '#475569', marginTop: 30, fontSize: 12, fontFamily: 'monospace' }
});